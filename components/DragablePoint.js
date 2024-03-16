import { Graphics, Circle, Text, Application, Point, GraphicsContext, Rectangle, BitmapText, Filter } from 'pixi.js';
import Event from '../event/Event.js';
import Data from "../config/data.json"
import { app } from '../main.js';

export class DragablePoint extends Graphics {

  static graphicContext = new GraphicsContext().circle(0, 0, Data.pointRadius).fill(Data.slate50).circle(0, 0, Data.pointRadius*0.80).fill(Data.slate950).circle(0, 0, Data.pointRadius*0.40).fill(Data.slate50);

  /**
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} radius radius of point
   * @param {string} color color of point
   */
  constructor(x, y) {
    super();
    this.context = DragablePoint.graphicContext;
    this.interactive = false;
    this.hitArea = new Rectangle(0,0,0,0);
       
    this.onMove = new Event(this);
    this.setPosition(x, y);

  }

  /**
   * @param {number} x new x position
   * @param {number} y new y position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y; 
    if(this.onMove) {
      this.onMove.notify({x: this.x, y: this.y})
    }
  }


  /**
   * Make this point always follow the center of two other points
   * @param {DragablePoint} p1 first point
   * @param {DragablePoint} p2 second point
   */
  setFollowCenterOf(p1, p2) {
    this.x = (p1.x + p2.x) / 2;
    this.y = (p1.y + p2.y) / 2;

    p1.onMove.attach((sender, {x, y}) => {
      this.setPosition((x + p2.x) / 2, (y + p2.y) / 2);
    });
    p2.onMove.attach((sender, {x, y}) => {
      this.setPosition((p1.x + x) / 2, (p1.y + y) / 2);
    });
  }

  addOnMoveListener(callback) {
    this.onMove.attach(callback);
  }

  /**
   * Set this point to be dragable with cursor
   * @param {Application} app the dependency to to the app is needed to add the event listener
   */
  setDragable(app) {
    this.app = app;
    this.on('pointerdown', this.onDragStart, this);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Circle(0, 0, Data.pointRadius*4);
    this.on('pointerover', () => {
      this.alpha = 0.75;
      // this.tint = Data.indigo600;
    });
    this.on('pointerout', () => {
      this.alpha = 1;
      // this.tint = 0xFFFFFF;
    });
  }

  // Have to resort to static variable because for some reason, the 'this' context is lost in the onDragMove function
  /** @type {DragablePoint} */
  static currentTarget = null;

  /**
   * Start dragging this point. For those who don't know
   */
  onDragStart(){
    DragablePoint.currentTarget = this;
    this.app.stage.on('pointermove', DragablePoint.onDragMove);
  }
  static onDragMove(event){
    if (DragablePoint.currentTarget){
      // DragablePoint.currentTarget.setPosition(event.data.global.x, -event.data.global.y + app.renderer.height);
      
      // Handle zoom on mouse wheel
      const zoomX = app.stage.scale.x;
      const zoomY = app.stage.scale.y;
      const mouseX = event.data.global.x;
      const mouseY = event.data.global.y;

      const newX = (mouseX - app.stage.x) / zoomX;
      const newY = (mouseY - app.stage.y) / zoomY;
      DragablePoint.currentTarget.setPosition(newX, newY);
      
    }
  }
  static onDragEnd(){
    if(DragablePoint.currentTarget){
      DragablePoint.currentTarget.app.stage.off('pointermove', this.onDragMove);
      DragablePoint.currentTarget = null;
    }
  }

}