import { Point } from "pixi.js";
import { lerp, combination } from "./Math";
import SyncablePoint from "./SyncablePoint";

/**
 * Syncable to based on two points with the the complex formula
 */
export default class FormulatedPoint extends SyncablePoint {

  /**
   * 
   * @param {SyncablePoint[]} pointList 
   * @param {number} progress 
   */
  constructor(pointList, progress) {
    super(pointList[0], pointList[1]);
    /** @type {SyncablePoint[]} */
    this.pointList = pointList;
    this.progress = progress;
    this.sync();
  }

  
  /** Update the position of this point to be in the center of both points. */
  sync() { // override
    const n = this.pointList.length - 1;
    const oneMinProgress = 1 - this.progress
    let newX = 0;
    let newY = 0;
    for(let i = 0; i < this.pointList.length; i++) {
      const comb = combination(n, i);
      const oneMinProgressPow = Math.pow(oneMinProgress, n - i);
      const progressPow = Math.pow(this.progress, i);
      const temp = comb * oneMinProgressPow * progressPow;
      newX += temp * this.pointList[i].x;
      newY += temp * this.pointList[i].y;
    }
    this.x = newX;
    this.y = newY;
  }
}