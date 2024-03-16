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
    this.refreshBackground();
  }

  /** Draw the background */
  refreshBackground() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    this.clear();
    this.removeAllText();
    for(let i = 0; i < width; i += this.range) {
      this.moveTo(i, 0);
      this.lineTo(i, height);
      const text = this.createText(i);
      text.anchor.set(0, 1);
      text.x = i;
      text.y = 0;
      this.addChild(text);
    }
    this.moveTo(0, 0.5); // bottom horizontal line
    this.lineTo(width, 0.5);
    for(let i = this.range; i < height; i += this.range) {
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

  /** Remove all input coordinate text */
  removeAllText() {
    this.removeChildren();
  }

  /**
   * 
   * @param {number} fontSize 
   */
  resizeAllText(fontSize) {
    this.children.forEach((child) => {
      child.style.fontSize = fontSize;
    });
  }
}