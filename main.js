import "./style.css"
import { PointInput } from './components/PointInput.js'
import { Application, Graphics, Container, Rectangle } from 'pixi.js';
import Data from "./config/data.json"
import { DragablePoint } from "./components/DragablePoint.js";
import BezierCurve from "./beziercurve/BezierCurve";
import setTimeTaken from "./components/TimeTaken";
import getIteration from "./components/IterationInput";
import CenterPoint from "./beziercurve/CenterPoint";
import BezierCurveOld from "./beziercurve/BezierCurveOld";

export const app = new Application();

const leftMargin = Data.leftMargin; // width of the sidebar
const canvasWidth = window.innerWidth-leftMargin;
const canvasheight = window.innerHeight;
const graphicContainer = new Container();

/** To tell when to redraw the curve */
let visualizationState = 0; // 0: None, 1: Normal, 2: Steps

/** @type {HTMLElement} */ 
const inputListParent = document.getElementById('point-input-list')
let highestId = 0;

/** ====================================================================== **/

/** @type {DragablePoint[]} List of input points */ 
const inputPoints = [];

/** @type {Graphics} List of input lines */ 
const inputLinesGraphic = new Graphics();

/** @type {Graphics} Line result graphics */ 
const lineResultGraphic = new Graphics();
lineResultGraphic.interactive = false;
lineResultGraphic.hitArea = new Rectangle(0,0,0,0)

/** ====================================================================== **/

/** @type {Graphics} animated steps graphics */ 
const stepsGraphic = new Graphics();
stepsGraphic.interactive = false;
stepsGraphic.hitArea = new Rectangle(0,0,0,0)

/** @type {DragablePoint[]} List of step points */ 
let stepPoints = [];

/** @type {DragablePoint[]} List of step lines */ 
let stepLines = [];

/** ====================================================================== **/

/** @type {BezierCurve} The curve itself */ 
const bezierCurve = new BezierCurve();

/** ================================================ Redraws ================================================ **/
/** sync the lines with the points */
function redrawInputLines() {
  inputLinesGraphic.clear();
  for(let i = 0; i < inputPoints.length-1; i++) {
    inputLinesGraphic.moveTo(inputPoints[i].x, inputPoints[i].y).lineTo(inputPoints[i+1].x, inputPoints[i+1].y)
      .fill(Data.slate50).stroke({ width: Data.lineWidth, color: Data.slate50 });
  }
}

/**
 * Redraw line results
 */
function redrawLineResult(){
  lineResultGraphic.clear();
  bezierCurve.refresh(p => {
    lineResultGraphic.moveTo(p.point1.x, p.point1.y).lineTo(p.point2.x, p.point2.y)
      .fill(Data.slate50).stroke({ width: Data.lineWidth, color: Data.slate50 });
  });
}

/**
 * Redraw step line results
 */
function redrawStepLineResult(){
  stepsGraphic.clear();
  stepPoints.forEach(p => {
    p.sync();
    drawPointStep(p);
  });
  stepLines.forEach(p => {
    p.sync();
    drawLineStep(p);
  });
}
/** ================================================ Redraws ================================================ **/



/** ================================================ Draw Animated Steps ================================================ **/
/**
 * Redraw animated line results
 * @param {CenterPoint} p The point to draw
 */
function drawLineStep(p){
  stepsGraphic.moveTo(p.point1.x, p.point1.y).lineTo(p.point2.x, p.point2.y)
    .fill(Data.slate50).stroke({ width: Data.lineWidth, color: Data.slate50 });
}
/**
 * Redraw animated line results
 * @param {CenterPoint} p The point that connected to 2 other points to draw
 */
function drawPointStep(p){
  stepsGraphic.circle(p.x, p.y, Data.pointRadius).fill(Data.slate50).circle(p.x, p.y, Data.pointRadius*0.80).fill(Data.slate950).circle(p.x, p.y, Data.pointRadius*0.40).fill(Data.slate50);
}
/** ================================================ Draw Animated Steps End ================================================ **/



/** ================================================ GUI Function ================================================ **/
/**
 * Add a new point input and dragable points
 * @param {number} defaultX 
 * @param {number} defaultY 
 */
function addInput(defaultX, defaultY) {

  const dragablePoint = new DragablePoint(defaultX, defaultY);
  dragablePoint.setDragable(app);
  
  graphicContainer.addChild(dragablePoint);
  inputPoints.push(dragablePoint);
  redrawInputLines();

  const [newInput, inputX, inputY] = PointInput("P"+highestId, defaultX, defaultY, 
    (div) => { // onRemove
      highestId--;
      graphicContainer.removeChild(dragablePoint);
      inputPoints.splice(inputPoints.indexOf(dragablePoint), 1);
      redrawInputLines();

      // update the point names
      inputListParent.querySelectorAll('[id=point-name]').forEach((el, i) => {
        const newName = `P${i}`
        el.textContent = newName;
      });
      
      if(visualizationState !== 0) {
        InitializeCurves();
      }

  }, (newPos) => { // onPositionChange
      dragablePoint.setPosition(newPos.x, newPos.y);
  });
  
  dragablePoint.addOnMoveListener((sender, {x, y}) => {
    inputX.value = x;
    inputY.value = y;
  });
  highestId++;
  inputListParent.appendChild(newInput.content)
}

function visualizeCurve() {
  if(visualizationState !== 0) InitializeCurves(); 
  visualizationState = 1;
  const p = inputPoints; // shorthand
  const iterations = getIteration();
  bezierCurve.clear();
  const startTime = performance.now();
  bezierCurve.generate(p, iterations);
  setTimeTaken((performance.now() - startTime).toFixed(2));
  redrawLineResult();
}
async function showStepsAnimatedConcurent() {
  if(visualizationState !== 0) InitializeCurves(); 
  const p = inputPoints;
  const iterations = getIteration();
  bezierCurve.clear();
  stepPoints = [];
  stepLines = [];
  await bezierCurve.generateQuadraticWithSteps(p, iterations, 100, p => {
    stepPoints.push(p);
    drawPointStep(p);
  }, p => {
    stepLines.push(p);
    drawLineStep(p);
  });
  visualizationState = 2;
}
/** ================================================ GUI Function End ================================================ **/



/** ================================================ Initialization ================================================ **/
function putAllInputPointsAbove() {
  inputPoints.forEach();
}
function InitializeCurves() {
  visualizationState = 0;
  graphicContainer.removeChildren();
  inputPoints.forEach(p => graphicContainer.addChild(p));
  graphicContainer.addChild(lineResultGraphic, inputLinesGraphic, stepsGraphic);
  redrawInputLines();
  lineResultGraphic.clear();
  stepPoints = [];
  stepLines = [];
  stepsGraphic.clear();
}
InitializeCurves();

document.getElementById('add-point').addEventListener('click', () => addInput(canvasWidth/2, canvasheight/2));
document.getElementById('visualize-curve').addEventListener('click', visualizeCurve);
document.getElementById('show-steps').addEventListener('click', showStepsAnimatedConcurent);
document.getElementById('clear-curve').addEventListener('click', InitializeCurves);

addInput(canvasWidth/2-350, canvasheight/2-250);
addInput(canvasWidth/2-250, canvasheight/2+250);
addInput(canvasWidth/2+250, canvasheight/2+250);
addInput(canvasWidth/2+350, canvasheight/2-250);


(async () =>
{
  await app.init({ background: Data.slate950, width:canvasWidth, height: canvasheight });
  app.stage.position.y = app.renderer.height / app.renderer.resolution;
  app.stage.scale.y = -1;

  app.stage.addChild(graphicContainer);

  // To make points dragable
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', DragablePoint.onDragEnd);
  app.stage.on('pointerupoutside', DragablePoint.onDragEnd);

  // To make the canvas full screen
  app.canvas.style.position = 'fixed';
  app.canvas.style.top = 0;
  app.canvas.style.left = 0;
  app.canvas.style.height = '100%';
  document.body.appendChild(app.canvas);

  // Using this loop is faster than subscribing to mouse move event
  app.ticker.add((ticker) => {
    redrawInputLines();
    if(visualizationState === 1) redrawLineResult();
    else if(visualizationState === 2) redrawStepLineResult();
  });

})();
/** ================================================ Initialization End ================================================ **/
