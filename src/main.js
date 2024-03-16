import "./style.css"
import { PointInput } from './components/PointInput.js'
import { Application, Graphics, Container, Rectangle, Point } from 'pixi.js';
import Data from "./config/data.json"
import { DragablePoint } from "./components/DragablePoint.js";
import BezierCurve from "./beziercurve/BezierCurve";
import setTimeTaken from "./components/TimeTaken";
import getIteration from "./components/IterationInput";
import SyncablePoint from "./beziercurve/SyncablePoint";
import { CoordinateText } from "./components/CoordinateText";
import { BezierCurveAnimator } from "./beziercurve/BezierCurveAnimator";
import { floorTo, randomRange, roundTo } from "./beziercurve/Math.js";
import { SidebarOpen, LeftSidebarClose, RightSidebarClose } from "./components/Sidebar";
import { AlgorithmOption } from "./components/AlgorithmOption";
import BackgroundGraphic from "./components/BackgroundGraphic";

let algorithmId = 0; // 0: divide and conquer, 1: brute force

export const app = new Application(); // Imported by DraggablePoint for dragging points
const rightMargin = Data.leftMargin; // width of the sidebar

/** @type {Container} Container for graphics */ 
const graphicContainer = new Container();

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

/** @type {Graphics} Graphic that draws the input lines */ 
const lineResultGraphic = new Graphics();
lineResultGraphic.interactive = false;
lineResultGraphic.hitArea = new Rectangle(0,0,0,0)

/** ====================================================================== **/

/** @type {Graphics} unanimated steps graphics */ 
const stepsGraphic = new Graphics();
stepsGraphic.interactive = false;
stepsGraphic.hitArea = new Rectangle(0,0,0,0)

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
const animatedStepsGraphic = new Graphics();

/** @type {BezierCurveAnimator} The curve animator */
const bezierCurveAnimator = new BezierCurveAnimator(animatedStepsGraphic, stepDuration);

/** ====================================================================== **/


/** @type {BackgroundGraphic} animated steps graphics */ 
let backgroundGraphic;

/** ====================================================================== **/

let dynamicUpdate = true;
let showResultCoordinate = false;
let showInputLines = true;
let canZoom = true;

/** ================================================ Redraws ================================================ **/
/** sync the lines with the points */
function redrawInputLines() {
  inputLinesGraphic.clear();
  for(let i = 0; i < inputPoints.length-1; i++) {
    inputLinesGraphic.moveTo(inputPoints[i].x, inputPoints[i].y).lineTo(inputPoints[i+1].x, inputPoints[i+1].y)
      .fill(Data.slate50).stroke({ width: Data.lineWidth, color: Data.slate50 });
  }
}

/** Redraw line results*/
/** @type {CoordinateText[]} */
let resultCoordinateTexts = [];
/** @type {Graphics[]} */
let resultCoordinatePoints = [];
function redrawLineResult(){
  lineResultGraphic.clear();
  bezierCurve.refresh(p => {
    lineResultGraphic.moveTo(p.point1.x, p.point1.y).lineTo(p.point2.x, p.point2.y)
      .fill(Data.yellow400).stroke({ width: Data.lineWidth, color: Data.yellow400 });
  });

  // Handle the result coordinate checkbox
  if(showResultCoordinate && resultCoordinateTexts.length !== bezierCurve.syncablePointResult.length-1) {
    while(resultCoordinateTexts.length < bezierCurve.syncablePointResult.length-1) {
      const coordinateText = new CoordinateText();
      coordinateText.style.fill = Data.yellow400;
      const circleGraphic = new Graphics(DragablePoint.graphicContextYellow);
      resultCoordinatePoints.push(circleGraphic);
      circleGraphic.x = -Data.coordinateTextOffset;
      circleGraphic.y = -Data.coordinateTextOffset;
      coordinateText.addChild(circleGraphic);
      resultCoordinateTexts.push(coordinateText);
      graphicContainer.addChild(coordinateText);
    }
    while(resultCoordinateTexts.length > bezierCurve.syncablePointResult.length-1) {
      const p = resultCoordinateTexts.pop();
      resultCoordinatePoints.pop();
      graphicContainer.removeChild(p);
    }
    // Rename
    resultCoordinateTexts.forEach((el, i) => el.rename(`Q${i}`));

  }
  
  if(!showResultCoordinate && resultCoordinateTexts.length > 0) {
    resultCoordinateTexts.forEach(p => graphicContainer.removeChild(p));
    resultCoordinateTexts = [];    
  }
  
  if(showResultCoordinate  && resultCoordinateTexts.length === bezierCurve.syncablePointResult.length-1) {
    for(let i = 0; i < resultCoordinateTexts.length; i++) { 
      const p = bezierCurve.syncablePointResult[i];
      resultCoordinateTexts[i].x = p.point2.x + Data.coordinateTextOffset;
      resultCoordinateTexts[i].y = p.point2.y - Data.coordinateTextOffset;
      resultCoordinateTexts[i].setText(p.point2.x, p.point2.y);
    }
  }
}

/** Redraw step line results */
function redrawStepLineResult(){
  stepsGraphic.clear();
  stepLines.forEach(p => {
    p.sync();
    drawLineStep(p);
  });
  stepPoints.forEach(p => {
    p.sync();
    drawPointStep(p);
  });
}
/** ================================================ Redraws ================================================ **/



/** ================================================ Draw Animated Steps ================================================ **/
/**
 * Redraw animated line results
 * @param {SyncablePoint} p The point to draw
 */
function drawLineStep(p){
  stepsGraphic.moveTo(p.point1.x, p.point1.y).lineTo(p.point2.x, p.point2.y)
    .fill(Data.slate50).stroke({ width: Data.lineWidth, color: Data.slate50 });
}
/**
 * Redraw animated line results
 * @param {SyncablePoint} p The point that connected to 2 other points to draw
 */
function drawPointStep(p){
  stepsGraphic.circle(p.x, p.y, Data.pointRadius).fill(Data.slate50).circle(p.x, p.y, Data.pointRadius*0.80).fill(Data.slate950).circle(p.x, p.y, Data.pointRadius*0.40).fill(Data.slate50);
}
/** ================================================ Draw Animated Steps End ================================================ **/



/** ================================================ GUI Function ================================================ **/
/**
 * Add a new point input in GUI and dragable points in Canvas
 * @param {number} defaultX 
 * @param {number} defaultY 
 */
function addInput(defaultX, defaultY) {
  const name = `P${highestId}`;

  const dragablePoint = new DragablePoint(defaultX, defaultY);
  dragablePoint.setDragable(app);
  const coordinateText = new CoordinateText();
  coordinateText.attachToDraggablePoint(dragablePoint, Data.coordinateTextOffset, Data.coordinateTextOffset, name);
  
  graphicContainer.addChild(dragablePoint);
  inputPoints.push(dragablePoint);
  inputCoordinateTexts.push(coordinateText);
  redrawInputLines();

  const [newInput, inputX, inputY] = PointInput(name, defaultX - getHalfAppHeight(), defaultY - getHalfAppHeight(), 
    (div) => { // onRemove
      highestId--;
      graphicContainer.removeChild(dragablePoint);
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
      dragablePoint.setPosition(newPos.x + getHalfAppHeight(), newPos.y + getHalfAppHeight());
  });
  
  dragablePoint.addOnMoveListener((sender, {x, y}) => {
    inputX.value = x - getHalfAppHeight();
    inputY.value = y - getHalfAppHeight();
  });
  highestId++;
  inputListParent.appendChild(newInput.content);
  if(visualizationState !== 0) {
    InitializeCurves();
  }
}

/** Solve the Bezier Curve and draw to Canvas */
function visualizeCurve() {
  if(inputPoints.length < 3) return alert("Please add at least 3 points");

  if(visualizationState !== 0) InitializeCurves(); 
  visualizationState = 1;
  const p = inputPoints; // shorthand
  const iterations = getIteration();
  bezierCurve.clear();
  const startTime = performance.now();
  if(algorithmId === 0)
    bezierCurve.generateByDivideAndConquer(p, iterations);
  else
    bezierCurve.generateByBruteForce(p, iterations);
  setTimeTaken((performance.now() - startTime).toFixed(2));
  redrawLineResult();
}

/** Solve the Bezier Curve and draw with step by step animation */
async function showStepsAnimated() {
  if(inputPoints.length < 3) return alert("Please add at least 3 points");

  if(visualizationState !== 0) InitializeCurves(); 
  const p = inputPoints;
  const iterations = getIteration();
  bezierCurve.clear();
  stepPoints = [];
  stepLines = [];
  visualizationState = 2;
  if(algorithmId === 0)
    await bezierCurve.generateWithStepsByDivideAndConquer(p, iterations, stepDelay*1000, p => {
      bezierCurveAnimator.animatePointStep(p, () => stepPoints.push(p));
    }, p => {
      bezierCurveAnimator.animateLineStep(p, () => stepLines.push(p));
    });
  else
    await bezierCurve.generateWithStepsByBruteForce(p, iterations, stepDelay*1000, p => {
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
function toggleZoomScrollWheel(e) {
  canZoom = e.target.checked;
}
function toggleDynamicUpdate(e) {
  dynamicUpdate = e.target.checked;
}
/** ================================================ GUI Checkbox End ================================================ **/


/** ================================================ Initialization ================================================ **/
/** Clear all curves */
function InitializeCurves() {
  visualizationState = 0;
  graphicContainer.removeChildren();
  graphicContainer.addChild(backgroundGraphic, lineResultGraphic, stepsGraphic, animatedStepsGraphic, inputLinesGraphic);
  inputPoints.forEach(p => graphicContainer.addChild(p));
  redrawInputLines();
  lineResultGraphic.clear();
  stepPoints = [];
  stepLines = [];
  stepsGraphic.clear();
  animatedStepsGraphic.clear();
  bezierCurve.clear();
  resultCoordinateTexts = [];    
}

/** Initialize canvas and connect GUI with inputs */
(async () =>
{
  // await app.init({ background: Data.slate950, width:canvasWidth, height: canvasheight });
  await app.init({ background: Data.slate950, resizeTo: window});
  backgroundGraphic = new BackgroundGraphic(app);
  addEventListener("resize", () => backgroundGraphic.refreshBackground());
  InitializeCurves();
  
  document.getElementById('add-point').addEventListener('click', () => addInput(randomRange(0, app.renderer.width-rightMargin), randomRange(0, app.renderer.height)));
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
  const algorithmOptions = [document.getElementById('divide-and-conquer'), document.getElementById('brute-force')];
  algorithmOptions.forEach((el, i) => el.addEventListener('click', () => {
    algorithmId = i;
    AlgorithmOption(algorithmOptions, i);
  }));
  document.getElementById('dynamic-update').addEventListener('change', toggleDynamicUpdate);
  document.getElementById('result-coordinate').addEventListener('change', toggleResultCoordinate);
  document.getElementById('input-lines').addEventListener('change', toggleInputLines);
  document.getElementById('zoom-scroll-wheel').addEventListener('change', toggleZoomScrollWheel);

  addInput(app.renderer.width*0.3, app.renderer.height*0.2);
  addInput(app.renderer.width*0.4, app.renderer.height*0.7);
  addInput(app.renderer.width*0.6, app.renderer.height*0.7);
  addInput(app.renderer.width*0.7, app.renderer.height*0.2);

  app.stage.position.y = app.renderer.height / app.renderer.resolution;
  app.stage.scale.y = -1;

  app.stage.addChild(graphicContainer);

  // To make points dragable
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  // zoom stage by wheel
  let lastStagePos = new Point();
  addEventListener('wheel' , (e) => {
    if(!canZoom) return;
    const zoom = e.deltaY > 0 ? 1.1 : 0.9;

    const previousWidth = app.renderer.width;
    const previousHeight = app.renderer.height;
    const previousPositionX = app.stage.position.x;
    const previousPositionY = app.stage.position.y;


    app.renderer.resize(app.renderer.width * zoom, app.renderer.height * zoom);
    app.stage.position.y = app.renderer.height / app.renderer.resolution;
    app.stage.position.x = 0;
    backgroundGraphic.refreshBackground();

    // Resize data bazed on zoom
    Data.lineWidth *= zoom;
    Data.pointRadius *= zoom;
    Data.pointFontSize *= zoom;
    DragablePoint.resizeGraphicContext(Data.pointRadius);
    backgroundGraphic.resizeAllText(Data.pointFontSize);
    inputPoints.forEach(p => p.updateContext());
    resultCoordinatePoints.forEach(p => p.context = DragablePoint.graphicContextYellow);
    inputCoordinateTexts.forEach(p => p.resizeText(Data.pointFontSize));


    // move all points to handle negative
    inputPoints.forEach(p => {
      const x = p.x * zoom;
      const y = p.y * zoom;
      p.setPosition(x, y);
    });
  });



  
  // Drag stage with mouse
  let isDragging = false;
  app.stage.on('pointerup', () => {
    DragablePoint.onDragEnd();
    isDragging = false;
  });
  app.stage.on('pointerupoutside', () => {
    DragablePoint.onDragEnd();
    isDragging = false;
  });
  app.stage.on('pointerdown', (e) => {
    isDragging = true;
    lastStagePos = e.global.clone();
  });
  app.stage.on('pointermove', (e) => {
    if(DragablePoint.currentTarget) return; // if dragging point, don't drag stage
    if(isDragging) {
      const newPos = e.global.clone();
      app.stage.position.x += newPos.x - lastStagePos.x;
      app.stage.position.y += newPos.y - lastStagePos.y;
      lastStagePos = newPos;
    }
  });
  



  // To make the canvas full screen
  app.canvas.style.position = 'fixed';
  app.canvas.style.top = 0;
  app.canvas.style.left = 0;
  app.canvas.style.height = '100%';
  document.body.appendChild(app.canvas);

  // Using this loop is faster than subscribing to mouse move event
  app.ticker.add((ticker) => {
    bezierCurveAnimator.update(ticker);
    if(!dynamicUpdate) return;

    redrawInputLines();
    if(visualizationState === 1) redrawLineResult();
    else if(visualizationState === 2) redrawStepLineResult();

  });

})();
/** ================================================ Initialization End ================================================ **/


// Below is for handling negative. Bad way of doing it because it feels like singleton function, but i wont touch it anymore so i hope its fine.

/**
 * Handle negative. change this to return 0 if we dont want negative coordinate anymore
 */
export function getHalfAppWidth() {
  return roundTo(app.screen.width/2, 50);
}

/**
 * Handle negative. change this to return 0 if we dont want negative coordinate anymore
 */
export function getHalfAppHeight() {
  return roundTo(app.screen.height/2, 50);
  // return app.screen.height/2;
}