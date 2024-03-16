import { Point } from "pixi.js";
import { lerp } from "./Math";

/**
 * Contain position and reference to both points. Call sync() to update the position of this point to be in the center of both points.
 */
export default class SyncablePoint extends Point {

  constructor(point1, point2) {
    super();
    this.point1 = point1;
    this.point2 = point2;
    this.sync();
  }

  sync() {}

  getProgressPoint(progress) {
    return new Point(lerp(this.point1.x, this.point2.x, progress), lerp(this.point1.y, this.point2.y, progress));
  }
}