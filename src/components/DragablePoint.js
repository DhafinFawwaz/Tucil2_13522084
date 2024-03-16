import { Graphics, Circle, Text, Application, Point, Rectangle, BitmapText, Filter } from 'pixi.js';
// import { GraphicsContext } from 'pixi.js';
import Event from '../event/Event.js';
import Data from "../config/data.json"
import { app } from '../main.js';
import { Viewport } from 'pixi-viewport';

export class DragablePoint extends Graphics {

  // static graphicContextWhite = new GraphicsContext().circle(0, 0, Data.pointRadius).fill(Data.slate50).circle(0, 0, Data.pointRadius*0.80).fill(Data.slate950).circle(0, 0, Data.pointRadius*0.40).fill(Data.slate50);
  // static graphicContextYellow = new GraphicsContext().circle(0, 0, Data.pointRadius).fill(Data.yellow400).circle(0, 0, Data.pointRadius*0.80).fill(Data.slate950).circle(0, 0, Data.pointRadius*0.40).fill(Data.yellow400);
  
  /**
   * @param {number} radius 
   */
  static resizeGraphicContext(radius) {
    // DragablePoint.graphicContextWhite = new GraphicsContext().circle(0, 0, radius).fill(Data.slate50).circle(0, 0, radius*0.80).fill(Data.slate950).circle(0, 0, radius*0.40).fill(Data.slate50);
    // DragablePoint.graphicContextYellow = new GraphicsContext().circle(0, 0, radius).fill(Data.yellow400).circle(0, 0, radius*0.80).fill(Data.slate950).circle(0, 0, radius*0.40).fill(Data.yellow400);
  }

  /**
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} radius radius of point
   * @param {string} color color of point
   */
  constructor(x, y) {
    super();
    // this.context = DragablePoint.graphicContextWhite;
    this.interactive = false;
    this.hitArea = new Rectangle(0,0,0,0);
       
    this.onMove = new Event(this);
    this.setPosition(x, y);
    this.draw();
  }

  draw() {
    this.clear();
    this.beginFill(Data.slate50).drawCircle(0, 0, Data.pointRadius)
      .beginFill(Data.slate950).drawCircle(0, 0, Data.pointRadius*0.80)
      .beginFill(Data.slate50).drawCircle(0, 0, Data.pointRadius*0.40)
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
   * @param {Viewport} viewport get zoom percent
   */
  setDragable(app, viewport) {
    this.app = app;
    this.viewport = viewport;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Circle(0, 0, Data.pointRadius*4);
    this.on('pointerover', () => {
      this.alpha = 0.75;
    });
    this.on('pointerout', () => {
      this.alpha = 1;
    });
    this.on('pointerdown', () => this.onDragStart());
    this.on('pointerup', () => this.onDragEnd());
  }

  // Have to resort to static variable because for some reason, the 'this' context is lost in the onDragMove function
  /** @type {DragablePoint} */
  static currentTarget = null;

  /**
   * Start dragging this point. For those who don't know
   */
  onDragStart(){
    DragablePoint.currentTarget = this;
    this.viewport.drag({
      pressDrag: false
    })
    this.app.renderer.view.addEventListener('pointermove', DragablePoint.onDragMove);
  }
  static onDragMove(event){
    if (DragablePoint.currentTarget){
      // Handle zoom on mouse wheel
      const zoom = DragablePoint.currentTarget.viewport.scale.x;
      const mouseX = event.x + DragablePoint.currentTarget.viewport.left;
      const mouseY = event.y + DragablePoint.currentTarget.viewport.top;

      const newX = (mouseX) / 1;
      const newY = (mouseY) / 1;

      DragablePoint.currentTarget.setPosition(newX, newY);
    }
  }
  onDragEnd(){
    if(DragablePoint.currentTarget){
      DragablePoint.currentTarget.app.renderer.view.removeEventListener('pointermove', DragablePoint.onDragMove);
      DragablePoint.currentTarget.viewport.drag({
        pressDrag: true
      })
      DragablePoint.currentTarget = null;
    }
  }

  updateContext() {
    // this.clear();
    // this.context = DragablePoint.graphicContextWhite;
  }

}