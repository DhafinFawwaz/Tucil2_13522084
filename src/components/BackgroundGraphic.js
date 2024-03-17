import { Application, Container, Graphics, Text } from "pixi.js";
import Data from "../config/data.json"
import { roundTo } from "../beziercurve/Math";
import { Viewport } from "pixi-viewport";

// Draw coordinate system
export default class BackgroundGraphic extends Graphics {
  
  static initialMainLineWidth = 4;
  static initialLineWidth = 2;
  static initialRange = 100;
  static lineAmount = 10;

  /**
   * Draw a coordinate system in the background
   * @param {Viewport} viewport 
   */
  constructor(viewport) {
    super();
    this.viewport = viewport;
    this.currentZoom = 1;
    this.range = BackgroundGraphic.initialRange;
    this.lineWidth = BackgroundGraphic.initialLineWidth;
    this.mainLineWidth = BackgroundGraphic.initialMainLineWidth;
    this.refreshBackgroundGraphics();
    this.refreshCoordinates();
  }

  /** Draw the background */
  refreshBackgroundGraphics() {
    const width = this.viewport.worldWidth;
    const height = this.viewport.worldWidth;

    this.clear();

    // Absis and ordinat line
    this.lineStyle({width: this.mainLineWidth, color: Data.slate700})
      .moveTo(-width, 0).lineTo(width, 0)
      .moveTo(0, -height).lineTo(0, height)
    
    this.lineStyle({width: this.lineWidth, color: Data.slate800})

    // Draw the grid lines
    for(let i = -width/2; i < width/2; i += this.range) {
      this.moveTo(i, -height).lineTo(i, height);
    }
    for(let i = -height/2; i < height/2; i += this.range) {
      this.moveTo(-width, i).lineTo(width, i);
    }
  }

  refreshCoordinates() {
    const width = this.viewport.worldWidth;
    const height = this.viewport.worldWidth;

    this.removeAllText();
    // Absis text
    for(let i = -width/2; i < width/2; i += this.range) {
      const text = this.createText(i);
      text.anchor.set(0, 1);
      text.x = i;
      text.y = 0;
      this.addChild(text);
    }
    // Ordinat text
    for(let i = -height/2; i < height/2; i += this.range) {
      const text = this.createText(-i); // handle negative
      text.anchor.set(0, 1);
      text.x = 0;
      text.y = i;
      this.addChild(text);
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
   * @param {*} zoomFactor 
   * @returns 
   */
  static getNewRange(zoom) {
    return BackgroundGraphic.initialRange * Math.pow(10, -Math.ceil(Math.log10(zoom)-1)); 
  }

  /**
   * Rescale based on zoom
   * @param {number} zoom zoom factor
   */
  zoomRescale(zoom) {
    const newRange = BackgroundGraphic.getNewRange(zoom);
    // console.log("currentZoom: ", this.currentZoom, "\n\nzoom: ", zoom, "\n\nnewRange: ", newRange)

    const newScale = 1 / zoom;
    this.lineWidth = BackgroundGraphic.initialLineWidth / zoom;
    this.mainLineWidth = BackgroundGraphic.initialMainLineWidth / zoom;

    if(newRange !== this.range) {
      this.range = newRange;
      this.refreshCoordinates();
    }
    // if(this.currentZoom / 5 > zoom) {
    //   this.currentZoom = zoom;
    //   this.range = newRange;
    //   this.refreshCoordinates();
    // }
    // else if(this.currentZoom * 5 < zoom) {
    //   this.currentZoom = zoom;
    //   this.range = newRange;
    //   this.refreshCoordinates();
    // }

    this.refreshBackgroundGraphics();
    
    this.children.forEach((child) => {
      child.scale.x = newScale;
      child.scale.y = newScale;
    });
  }

}