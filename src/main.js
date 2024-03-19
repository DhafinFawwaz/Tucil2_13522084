import "./style.css"
import { PointInput } from './components/PointInput.js'
import { Application, Graphics, Rectangle, Point, Ticker } from 'pixi.js';
import Data from "./config/data.json"
import { DragablePoint } from "./components/DragablePoint.js";
import BezierCurve from "./beziercurve/BezierCurve";
import setTimeTaken from "./components/TimeTaken";
import getIteration from "./components/IterationInput";
import SyncablePoint from "./beziercurve/SyncablePoint";
import { CoordinateText } from "./components/CoordinateText";
import { BezierCurveAnimator } from "./beziercurve/BezierCurveAnimator";
import { randomRange } from "./beziercurve/Math.js";
import { SidebarOpen, LeftSidebarClose, RightSidebarClose } from "./components/Sidebar";
import { AlgorithmOption } from "./components/AlgorithmOption";
import BackgroundGraphic from "./components/BackgroundGraphic";
import { Viewport } from "pixi-viewport";
import { drawLineResult, drawLineStep, drawPointResult, drawPointStep } from "./components/Drawer";
import { CloseDialog, OpenDialog } from "./components/Dialog";

let algorithmId = 0; // 0: divide and conquer, 1: brute force

export const app = new Application({
  resizeTo: window,
  backgroundColor: Data.slate950
});
const sidebarWidth = Data.leftMargin; // width of the sidebar

/** @type {Viewport} Container for graphics */ 
const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: 1000,
  worldHeight: 1000,
  events: app.renderer.events 
})
viewport.moveCenter(0,0);
viewport.drag().pinch().wheel().decelerate({friction: 0.85});

// stop dragging outside of the world bounds
viewport.addEventListener('moved', (e) => {
  const widthDiv2 = viewport.screenWidthInWorldPixels/2;
  const heightDiv2 = viewport.screenHeightInWorldPixels/2;
  const x = viewport.center.x;
  const y = viewport.center.y;
  let newX = x;
  let newY = y;
  if(x < -widthDiv2) newX = -widthDiv2;
  if(x > widthDiv2) newX = widthDiv2;
  if(y < -heightDiv2) newY = -heightDiv2;
  if(y > heightDiv2) newY = heightDiv2;
  viewport.moveCenter(newX, newY);
})


/** To tell when to redraw the curve */
let visualizationState = 0; // 0: None, 1: Normal, 2: Steps

/** @type {HTMLElement} */ 
const inputListParent = document.getElementById('point-input-list')
let highestId = 0;

/** ====================================================================== **/

/** @type {DragablePoint[]} List of input points */ 
const inputPoints = [];

/** @type {CoordinateText[]} List of input points */ 
const inputCoordinateTexts = [];

/** @type {Graphics} List of input lines */ 
const inputLinesGraphic = new Graphics();

/** @type {Graphics} Graphic that draws the result lines */ 
const lineResultGraphic = new Graphics();

/** @type {Graphics} Graphic that draws the result lines */ 
const pointResultGraphic = new Graphics();
pointResultGraphic.eventMode = 'none';

/** ====================================================================== **/

/** @type {Graphics} unanimated steps graphics for lines */ 
const stepLinesGraphic = new Graphics();

/** @type {Graphics} unanimated steps graphics for circles */ 
const stepCirclesGraphic = new Graphics();

/** @type {SyncablePoint[]} List of step points */ 
let stepPoints = [];

/** @type {SyncablePoint[]} List of step lines */ 
let stepLines = [];

/** ====================================================================== **/

/** @type {number} The duration of each step in seconds */
let stepDuration = 0.5;
let stepDelay = 0.15;

/** @type {BezierCurve} The curve itself */ 
const bezierCurve = new BezierCurve();

/** @type {Graphics} animated steps graphics */ 
const animatedStepLinesGraphic = new Graphics();

/** @type {Graphics} animated steps graphics */ 
const animatedStepCirclesGraphic = new Graphics();

/** @type {BezierCurveAnimator} The curve animator */
const bezierCurveAnimator = new BezierCurveAnimator(animatedStepLinesGraphic, animatedStepCirclesGraphic, stepDuration);

/** ====================================================================== **/


/** @type {BackgroundGraphic} animated steps graphics */ 
let backgroundGraphic;

/** ====================================================================== **/

let dynamicUpdate = true;
let showResultCoordinate = false;
let showInputLines = true;

/** ================================================ Redraws ================================================ **/
/** sync the lines with the points */
function redrawInputLines() {
  inputLinesGraphic.clear();
  for(let i = 0; i < inputPoints.length-1; i++) {
    inputLinesGraphic.beginFill(Data.slate50).lineStyle({ width: Data.lineWidth, color: Data.slate50 })
      .moveTo(inputPoints[i].x, inputPoints[i].y).lineTo(inputPoints[i+1].x, inputPoints[i+1].y)
  }
}

/** Redraw line results*/
/** @type {CoordinateText[]} */
let resultCoordinateTexts = [];
function redrawPointAndLineResult(){
  lineResultGraphic.clear();
  if(showResultCoordinate) pointResultGraphic.clear();

  lineResultGraphic.lineStyle({ width: Data.lineWidth, color: Data.yellow400 })
    .moveTo(inputPoints[0].x, inputPoints[0].y)
  bezierCurve.refresh(p => {
    lineResultGraphic.lineTo(p.x, p.y);

    if(showResultCoordinate){
      drawPointResult(p, pointResultGraphic);
    };
  });
  // lineResultGraphic.lineTo(inputPoints[inputPoints.length-1].x, inputPoints[inputPoints.length-1].y);

  if(!showResultCoordinate){
    pointResultGraphic.clear();
    resultCoordinateTexts.forEach(p => viewport.removeChild(p));
    resultCoordinateTexts = [];
  } else {
    // Create or remove the coordinate text
    while(resultCoordinateTexts.length < bezierCurve.syncablePointResult.length-2) {
      const text = new CoordinateText(); text.setYellow();
      resultCoordinateTexts.push(text);
      viewport.addChild(text);
    }
    while(resultCoordinateTexts.length > bezierCurve.syncablePointResult.length-2) {
      viewport.removeChild(resultCoordinateTexts.pop());
    }
    for(let i = 1; i < bezierCurve.syncablePointResult.length-1; i++) {
      const p = bezierCurve.syncablePointResult[i];
      const text = resultCoordinateTexts[i-1];
      const zoom = viewport.scale.x;
      text.setText(p.x, p.y);
      text.zoomRescale(zoom);
      text.x = p.x + Data.coordinateTextOffsetX/zoom;
      text.y = p.y - Data.coordinateTextOffsetY/zoom;
      drawPointResult(p, pointResultGraphic);
    } 
  }
}

/** Redraw step line results */
function redrawStepPointAndLineResult(){
  stepLinesGraphic.clear();
  stepLines.forEach(p => {
    p.sync();
    drawLineStep(p, stepLinesGraphic);
  });
  stepCirclesGraphic.clear();
  stepPoints.forEach(p => {
    p.sync();
    drawPointStep(p, stepCirclesGraphic);
  });
}
/** ================================================ Redraws End ================================================ **/




/** ================================================ GUI Function ================================================ **/
/**
 * Add a new point input in GUI and dragable points in Canvas
 * @param {number} defaultX 
 * @param {number} defaultY 
 */
function addInput(defaultX, defaultY) {
  const name = `P${highestId}`;

  const dragablePoint = new DragablePoint(defaultX, defaultY);
  dragablePoint.setDragable(app, viewport);
  const coordinateText = new CoordinateText();
  coordinateText.attachToDraggablePoint(dragablePoint, Data.coordinateTextOffsetX, Data.coordinateTextOffsetY, name);
  
  viewport.addChild(dragablePoint);
  inputPoints.push(dragablePoint);
  inputCoordinateTexts.push(coordinateText);
  redrawInputLines();

  const [newInput, inputX, inputY] = PointInput(name, defaultX, -defaultY, // Flip y
    (div) => { // onRemove
      highestId--;
      viewport.removeChild(dragablePoint);
      inputPoints.splice(inputPoints.indexOf(dragablePoint), 1);
      inputCoordinateTexts.splice(inputCoordinateTexts.indexOf(coordinateText), 1);
      // rename the point names
      inputCoordinateTexts.forEach((el, i) => {
        el.rename(`P${i}`);
        el.setText(inputPoints[i].x, inputPoints[i].y);
      });
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
      // dragablePoint.setPosition(newPos.x, newPos.y);
      dragablePoint.x = newPos.x;
      dragablePoint.y = newPos.y;
      coordinateText.setText(newPos.x, newPos.y);
  });
  
  dragablePoint.addOnMoveListener((sender, {x, y}) => {
    inputX.value = x;
    inputY.value = -y; // Flip y
  });
  highestId++;
  inputListParent.appendChild(newInput.content);
  if(visualizationState !== 0) {
    InitializeCurves();
  }
  // The result is always on top
  movePointAndLineResultToTop();
}
function movePointAndLineResultToTop() {
  viewport.setChildIndex(lineResultGraphic, viewport.children.length-1);
  viewport.setChildIndex(pointResultGraphic, viewport.children.length-1);
}
/** Solve the Bezier Curve and draw to Canvas */
function visualizeCurve() {
  if(inputPoints.length < 3) {
    OpenDialog("Illegal Input", "Please add at least 3 points!. It's impossible to draw a curve with less than 3 points.")
    return;
  }
  if(iterations < 1) {
    OpenDialog("Illegal Iterations", "Minimum iterations is 1. Please increase it!.")
    return;
  }

  if(visualizationState !== 0) InitializeCurves(); 
  visualizationState = 1;
  const p = inputPoints; // shorthand
  const iterations = getIteration();
  bezierCurve.clear();
  const startTime = performance.now();
  bezierCurve.generate(p, iterations, algorithmId);
  const timeTaken = (performance.now() - startTime);
  setTimeTaken(timeTaken.toFixed(2));
  logResult(bezierCurve, timeTaken);
  redrawPointAndLineResult();
}

/**
 * @param {BezierCurve} bezierCurve 
 * @param {number} timeTaken 
 */
function logResult(bezierCurve, timeTaken) {
  let points = bezierCurve.syncablePointResult.map(p => [p.x, -p.y]); // Flip y
  points.unshift([inputPoints[0].x, -inputPoints[0].y]); // Flip y
  console.log(`Time taken: ${timeTaken} ms`, "\n\nPoints: ", points);
}

/** Solve the Bezier Curve and draw with step by step animation */
async function showStepsAnimated() {
  if(inputPoints.length < 3) {
    OpenDialog("Illegal Input", "Please add at least 3 points!. It's impossible to draw a curve with less than 3 points.")
    return;
  }
  if(iterations < 1) {
    OpenDialog("Illegal Iterations", "Minimum iterations is 1. Please increase it!.")
    return;
  }

  if(visualizationState !== 0) InitializeCurves(); 
  const p = inputPoints;
  const iterations = getIteration();
  bezierCurve.clear();
  stepPoints = [];
  stepLines = [];
  visualizationState = 2;

  await bezierCurve.generateWithSteps(p, iterations, algorithmId, stepDelay*1000, p => {
    bezierCurveAnimator.animatePointStep(p, () => stepPoints.push(p));
  }, p => {
    bezierCurveAnimator.animateLineStep(p, () => stepLines.push(p));
  });
}
/** ================================================ GUI Function End ================================================ **/

/** ================================================ GUI Checkbox ================================================ **/
function toggleResultCoordinate(e) {
  showResultCoordinate = e.target.checked;
}
function toggleInputLines(e) {
  showInputLines = e.target.checked;
  inputLinesGraphic.visible = showInputLines;
}
function toggleDynamicUpdate(e) {
  dynamicUpdate = e.target.checked;
}
/** ================================================ GUI Checkbox End ================================================ **/


/** ================================================ Initialization ================================================ **/
/** Clear all curves */
function InitializeCurves() {
  visualizationState = 0;
  viewport.removeChildren();
  viewport.addChild(backgroundGraphic, inputLinesGraphic, stepLinesGraphic, animatedStepLinesGraphic, stepCirclesGraphic, animatedStepCirclesGraphic);
  inputPoints.forEach(p => viewport.addChild(p));
  viewport.addChild(lineResultGraphic, pointResultGraphic); // this thing is always on top
  redrawInputLines();
  lineResultGraphic.clear();
  stepPoints = [];
  stepLines = [];
  stepLinesGraphic.clear();
  stepCirclesGraphic.clear();
  animatedStepLinesGraphic.clear();
  animatedStepCirclesGraphic.clear();
  pointResultGraphic.clear();
  bezierCurve.clear();
  resultCoordinateTexts = [];    
}

/** Initialize canvas and connect GUI with inputs */

(async () =>
{
  backgroundGraphic = new BackgroundGraphic(viewport);
  InitializeCurves();
  
  document.getElementById('add-point').addEventListener('click', () => addInput(randomRange(viewport.left + sidebarWidth, viewport.right - sidebarWidth), randomRange(viewport.bottom, viewport.top)));
  document.getElementById('visualize-curve').addEventListener('click', visualizeCurve);
  document.getElementById('show-steps').addEventListener('click', showStepsAnimated);
  document.getElementById('clear-curve').addEventListener('click', InitializeCurves);
  document.getElementById('step-duration').addEventListener('input', (e) => {
    stepDuration = parseFloat(e.target.value);
    bezierCurveAnimator.stepDuration = stepDuration;
  });
  document.getElementById('step-delay').addEventListener('input', (e) => {
    stepDelay = parseFloat(e.target.value);
  });
  const rightSidebar = document.getElementById('right-sidebar');
  const leftSidebar = document.getElementById('left-sidebar');
  const sidebarClose = document.getElementById('sidebar-close');
  if(window.innerWidth < 1024) { // tailwind lg
    RightSidebarClose(sidebarClose, rightSidebar);
    LeftSidebarClose(sidebarClose, leftSidebar);
  }
  sidebarClose.addEventListener('click', (e) => {
    RightSidebarClose(sidebarClose, rightSidebar);
    LeftSidebarClose(sidebarClose, leftSidebar);
  });
  document.getElementById('right-sidebar-open').addEventListener('click', (e) => SidebarOpen(sidebarClose, rightSidebar));
  document.getElementById('left-sidebar-open').addEventListener('click', (e) => SidebarOpen(sidebarClose, leftSidebar));
  const algorithmOptions = [document.getElementById('divide-and-conquer'), document.getElementById('brute-force'), document.getElementById('brute-force-formulated')];
  algorithmOptions.forEach((el, i) => el.addEventListener('click', () => {
    algorithmId = i;
    AlgorithmOption(algorithmOptions, i);
  }));
  document.getElementById('dynamic-update').addEventListener('change', toggleDynamicUpdate);
  document.getElementById('result-coordinate').addEventListener('change', toggleResultCoordinate);
  document.getElementById('input-lines').addEventListener('change', toggleInputLines);


  addInput(-200, 200);
  addInput(-100, -200);
  addInput( 100, -200);
  addInput( 200, 200);

  // app.stage.position.y = app.renderer.height / app.renderer.resolution;
  // app.stage.scale.y = -1;

  app.stage.addChild(viewport);
  

  // wheel happens is before viewport.scale.x is updated, so we use zoomed
  viewport.on('zoomed', (e) => {
    const zoom = viewport.scale.x
    inputPoints.forEach(p => p.zoomRescale(zoom));
    Data.lineWidth = 3/zoom;
    Data.pointRadius = 10/zoom;
    backgroundGraphic.zoomRescale(zoom);
    resultCoordinateTexts.forEach(p => p.zoomRescale(zoom));
  });

  // on dragging
  viewport.on('moved', (e) => {
    backgroundGraphic.updateTextAnchor(e.viewport.center);
  });
  


  // To make the canvas full screen
  app.view.style.position = 'fixed';
  app.view.style.top = 0;
  app.view.style.left = 0;
  app.view.style.height = '100%';
  document.body.appendChild(app.view);

  // Using this loop is faster than subscribing to mouse move event
  const ticker = Ticker.shared;
  ticker.add((dt) => {
    bezierCurveAnimator.update(ticker);
    if(!dynamicUpdate) return;

    redrawInputLines();
    if(visualizationState === 1) redrawPointAndLineResult();
    else if(visualizationState === 2) redrawStepPointAndLineResult();

  });

})();

/** ================================================ Initialization End ================================================ **/

