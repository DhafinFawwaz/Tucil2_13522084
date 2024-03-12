import { Application, Container, Point } from "pixi.js";
import { DragablePoint } from "../components/DragablePoint";
import { LineFollow } from "../components/LineFollow";
import Colors from "../config/color.json";
import Data from "../config/data.json";

export default class QuadraticBezierCurve{
  
  /**
   * 
   * @param {DragablePoint} p0
   * @param {DragablePoint} p1
   * @param {DragablePoint} p2
   * @param {Container} container
   */
  constructor() {
  }
  
  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {Container} container container to draw the curve.
   */
  generateToContainer(p0, p1, p2, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    // const p0p1 = this.getFollowedLine(p0, p1, Colors.slate50);
    // const p1p2 = this.getFollowedLine(p1, p2, Colors.slate50);
    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    // container.addChild(p0p1);
    // container.addChild(p1p2);
    // container.addChild(q0q1);
    // container.addChild(p0r0);
    // container.addChild(r0p2);
    
    // container.addChild(p0);
    // container.addChild(p1);
    // container.addChild(p2);
    // container.addChild(q0);
    // container.addChild(q1);

    if(iterations > 1) {
      this.generateToContainerRecursive(p0, q0, r0, iterations - 1, container);
      this.generateToContainerRecursive(r0, q1, p2, iterations - 1, container);
    } else {
      // container.addChild(q0); // non output
      // container.addChild(q1); // non output
      // container.addChild(q0q1); // non output
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
      // container.addChild(r0); // non output
    }
  }

  generateToContainerRecursive(p0, p1, p2, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const p0p1 = this.getFollowedLine(p0, p1, Colors.slate50); // non output
    const p1p2 = this.getFollowedLine(p1, p2, Colors.slate50); // non output
    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    container.addChild(p0p1); // non output
    container.addChild(p1p2); // non output
    container.addChild(q0q1); // non output

    
    // container.addChild(p0);
    container.addChild(p1); // non output
    container.addChild(p2); // non output
    container.addChild(q0); // non output
    container.addChild(q1); // non output

    container.addChild(r0); // non output

    if(iterations > 1) {
      this.generateToContainerRecursive(p0, q0, r0, iterations - 1, container);
      this.generateToContainerRecursive(r0, q1, p2, iterations - 1, container);
    } else {
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
    }
  }

  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {Container} container container to draw the curve.
   */
  generateWithNonOutputToContainer(p0, p1, p2, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    // const p0p1 = this.getFollowedLine(p0, p1, Colors.slate50);
    // const p1p2 = this.getFollowedLine(p1, p2, Colors.slate50);
    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    // container.addChild(p0p1);
    // container.addChild(p1p2);
    // container.addChild(q0q1);
    // container.addChild(p0r0);
    // container.addChild(r0p2);
    
    // container.addChild(p0);
    // container.addChild(p1);
    // container.addChild(p2);
    // container.addChild(q0);
    // container.addChild(q1);

    if(iterations > 1) {
      this.generateWithNonOutputToContainerRecursive(p0, q0, r0, iterations - 1, container);
      this.generateWithNonOutputToContainerRecursive(r0, q1, p2, iterations - 1, container);
    } else {
      container.addChild(q0); // non output
      container.addChild(q1); // non output
      container.addChild(q0q1); // non output
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
      container.addChild(r0); // non output
    }
  }

  generateWithNonOutputToContainerRecursive(p0, p1, p2, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const p0p1 = this.getFollowedLine(p0, p1, Colors.slate50); // non output
    const p1p2 = this.getFollowedLine(p1, p2, Colors.slate50); // non output
    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    container.addChild(p0p1); // non output
    container.addChild(p1p2); // non output
    container.addChild(q0q1); // non output

    
    // container.addChild(p0);
    container.addChild(p1); // non output
    container.addChild(p2); // non output
    container.addChild(q0); // non output
    container.addChild(q1); // non output

    container.addChild(r0); // non output

    if(iterations > 1) {
      this.generateToContainerRecursive(p0, q0, r0, iterations - 1, container);
      this.generateToContainerRecursive(r0, q1, p2, iterations - 1, container);
    } else {
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
    }
  }

  /**
   * Get a point that follows the center of two points
   * @param {DragablePoint} p1 first point
   * @param {DragablePoint} p2 second point
   * @returns DragablePoint
   */
  getFollowedDragablePointInCenter(p1, p2) {
    let point = new DragablePoint(0, 0, Data.rsm, Colors.slate50);
    point.setFollowCenterOf(p1, p2);
    return point;
  }

  getFollowedLine(p1, p2, color) {
    let line = new LineFollow(p1, p2, Colors.slate50);
    return line;
  }
}