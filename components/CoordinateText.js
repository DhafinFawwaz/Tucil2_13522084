import { BitmapText } from "pixi.js";
import { DragablePoint } from "./DragablePoint";
import Data from "../config/data.json";


export class CoordinateText extends BitmapText {
  constructor() {
    super({
      style: {
        fontSize: Data.pointFontSize,
      }
    });
    this.scale.y = -1;
    this.name = "";
  }

  /**
   * Attach this text to a draggable point
   * @param {DragablePoint} point Point to attach to 
   * @param {number} offsetX Offset x
   * @param {number} offsetY Offset x
   */
  attachToDraggablePoint(point, offsetX, offsetY, name) {
    point.addChild(this);
    this.name = name;
    this.x = offsetX;
    this.y = -offsetY;
    this.setText(point.x, point.y);
    point.onMove.attach((sender, {x, y}) => {
      this.setText(x, y);
    });
  }

  /**
   * @param {number} x 
   * @param {number} y 
   */
  setText(x, y){
    this.text = `${this.name}(${x.toFixed(2)}, ${y.toFixed(2)})`;
  }

  rename(name) {
    this.name = name;
    this.setText(this.x, this.y);
  }
}