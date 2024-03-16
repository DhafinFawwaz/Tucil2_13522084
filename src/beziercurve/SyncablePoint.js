import { Point } from "pixi.js";
import { lerp } from "./Math";

/**
 * Contain position and reference to both points. Call sync() to update the position of this point to be in the center of both points.
 */
// Point <- SyncablePoint <- (CenterPoint, LerpPoint)
export default class SyncablePoint extends Point {
  /**
   * @param {SyncablePoint} point1 
   * @param {SyncablePoint} point2 
   */
  constructor(point1, point2) {
    super(0, 0);

    /** @type {SyncablePoint} */
    this.point1 = point1;
    /** @type {SyncablePoint} */
    this.point2 = point2;
  }

  sync() {
    console.log("Shouldn't be here");
  }

  getProgressPoint(progress) {
    return new Point(lerp(this.point1.x, this.point2.x, progress), lerp(this.point1.y, this.point2.y, progress));
  }
}