import { Point } from "pixi.js";
import { lerp } from "./Math";
import SyncablePoint from "./SyncablePoint";

/**
 * Syncable to a certain percentage of two points
 */
export default class LerpPoint extends SyncablePoint {

  /**
   * @param {SyncablePoint} point1 
   * @param {SyncablePoint} point2 
   * @param {number} progress 
   */
  constructor(point1, point2, progress) {
    super(point1, point2);
    this.progress = progress;
    this.sync();
  }
  
  /**
   * Update the position of this point to be in the center of both points.
   */
  sync() { // override
    this.x = lerp(this.point1.x, this.point2.x, this.progress);
    this.y = lerp(this.point1.y, this.point2.y, this.progress);
  }
}