import { Application, Container, Point } from "pixi.js";
import { DragablePoint } from "../components/DragablePoint";
import { LineFollow } from "../components/LineFollow";
import Colors from "../config/color.json";
import Data from "../config/data.json";
import CenterPoint from "./CenterPoint";

export default class BezierCurve{

  constructor() {
    this.centerPointResult = [];
    this.centerPointWaste = [];
  }

  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {CenterPoint[]} p number of iterations. The bigger, the smoother. 
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {CenterPoint[]} centerPointResult list of center points.
   * @param {CenterPoint[]} centerPointWaste list of center points.
   */
  generateQuadratic(p, iterations) {
    const q0 = new CenterPoint(p[0], p[1]); // non output
    const q1 = new CenterPoint(p[1], p[2]); // non output
    const r0 = new CenterPoint(q0, q1); // non output
    this.centerPointWaste.push(q0, q1, r0);

    if(iterations > 1) {
      this.generateQuadratic([p[0], q0, r0], iterations - 1, this.centerPointResult, this.centerPointWaste);
      this.generateQuadratic([r0, q1, p[2]], iterations - 1, this.centerPointResult, this.centerPointWaste);
    } else {
      const p0r0 = new CenterPoint(p[0], r0); // output
      const r0p2 = new CenterPoint(r0, p[2]); // output
      this.centerPointResult.push(p0r0, r0p2);
    }
  }



  /**
   * Clear all generated points
   */
  clear() {
    this.centerPointResult = [];
    this.centerPointWaste = [];
  }


  /**
   * Callback for refreshing the curve.
   * @callback RefreshCallback
   * @param {CenterPoint} point Center point.
   */
  /**
   * Sync all the points. Used when one of the control points is moved
   * @param {RefreshCallback} onRefresh 
   */
  refresh(onRefresh) {
    this.centerPointWaste.forEach(p => p.sync());
    this.centerPointResult.forEach(p => {
      p.sync();
      onRefresh(p);
    });
  }


  /**
   * Callback for refreshing the curve.
   * @callback OnStepFinishedCallback
   * @param {CenterPoint} point Center point.
   */
  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {CenterPoint[]} p number of iterations. The bigger, the smoother. 
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {CenterPoint[]} centerPointResult list of center points result.
   * @param {CenterPoint[]} centerPointWaste list of center points used in processing.
   * @param {number} delay Wait time.
   * @param {OnStepFinishedCallback} onStepPointFinished Call back.
   * @param {OnStepFinishedCallback} onStepLineFinished Call back.
   */
  async generateQuadraticWithSteps(p, iterations, delay, onStepPointFinished, onStepLineFinished) {
    const q0 = new CenterPoint(p[0], p[1]); // non output
    const q1 = new CenterPoint(p[1], p[2]); // non output
    const r0 = new CenterPoint(q0, q1); // non output

    const p0p1 = new CenterPoint(p[0], p[1]);
    const p1p2 = new CenterPoint(p[1], p[2]);
    const q0q1 = new CenterPoint(q0, q1);

    onStepPointFinished(p[1]); await this.wait(delay);
    onStepPointFinished(p[2]); await this.wait(delay);
    onStepPointFinished(q0);   await this.wait(delay);
    onStepPointFinished(q1);   await this.wait(delay);
    onStepPointFinished(r0);   await this.wait(delay);

    onStepLineFinished(p0p1); await this.wait(delay);
    onStepLineFinished(p1p2); await this.wait(delay);
    onStepLineFinished(q0q1); await this.wait(delay);

    if(iterations > 1) {
      this.generateQuadraticWithSteps([p[0], q0, r0], iterations - 1, delay, onStepPointFinished, onStepLineFinished);
      this.generateQuadraticWithSteps([r0, q1, p[2]], iterations - 1, delay, onStepPointFinished, onStepLineFinished);
    } else {
      const p0r0 = new CenterPoint(p[0], r0);
      const r0p2 = new CenterPoint(r0, p[2]);
      onStepLineFinished(p0r0); await this.wait(delay);
      onStepLineFinished(r0p2); await this.wait(delay);
    }
  }
  /**
   * Usage: await this.wait(1000); // wait for 1 second
   * @param {number} ms wait time in milliseconds 
   * @returns 
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }










  // Any degree
  /**
   * get the next iteration from the current points
   * @param {DragablePoint[]} p current points in this iteration
   * @returns left points, right points, and all the middle points created
   */
  generateLeftRight(p) {
    const left = [];
    const right = [];
    const centerList = [[]];
    const centerFlatList = []; // same as center list but not a matrix
    const length = p.length;

    // current points
    for(let i = 0; i < length; i++) {
      centerList[0].push(p[i]);
    }

    // sub center points
    for(let i = 1; i < length; i++) {
      centerList.push([]);
      for(let j = 0; j < length-i; j++) { // Get the center point, so -1
        const centerPoint = new CenterPoint(centerList[i-1][j], centerList[i-1][j+1]);
        centerList[i].push(centerPoint);
        centerFlatList.push(centerPoint);
      }
    }

    for(let i = 0; i < length; i++) {
      left.push(centerList[i][0]);
      right.push(centerList[i][length-1-i]); 
    }

    return [left, right, centerFlatList];
  }

  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {CenterPoint[]} p List of input points. 
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {CenterPoint[]} centerPointResult list of result center points.
   * @param {CenterPoint[]} centerPointWaste list of center points used in processing.
   */
  generate(p, iterations) {
    /** @type {[DragablePoint[], DragablePoint[], DragablePoint[]]} */
    const [left, right, centerFlatList] = this.generateLeftRight(p);
    this.centerPointWaste.push(...centerFlatList);

    // container.addChild(subSubCenterList[0]);
    const length = p.length;

    /** @type {CenterPoint} */
    const l1 = new CenterPoint(left[0], left[length-1]);
    /** @type {CenterPoint} */
    const l2 = new CenterPoint(left[length-1], right[0]);

    if(iterations > 1){
      for(let i = 0; i < length; i++) {
        this.generate(left, iterations - 1);
        this.generate(right, iterations - 1);
      }
    } else {
      this.centerPointResult.push(l1, l2);
    }
  }
}