import { Graphics, Point, Text } from "pixi.js";
import Data from "../config/data.json"
import { Viewport } from "pixi-viewport";

// Draw coordinate system
export default class BackgroundGraphic extends Graphics {
  
  static initialMainLineWidth = 4;
  static initialLineWidth = 2;
  static initialRangeWidth = 1;

  /**
   * Draw a coordinate system in the background
   * @param {Viewport} viewport 
   */
  constructor(viewport) {
    super();
    this.viewport = viewport;
    this.currentZoom = 1;
    this.lineWidth = BackgroundGraphic.initialLineWidth;
    this.mainLineWidth = BackgroundGraphic.initialMainLineWidth;
    this.textAnchor = new Point(0, 1);
    this.refresh();
  }

  /** Draw the background */
  refresh() {
    const width = this.viewport.screenWidthInWorldPixels;
    const height = this.viewport.screenHeightInWorldPixels;
    const length = Math.max(width, height);

    const rangeWidth = Math.max(this.getRoundedRange(BackgroundGraphic.initialRangeWidth/this.viewport.scale.x * 100), 1);

    this.clear();

    // Absis and ordinat line
    this.lineStyle({width: this.mainLineWidth, color: Data.slate700})
      .moveTo(-length, 0).lineTo(length, 0)
      .moveTo(0, -length).lineTo(0, length)
    
    this.lineStyle({width: this.lineWidth, color: Data.slate800})

    this.removeAllText();

    this.drawLineAndCoordinateByRange(0, 0, Math.floor(rangeWidth), length, length);
  }

  /**
   * Always round number to nearest 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, etc
   * @param {number} number
   * @returns 
   */
  getRoundedRange(number) {
    const log10 = Math.log10(number);
    const floor = Math.floor(log10);
    const remainder = log10 - floor;
    let base = 1;
    if(remainder < Math.log10(2)) {
      base = 1;
    } else if(remainder < Math.log10(5)) {
      base = 2;
    } else {
      base = 5;
    }
    return base * Math.pow(10, floor);
  }


  /**
   * Draw from center
   * @param {number} centerX 
   * @param {number} centerY 
   * @param {number} range 
   * @param {number} width 
   * @param {number} height 
   */
  drawLineAndCoordinateByRange(centerX, centerY, range, width, height) {
    this.drawLineByRange(centerX, centerY, range, width, height);
    this.drawCoordinateByRange(centerX, centerY, range, width, height);
  }

  /**
   * Draw line from center
   * @param {number} centerX 
   * @param {number} centerY 
   * @param {number} range 
   * @param {number} width 
   * @param {number} height 
   */
  drawLineByRange(centerX, centerY, range, width, height) {
    for(let i = centerX; i < width; i += range) {
      this.moveTo(i, -height).lineTo(i, height);
    }
    for(let i = centerX; i >= -width; i -= range) {
      this.moveTo(i, -height).lineTo(i, height);
    }

    for(let i = centerY; i < height; i += range) {
      this.moveTo(-width, i).lineTo(width, i);
    }
    for(let i = centerY; i >= -height; i -= range) {
      this.moveTo(-width, i).lineTo(width, i);
    }
  }

  /**
   * Draw coordinate from center
   * @param {number} centerX 
   * @param {number} centerY 
   * @param {number} range 
   * @param {number} width 
   * @param {number} height 
   */
  drawCoordinateByRange(centerX, centerY, range, width, height) {
    const newScale = 1 / this.currentZoom;
    for(let i = centerX; i < width; i += range) {
      const text = this.createText(i);
      text.x = i;
      text.y = 0;
      text.scale.x = newScale;
      text.scale.y = newScale;
      this.addChild(text);
    }
    for(let i = centerX; i >= -width; i -= range) {
      const text = this.createText(i);
      text.x = i;
      text.y = 0;
      text.scale.x = newScale;
      text.scale.y = newScale;
      this.addChild(text);
    }

    for(let i = centerY; i < height; i += range) {
      const text = this.createText(-i); // Flip Y
      text.x = 0;
      text.y = i;
      text.scale.x = newScale;
      text.scale.y = newScale;
      this.addChild(text);
    }
    for(let i = centerY; i >= -height; i -= range) {
      const text = this.createText(-i); // Flip Y
      text.x = 0;
      text.y = i;
      text.scale.x = newScale;
      text.scale.y = newScale;
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
    text.anchor.set(this.textAnchor.x, this.textAnchor.y);
    return text;
  }

  /** Remove all input coordinate text */
  removeAllText() {
    this.removeChildren();
  }


  /**
   * Rescale based on zoom
   * @param {number} zoom zoom factor
   */
  zoomRescale(zoom) {
    this.lineWidth = BackgroundGraphic.initialLineWidth / zoom;
    this.mainLineWidth = BackgroundGraphic.initialMainLineWidth / zoom;
    this.currentZoom = zoom;
    this.refresh();
  }

  /**
   * @param {number} {x, y} center position 
   */
  updateTextAnchor({x, y}) {
    if(x >= 0 && y >= 0) {
      x = 0; y = 0;
    } else if(x < 0 && y >= 0) {
      x = 1; y = 0;
    } else if(x < 0 && y < 0) {
      x = 1; y = 1;
    } else if(x >= 0 && y < 0) {
      x = 0; y = 1;
    }
    if(this.textAnchor.x !== x || this.textAnchor.y !== y) {
      this.textAnchor.set(x, y);
      this.children.forEach(child => {
        child.anchor.set(x, y);
      });
    }
  }

}