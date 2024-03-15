import { Application, Graphics, Text } from "pixi.js";
import Data from "../config/data.json"

// Draw coordinate system
export default class BackgroundGraphic extends Graphics {
  /**
   * Draw a coordinate system in the background
   * @param {Application} app 
   */
  constructor(app) {
    super();
    this.app = app;
    this.range = 50;
    const width = app.screen.width;
    const height = app.screen.height;

    this.clear();
    for(let i = 0; i < width; i += this.range) {
      this.moveTo(i, 0);
      this.lineTo(i, height);
      const text = this.createText(i);
      text.x = i;
      text.y = 0;
      this.addChild(text);
    }
    for(let i = 0; i < height; i += this.range) {
      this.moveTo(0, i);
      this.lineTo(width, i);
      const text = this.createText(i);
      text.x = 0;
      text.y = i;
      this.addChild(text);
    }
    this.stroke({ width: 1, color: Data.slate800 });
  }

  /**
   * @param {number} number 
   */
  createText(number) {
    const text = new Text({
      text: number.toString(),
      style: {
        fontSize: Data.pointFontSize,
        fill: Data.slate50
      }
    });
    text.scale.y = -1;
    return text;
  }
}