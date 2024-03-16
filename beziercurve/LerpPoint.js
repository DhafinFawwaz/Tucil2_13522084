import { Point } from "pixi.js";
import { lerp } from "./Math";
import SyncablePoint from "./SyncablePoint";

/**
 * Syncable to the center of two points
 */
export default class LerpPoint extends SyncablePoint {

  constructor(point1, point2, progress) {
    super(point1, point2);
    this.progress = progress;
  }
  
  /**
   * Update the position of this point to be in the center of both points.
   */
  sync() { // override
    this.x = lerp(this.point1.x, this.point2.x, this.progress);
    this.y = lerp(this.point1.y, this.point2.y, this.progress);
  }
}