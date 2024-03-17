import { Graphics, Circle, Text, Application, Point, Rectangle, BitmapText, Filter } from 'pixi.js';
// import { GraphicsContext } from 'pixi.js';
import Event from '../event/Event.js';
import Data from "../config/data.json"
import { app } from '../main.js';
import { Viewport } from 'pixi-viewport';
import SyncablePoint from '../beziercurve/SyncablePoint.js';

export class DragablePoint extends Graphics {

  static pointRadius = 10;

  /**
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} radius radius of point
   * @param {string} color color of point
   */
  constructor(x, y) {
    super();
    this.hitArea = new Rectangle(0,0,0,0);
       
    this.onMove = new Event(this);
    this.setPosition(x, y);
    this.draw();
  }

  draw() {
    this.clear();
    this.beginFill(Data.slate50).drawCircle(0, 0, DragablePoint.pointRadius)
      .beginFill(Data.slate950).drawCircle(0, 0, DragablePoint.pointRadius*0.80)
      .beginFill(Data.slate50).drawCircle(0, 0, DragablePoint.pointRadius*0.40)
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


  /**
   * Rescale based on zoom
   * @param {number} zoom zoom factor
   */
  zoomRescale(zoom) {
    const newZoom = 1/zoom;
    this.scale.x = newZoom;
    this.scale.y = newZoom;
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

      // Value will decrease when zoom out
      const zoom = DragablePoint.currentTarget.viewport.scale.x;

      // Coordinate of whatever the coordinate of the top left corner of the viewport currently is, even when zooming.
      const left = DragablePoint.currentTarget.viewport.left;
      const top = DragablePoint.currentTarget.viewport.top;
      
      // Coordinate of the mouse on the screen, value won't change when zooming
      const mouseX = event.x;
      const mouseY = event.y;

      // This is some epic meth. Proud of this 🙂🙂🙂
      const newX = mouseX/zoom + left;
      const newY = mouseY/zoom + top;

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

}