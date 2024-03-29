import { Point } from "pixi.js";
import { lerp } from "./Math";
import SyncablePoint from "./SyncablePoint";

/**
 * Syncable to the center of two points
 */
export default class CenterPoint extends SyncablePoint {

  /**
   * @param {SyncablePoint} point1 
   * @param {SyncablePoint} point2 
   */
  constructor(point1, point2) {
    super(point1, point2);
    this.sync();
  }

  // override
  /**
   * Update the position of this point to be in the center of both points.
   */
  sync() {
    this.x = (this.point1.x + this.point2.x)/2;
    this.y = (this.point1.y + this.point2.y)/2;
  }
}