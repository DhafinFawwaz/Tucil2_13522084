import { Application, Container, Graphics, Text } from "pixi.js";
import Data from "../config/data.json"
import { roundTo } from "../beziercurve/Math";
import { getHalfAppHeight, getHalfAppWidth } from "../main";
import { Viewport } from "pixi-viewport";

// Draw coordinate system
export default class BackgroundGraphic extends Graphics {
  /**
   * Draw a coordinate system in the background
   * @param {Viewport} viewport 
   */
  constructor(viewport) {
    super();
    this.viewport = viewport;
    this.range = 50;
    this.refreshBackground();
  }

  /** Draw the background */
  refreshBackground() {
    const width = this.viewport.worldWidth;
    const height = this.viewport.worldWidth;

    this.clear();
    this.removeAllText();

    // Absis and ordinat line

    this.lineStyle({width: 2, color: Data.slate700})
      .moveTo(-width, 0).lineTo(width, 0)
      .moveTo(0, -height).lineTo(0, height)
    
    this.lineStyle({width: 1, color: Data.slate800})

    // Absis text
    for(let i = -width/2; i < width/2; i += this.range) {
      const text = this.createText(i);
      text.anchor.set(0, 1);
      text.x = i;
      text.y = getHalfAppHeight();
      this.addChild(text);
    }
    // Ordinat text
    for(let i = -height/2; i < height/2; i += this.range) {
      const text = this.createText(i);
      text.anchor.set(0, 1);
      text.x = getHalfAppHeight();
      text.y = i;
      this.addChild(text);
    }


    // Draw the grid lines. handle  getHalfAppHeight()
    for(let i = -width; i < width; i += this.range) {
      this.moveTo(i, -height).lineTo(i, height);
    }
    for(let i = -height; i < height; i += this.range) {
      this.moveTo(-width, i).lineTo(width, i);
    }
  }

  /**
   * @param {number} number 
   */
  createText(number) {
    const text = new Text((number).toString(), {
      fontSize: Data.pointFontSize,
      fill: Data.slate50
    });
    text.resolution = 2;
    return text;
  }

  /** Remove all input coordinate text */
  removeAllText() {
    this.removeChildren();
  }

  /**
   * @param {number} fontSize 
   */
  resizeAllText(fontSize) {
    this.children.forEach((child) => {
        child.style.fontSize = fontSize;
    });
  }
}