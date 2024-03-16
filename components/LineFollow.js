import { Graphics } from "pixi.js";
import { DragablePoint } from "./DragablePoint";
import Data from "../config/data.json"


export class LineFollow extends Graphics {

  /**
   * Refresh this line to follow both the targeted points
   */
  update() {
    this.clear();
    this.moveTo(this.p1.x, this.p1.y);
    this.lineTo(this.p2.x, this.p2.y);
    this.fill(this.color);
    this.stroke({ width: Data.lineWidth, color: this.color });
  }

  /**
   * 
   * @param {DragablePoint} p1 first point
   * @param {DragablePoint} p2 second point
   * @param {string} color color
   */
  constructor(p1, p2, color) {
    super();
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
    this.update();
    
    this.p1.onMove.attach(() => {
      this.update();
    });
    this.p2.onMove.attach(() => {
      this.update();
    });
  }
}