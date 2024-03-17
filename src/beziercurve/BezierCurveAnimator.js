import { Graphics, Ticker } from "pixi.js";
import { lerp, easeOutQuart, saturate, easeOutBackCubic } from "./Math";
import Data from "../config/data.json";
import SyncablePoint from "./SyncablePoint";
import { DragablePoint } from "../components/DragablePoint";

class animatable {
  /**
   * @param {SyncablePoint} syncablePoint
   * @param {OnAnimationFinishedCallback} onFinished usefull callback after animation finished
   */
  constructor(syncablePoint, onFinished) {
    this.syncablePoint = syncablePoint;
    this.progress = 0; // 0-1, 0: start, 1: completed
    this.onFinished = onFinished;
  }
}

export class BezierCurveAnimator{

  constructor(lineGraphics, circleGraphics, stepDuration) {
    /** @type {animatable[]} */
    this.lineAnimationList = [];
    /** @type {animatable[]} */
    this.pointAnimationList = [];
    
    /** @type {Graphics} */
    this.lineGraphics = lineGraphics;
    this.circleGraphics = circleGraphics;

    this.stepDuration = stepDuration;

    this.removeAnimationWhenFinished = true;
  }
  
  /**
   * Update loop. Called every frame. Needs to be called by the main loop.
   * @param {Ticker} ticker
   */
  update(ticker) {
    this.lineGraphics.clear();
    this.circleGraphics.clear();
    this.continueAnimation(ticker);
    if(this.removeAnimationWhenFinished)
      this.removeFinishedAnimation();    
  }

  /** Continue Animation 
   * @param {Ticker} ticker 
  */
  continueAnimation(ticker) {
    this.lineAnimationList.forEach(p => {
      p.syncablePoint.sync();
      p.progress += ticker.elapsedMS/1000/this.stepDuration; 
      this.drawLineProgress(p.syncablePoint, easeOutQuart(saturate(p.progress))); // saturate to prevent overshoot
    });

    this.pointAnimationList.forEach(p=> {
      p.syncablePoint.sync();
      p.progress += ticker.elapsedMS/1000/this.stepDuration;
      this.drawPointProgress(p.syncablePoint, easeOutBackCubic(saturate(p.progress)));
    });

  }

  /** Remove Finished Animation */
  removeFinishedAnimation() {
    this.lineAnimationList = this.lineAnimationList.filter(p => {
      if(p.progress < 1) return true;
      p.onFinished();
      return false;
    });
    this.pointAnimationList = this.pointAnimationList.filter(p => {
      if(p.progress < 1) return true;
      p.onFinished();
      return false;
    });
  }


  /**
   * @param {Graphics} stepsGraphic
   * @param {CenterPoint} p 
   * @param {number} progress 
   */
  drawLineProgress(p, progress) {
    const from = p.point1;
    const to = p.getProgressPoint(progress);
    this.lineGraphics
      .beginFill(Data.slate50).lineStyle({ width: Data.lineWidth, color: Data.slate50 })
      .moveTo(from.x, from.y).lineTo(to.x, to.y);
  }

  /**
   * @param {Graphics} stepsGraphic
   * @param {CenterPoint} p 
   * @param {number} progress 
   */
  drawPointProgress(p, progress) {
    this.circleGraphics.beginFill(Data.slate50).drawCircle(p.x, p.y, Data.pointRadius*progress)
      .beginFill(Data.slate950).drawCircle(p.x, p.y, Data.pointRadius*0.80*progress)
      .beginFill(Data.slate50).drawCircle(p.x, p.y, Data.pointRadius*0.40*progress);
  }


  /**
   * Callback after animation finished.
   * @callback OnAnimationFinishedCallback
   */

  /**
   * Redraw animated line results
   * @param {SyncablePoint} p The point to draw
   * @param {OnAnimationFinishedCallback} onFinished usefull callback after animation finished
   */
  animateLineStep(p, onFinished){
    this.lineAnimationList.push(new animatable(p, onFinished));
  }
  /**
   * Redraw animated line results
   * @param {SyncablePoint} p The point that connected to 2 other points to draw
   * @param {OnAnimationFinishedCallback} onFinished usefull callback after animation finished
   */
  animatePointStep(p, onFinished){
    this.pointAnimationList.push(new animatable(p, onFinished));
  }
}