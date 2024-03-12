import { Application, Container, Point } from "pixi.js";
import { DragablePoint } from "../components/DragablePoint";
import { LineFollow } from "../components/LineFollow";
import Colors from "../config/color.json";
import Data from "../config/data.json";
import QuadraticBezierCurve from "./QuadraticBezierCurve";

export default class BezierCurve{
  
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

  /**
   * Usage: await this.wait(1000); // wait for 1 second
   * @param {number} ms wait time in milliseconds 
   * @returns 
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  

  /**
   * Generate a quadratic bezier curve based on the points and number of iterations
   * @param {DragablePoint[]} p list of points. 
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {Container} container container to draw the curve.
   */
  generateToContainer(p, iterations, container) {
    // quadraticBezierCurve = new QuadraticBezierCurve();

    const q0 = this.getFollowedDragablePointInCenter(p[0], p[1]); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p[1], p[2]); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const p0r0 = this.getFollowedLine(p[0], r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p[2], Colors.slate50); // output

    if(iterations > 1) {
      this.generateToContainerRecursive([p[0], q0, r0], iterations - 1, container);
      this.generateToContainerRecursive([r0, q1, p[2]], iterations - 1, container);
    } else {
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
    }
  }

  generateToContainerRecursive(p, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p[0], p[1]); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p[1], p[2]); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const p0r0 = this.getFollowedLine(p[0], r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p[2], Colors.slate50); // output

    if(iterations > 1) {
      this.generateToContainerRecursive([p[0], q0, r0], iterations - 1, container);
      this.generateToContainerRecursive([r0, q1, p[2]], iterations - 1, container);
    } else {
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
    }
  }

  /**
   * Generate a quadratic bezier curve based on the points and number of iterations, include the non output points for visualization
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {Container} container container to draw the curve.
   */
  generateWithNonOutputToContainer(p0, p1, p2, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

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

    container.addChild(p1); // non output
    container.addChild(p2); // non output
    container.addChild(q0); // non output
    container.addChild(q1); // non output

    container.addChild(r0); // non output

    if(iterations > 1) {
      this.generateWithNonOutputToContainerRecursive(p0, q0, r0, iterations - 1, container);
      this.generateWithNonOutputToContainerRecursive(r0, q1, p2, iterations - 1, container);
    } else {
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
    }
  }

  /**
   * Generate a quadratic bezier curve based on the points and number of iterations, include only the resolution points for visualization
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {Container} container container to draw the curve.
   */
  generateWithPointsToContainer(p0, p1, p2, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // points, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration
    
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    if(iterations > 1) {
      this.generateWithPointsToContainerRecursive(p0, q0, r0, iterations - 1, container);
      this.generateWithPointsToContainerRecursive(r0, q1, p2, iterations - 1, container);
    } else {
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
      container.addChild(r0); // points
    }
  }

  generateWithPointsToContainerRecursive(p0, p1, p2, iterations, container) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // points, next iteration

    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    container.addChild(p2); // points
    container.addChild(r0); // points

    if(iterations > 1) {
      this.generateWithPointsToContainerRecursive(p0, q0, r0, iterations - 1, container);
      this.generateWithPointsToContainerRecursive(r0, q1, p2, iterations - 1, container);
    } else {
      container.addChild(p0r0); // output
      container.addChild(r0p2); // output
    }
  }


  /**
   * Generate a quadratic bezier curve while also visualizing the process of generating the curve concurently
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {Container} container container to draw the curve.
   */
  async generateWithConcurentAnimatedVisualizationToContainer(p0, p1, p2, iterations, container, delay = 500) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    if(iterations > 1) {
      this.generateWithConcurentAnimatedVisualizationToContainerRecursive(p0, q0, r0, iterations - 1, container, delay);
      this.generateWithConcurentAnimatedVisualizationToContainerRecursive(r0, q1, p2, iterations - 1, container, delay);
    } else {
      container.addChild(q0);   await this.wait(delay); // non output
      container.addChild(q1);   await this.wait(delay); // non output
      container.addChild(r0);   await this.wait(delay); // non output
      container.addChild(q0q1); await this.wait(delay); // non output
      container.addChild(p0r0); await this.wait(delay); // output
      container.addChild(r0p2); await this.wait(delay); // output
    }
  }

  async generateWithConcurentAnimatedVisualizationToContainerRecursive(p0, p1, p2, iterations, container, delay) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const p0p1 = this.getFollowedLine(p0, p1, Colors.slate50); // non output
    const p1p2 = this.getFollowedLine(p1, p2, Colors.slate50); // non output
    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output
    
    container.addChild(p1); await this.wait(delay);// non output
    container.addChild(p2); await this.wait(delay);// non output
    container.addChild(q0); await this.wait(delay);// non output
    container.addChild(q1); await this.wait(delay);// non output
    
    container.addChild(r0); await this.wait(delay);// non output
    
    container.addChild(p0p1); await this.wait(delay);// non output
    container.addChild(p1p2); await this.wait(delay);// non output
    container.addChild(q0q1); await this.wait(delay);// non output

    if(iterations > 1) {
      this.generateWithConcurentAnimatedVisualizationToContainerRecursive(p0, q0, r0, iterations - 1, container, delay);
      this.generateWithConcurentAnimatedVisualizationToContainerRecursive(r0, q1, p2, iterations - 1, container, delay);
    } else {
      container.addChild(p0r0); await this.wait(delay);// output
      container.addChild(r0p2); await this.wait(delay);// output
    }
  }

  /**
   * MUST CALL WITH AWAIT! Generate a quadratic bezier curve while also visualizing the process of generating the curve one by one. if this function is called without await, the first iteration will be concurent
   * @param {number} iterations number of iterations. The bigger, the smoother. 
   * @param {Container} container container to draw the curve.
   */
  async generateWithAnimatedVisualizationToContainer(p0, p1, p2, iterations, container, delay = 500) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    if(iterations > 1) {
      await this.generateWithAnimatedVisualizationToContainerRecursive(p0, q0, r0, iterations - 1, container, delay);
      await this.generateWithAnimatedVisualizationToContainerRecursive(r0, q1, p2, iterations - 1, container, delay);
    } else {
      container.addChild(q0);   await this.wait(delay); // non output
      container.addChild(q1);   await this.wait(delay); // non output
      container.addChild(r0);   await this.wait(delay); // non output
      container.addChild(q0q1); await this.wait(delay); // non output
      container.addChild(p0r0); await this.wait(delay); // output
      container.addChild(r0p2); await this.wait(delay); // output
    }
  }

  async generateWithAnimatedVisualizationToContainerRecursive(p0, p1, p2, iterations, container, delay) {
    const q0 = this.getFollowedDragablePointInCenter(p0, p1); // non output, next iteration
    const q1 = this.getFollowedDragablePointInCenter(p1, p2); // non output, next iteration
    const r0 = this.getFollowedDragablePointInCenter(q0, q1); // non output, next iteration

    const p0p1 = this.getFollowedLine(p0, p1, Colors.slate50); // non output
    const p1p2 = this.getFollowedLine(p1, p2, Colors.slate50); // non output
    const q0q1 = this.getFollowedLine(q0, q1, Colors.slate50); // non output
    
    const p0r0 = this.getFollowedLine(p0, r0, Colors.slate50); // output
    const r0p2 = this.getFollowedLine(r0, p2, Colors.slate50); // output

    container.addChild(p1); await this.wait(delay);// non output
    container.addChild(p2); await this.wait(delay);// non output
    container.addChild(q0); await this.wait(delay);// non output
    container.addChild(q1); await this.wait(delay);// non output
    
    container.addChild(r0); await this.wait(delay);// non output
    
    container.addChild(p0p1); await this.wait(delay);// non output
    container.addChild(p1p2); await this.wait(delay);// non output
    container.addChild(q0q1); await this.wait(delay);// non output
    if(iterations > 1) {
      await this.generateWithAnimatedVisualizationToContainerRecursive(p0, q0, r0, iterations - 1, container, delay);
      await this.generateWithAnimatedVisualizationToContainerRecursive(r0, q1, p2, iterations - 1, container, delay);
    } else {
      container.addChild(p0r0); await this.wait(delay);// output
      container.addChild(r0p2); await this.wait(delay);// output
    }
  }

}