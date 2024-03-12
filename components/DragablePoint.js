import { Graphics, Circle, Text, Application } from 'pixi.js';
import Event from '../event/Event.js';

export class DragablePoint extends Graphics {
  /**
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} radius radius of point
   * @param {string} color color of point
   */
  constructor(x, y, radius, color) {
    super();
    this.radius = radius;
    this.circle(0, 0, radius);
    this.fill(color);

    this.circle(0, 0, radius*0.80);
    this.cut();

    this.circle(0, 0, radius*0.45);
    this.fill(color);
       
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
    if(this.onMove){
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

  /**
   * Set this point to be dragable with cursor
   * @param {Application} app the dependency to to the app is needed to add the event listener
   */
  setDragable(app) {
    this.app = app;
    this.on('pointerdown', this.onDragStart, this);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Circle(0, 0, this.radius);
    this.on('pointerover', () => {
      this.alpha = 0.75;
    });
    this.on('pointerout', () => {
      this.alpha = 1;
    });
  }

  // Have to resort to static variable because for some reason, the 'this' context is lost in the onDragMove function
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
      DragablePoint.currentTarget.setPosition(event.data.global.x, event.data.global.y);
    }
  }
  static onDragEnd(){
    if(DragablePoint.currentTarget){
      DragablePoint.currentTarget.app.stage.off('pointermove', this.onDragMove);
      DragablePoint.currentTarget = null;
    }
  }

}