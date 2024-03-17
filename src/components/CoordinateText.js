import { BitmapText, Text } from "pixi.js";
import { DragablePoint } from "./DragablePoint";
import Data from "../config/data.json";


export class CoordinateText extends Text {
  constructor() {
    super("", {
      fontSize: Data.pointFontSize,
      fill: Data.slate50,
    });
    this.label = "";
    this.resolution = 2;
  }

  /**
   * Attach this text to a draggable point
   * @param {DragablePoint} point Point to attach to 
   * @param {number} offsetX Offset x
   * @param {number} offsetY Offset x
   */
  attachToDraggablePoint(point, offsetX, offsetY, name) {
    point.addChild(this);
    this.label = name;
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
    y *= -1; // Flip y
    this.text = `${this.label}(${x.toFixed(2)}, ${y.toFixed(2)})`;
  }

  rename(name) {
    this.label = name;
  }

  /** set color to yellow */
  setYellow() {
    this.style.fill = Data.yellow400;
  }


  /**
   * Rescale based on zoom
   * @param {number} zoom zoom factor
   */
  zoomRescale(zoom) {
    const newZoom = 1 / zoom;
    this.scale.x = newZoom;
    this.scale.y = newZoom;
  }
}