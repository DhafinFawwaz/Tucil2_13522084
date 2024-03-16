import { Application, Container, Point } from "pixi.js";
import { DragablePoint } from "../components/DragablePoint";
import Data from "../config/data.json";
import CenterPoint from "./CenterPoint";
import LerpPoint from "./LerpPoint";
import SyncablePoint from "./SyncablePoint";

export default class BezierCurve{

  constructor() {
    /** @type {SyncablePoint[]} */
    this.syncablePointResult = [];
    /** @type {SyncablePoint[]} */
    this.syncablePointWaste = [];
  }
  
  /**
   * Sync all the points. Used when one of the control points is moved
   * @param {RefreshCallback} onRefresh 
   */
  refresh(onRefresh) {
    this.syncablePointWaste.forEach(p => p.sync());
    this.syncablePointResult.forEach(p => {
      p.sync();
      onRefresh(p);
      // console.log(p);
      // console.log(p.x);
    });
  }

  /** Clear all generated points */
  clear() {
    this.syncablePointResult = [];
    this.syncablePointWaste = [];
  }
  /**
   * Usage: await this.wait(1000); // wait for 1 second
   * @param {number} ms wait time in milliseconds 
   * @returns 
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * get the next iteration from the current points
   * @param {CenterPoint[]} p current points in this iteration
   * @returns left points, right points, and all the middle points created
   */
  generateLeftRight(p) {
    const left = [];
    const right = [];
    const centerList = []; // same as center list but not a matrix
    const length = p.length;

    // sub center points
    for(let i = 0; i < length-1; i++) {
      const centerPoint = new CenterPoint(p[i], p[i+1]);
      centerList.push(centerPoint);
    }

    // sub sub sub... center points
    let count = 0;
    for(let i = 2; i < length; i++) {
      for(let j = 0; j < length-i; j++) {
        const centerPoint = new CenterPoint(centerList[count+j], centerList[count+j+1]);
        centerList.push(centerPoint);
      }
      count += length - i + 1;
    }

    // 0 1 2 | 3 4 | 5
    // left: 0 3 5
    // right: 5 4 2

    let countLeft = 0;
    let countRight = centerList.length - 1;
    left.push(p[0]); // 0
    for(let i = 1; i < length; i++) {
      left.push(centerList[countLeft]);
      right.push(centerList[(countRight)]);
      countLeft += length - i;
      countRight -= i; 
      // Dont actually need to be reversed, but the visualization will look better. Just 1 extra variable and same amount of operator
      // Originally done like this:
      //   left.push(centerList[count]);
      //   count += length - i;
      //   right.push(centerList[(count-1)]);
      // which means no extra operator, just 1 extra variable
      
      // 2 count variable (countLeft, countRight) is better than with simple for loops but with more complex math with function below 
      // right(x, a) = a - (x * (x + 1) / 2)  | x = i, a = p.length - 1
      // left(x, b) = x * (2 * b + 1 - x) / 2 | x = i, b = centerList.length -1
    }
    right.push(p[length-1]); // 3

    return [left, right, centerList];
  }

  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {CenterPoint[]} p List of input points. 
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {CenterPoint[]} centerPointResult list of result center points.
   * @param {CenterPoint[]} centerPointWaste list of center points used in processing.
   */
  generateByDivideAndConquer(p, iterations) {
    /** @type {[CenterPoint[], CenterPoint[], CenterPoint[]]} */
    const [left, right, centerFlatList] = this.generateLeftRight(p);
    this.syncablePointWaste.push(...centerFlatList);

    const length = p.length;

    if(iterations > 1){
      this.generateByDivideAndConquer(left, iterations - 1);
      this.generateByDivideAndConquer(right, iterations - 1);
    } else {

      /** @type {CenterPoint} */
      const l1 = new CenterPoint(left[0], left[length-1]);
      /** @type {CenterPoint} */
      const l2 = new CenterPoint(left[length-1], right[length-1]);

      this.syncablePointResult.push(l1, l2);
    }
  }

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
  async generateWithStepsByDivideAndConquer(p, iterations, delay, onStepPointFinished, onStepLineFinished) {
    /** @type {[CenterPoint[], CenterPoint[], CenterPoint[]]} */
    const [left, right, centerFlatList] = this.generateLeftRight(p);
   
    const length = p.length;
    for(let i = 0; i < length-1; i++) {
      onStepPointFinished(centerFlatList[i]);  await this.wait(delay);
    }

    // The rest are lines and points
    for(let i = length-1; i < centerFlatList.length; i++) {
      onStepLineFinished(centerFlatList[i]);   await this.wait(delay);
      onStepPointFinished(centerFlatList[i]);  await this.wait(delay);
    }


    if(iterations > 1){
      this.generateWithStepsByDivideAndConquer(left, iterations - 1, delay, onStepPointFinished, onStepLineFinished);
      this.generateWithStepsByDivideAndConquer(right, iterations - 1, delay, onStepPointFinished, onStepLineFinished);
    } else {

      /** @type {CenterPoint} */
      const l1 = new CenterPoint(left[0], left[length-1]);
      /** @type {CenterPoint} */
      const l2 = new CenterPoint(left[length-1], right[length-1]);
      
      onStepLineFinished(l1); // await this.wait(delay);
      onStepLineFinished(l2); // await this.wait(delay);
    }
  }



  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {CenterPoint[]} p List of input points. 
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {CenterPoint[]} centerPointResult list of result center points.
   * @param {CenterPoint[]} centerPointWaste list of center points used in processing.
   */
  generateByBruteForce(p, iterations) {
    const resultPoints = [];

    const length = p.length;

    for(let k = 0; k < iterations; k++) {
      /** @type {CenterPoint[]} */
      const lerpPointsList = [];
      const progress = (k+1)/(iterations+1);

      // sub center points
      for(let i = 0; i < length-1; i++) {
        const centerPoint = new LerpPoint(p[i], p[i+1], progress);
        lerpPointsList.push(centerPoint);
        this.syncablePointWaste.push(centerPoint);
      }

      // sub sub sub... center points
      let count = 0;
      for(let i = 2; i < length; i++) {
        for(let j = 0; j < length-i; j++) {
          const centerPoint = new LerpPoint(lerpPointsList[count+j], lerpPointsList[count+j+1], progress);
          lerpPointsList.push(centerPoint);
          this.syncablePointWaste.push(centerPoint);
        }
        count += length - i + 1;
      }
      resultPoints.push(lerpPointsList[lerpPointsList.length-1]);

    } // k

    const leftMostLine = new CenterPoint(p[0], resultPoints[0]);
    this.syncablePointResult.push(leftMostLine);
    for(let i = 0; i < resultPoints.length-1; i++) {
      const centerPoint = new CenterPoint(resultPoints[i], resultPoints[i+1]);
      this.syncablePointResult.push(centerPoint);
    }
    const rightMostLine = new CenterPoint(resultPoints[resultPoints.length-1], p[length-1]);
    this.syncablePointResult.push(rightMostLine);
  }


  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {CenterPoint[]} p number of iterations. The bigger, the smoother. 
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {CenterPoint[]} centerPointResult list of center points result.
   * @param {CenterPoint[]} centerPointWaste list of center points used in processing.
   * @param {number} delay Wait time.
   * @param {OnStepFinishedCallback} onStepPointFinished Call back.
   * @param {OnStepFinishedCallback} onStepLineFinished Call back.
   * @param {OnIterationFinishedCallback} onIterationFinished Call back.
   */
  async generateWithStepsByBruteForce(p, iterations, delay, onStepPointFinished, onStepLineFinished) {
    /** @type {CenterPoint[]} */
    const resultPoints = [];

    const length = p.length;

    for(let k = 0; k < iterations; k++) {
      /** @type {CenterPoint[]} */
      const lerpPointsList = [];
      const progress = (k+1)/(iterations+1);

      // sub center points
      for(let i = 0; i < length-1; i++) {
        const centerPoint = new LerpPoint(p[i], p[i+1], progress);
        lerpPointsList.push(centerPoint);
      }

      // sub sub sub... center points
      let count = 0;
      for(let i = 2; i < length; i++) {
        for(let j = 0; j < length-i; j++) {
          const centerPoint = new LerpPoint(lerpPointsList[count+j], lerpPointsList[count+j+1], progress);
          lerpPointsList.push(centerPoint);
        }
        count += length - i + 1;
      }

      resultPoints.push(lerpPointsList[lerpPointsList.length-1]);

      for(let i = 0; i < lerpPointsList.length; i++) {
        if(i > length-2) { // when i = 0, it's the line that follows the dragable points
          onStepLineFinished(lerpPointsList[i]);      await this.wait(delay);
        }
        onStepPointFinished(lerpPointsList[i]);     await this.wait(delay);

      }


      
    } // k

    /** @type {CenterPoint[]} */
    const lineResults = [];

    const leftMostLine = new CenterPoint(p[0], resultPoints[0]);
    lineResults.push(leftMostLine);
    for(let i = 0; i < resultPoints.length-1; i++) {
      const centerPoint = new CenterPoint(resultPoints[i], resultPoints[i+1]);
      lineResults.push(centerPoint);
    }
    const rightMostLine = new CenterPoint(resultPoints[resultPoints.length-1], p[length-1]);
    lineResults.push(rightMostLine);
    
    for(let i = 0; i < lineResults.length; i++) {
      onStepLineFinished(lineResults[i]); await this.wait(delay);
    }
  }













  // ============================= Quadratic Only =============================

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
    this.syncablePointWaste.push(q0, q1, r0);

    if(iterations > 1) {
      this.generateQuadratic([p[0], q0, r0], iterations - 1, this.syncablePointResult, this.syncablePointWaste);
      this.generateQuadratic([r0, q1, p[2]], iterations - 1, this.syncablePointResult, this.syncablePointWaste);
    } else {
      const p0r0 = new CenterPoint(p[0], r0); // output
      const r0p2 = new CenterPoint(r0, p[2]); // output
      this.syncablePointResult.push(p0r0, r0p2);
    }
  }


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

    // onStepPointFinished(p[1]); await this.wait(delay);
    // onStepPointFinished(p[2]); await this.wait(delay);
    onStepPointFinished(q0);   await this.wait(delay);
    onStepPointFinished(q1);   await this.wait(delay);
    onStepPointFinished(r0);   await this.wait(delay);

    // onStepLineFinished(p0p1); await this.wait(delay);
    // onStepLineFinished(p1p2); await this.wait(delay);
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
}



  /**
   * Callback for refreshing the curve.
   * @callback RefreshCallback
   * @param {CenterPoint} point Center point.
   */
  /**
   * Callback for refreshing the curve.
   * @callback OnStepFinishedCallback
   * @param {CenterPoint} point Center point.
   */
  /**
   * Callback for refreshing the curve after each iteration.
   * @callback OnIterationFinishedCallback
   * @param {CenterPoint[]} pointList list of center point result.
   */