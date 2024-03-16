import { Application, Graphics, Text } from "pixi.js";
import Data from "../config/data.json"
import { roundTo } from "../beziercurve/Math";
import { getHalfAppHeight, getHalfAppWidth } from "../main";

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

    // Absis and ordinat line
    this.moveTo(0, getHalfAppHeight());
    this.lineTo(width, getHalfAppHeight());
    this.moveTo(getHalfAppHeight(), 0);
    this.lineTo(getHalfAppHeight(), height);
    this.stroke({ width: 2, color: Data.slate700 });
    // Absis text
    for(let i = this.range; i < width; i += this.range) {
      const text = this.createText(i-getHalfAppHeight());
      text.anchor.set(0, 1);
      text.x = i;
      text.y = getHalfAppHeight();
      this.addChild(text);
    }
    // Ordinat text
    for(let i = this.range; i < height; i += this.range) {
      const text = this.createText(i-getHalfAppHeight());
      text.anchor.set(0, 1);
      text.x = getHalfAppHeight();
      text.y = i;
      this.addChild(text);
    }


    // Draw the grid lines. handle  getHalfAppHeight()
    for(let i = this.range; i < width; i += this.range) {
      this.moveTo(i, 0);
      this.lineTo(i, height);
    }
    for(let i = this.range; i < height; i += this.range) {
      this.moveTo(0, i);
      this.lineTo(width, i);
    }
    this.stroke({ width: 1, color: Data.slate800 });
  }

  /**
   * @param {number} number 
   */
  createText(number) {
    const text = new Text({
      text: (number).toString(),
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