import "./style.css"
import { PointInput } from './components/PointInput.js'
import { Application, Assets, Circle, Sprite, Graphics, Container } from 'pixi.js';
import Colors from "./config/color.json"
import Data from "./config/data.json"
import { DragablePoint } from "./components/DragablePoint.js";
import { LineFollow } from "./components/LineFollow.js";
import QuadraticBezierCurve from "./beziercurve/QuadraticBezierCurve.js";
import BezierCurve from "./beziercurve/BezierCurve";


const app = new Application();
const leftMargin = Data.leftMargin; // width of the sidebar
const canvasWidth = window.innerWidth-leftMargin;
const canvasheight = window.innerHeight;
const graphicContainer = new Container();

/** @type {HTMLElement} */ 
const inputListParent = document.getElementById('point-input-list')
let highestId = 0;

/** @type {DragablePoint[]} List of points */ 
const dragablePoints = [];
/** @type {LineFollow[]} List of lines */ 
const lines = [];

/** sync the lines with the points */
function refreshLines() {
  lines.forEach(l => graphicContainer.removeChild(l));
  if(dragablePoints.length < 2) return;
  for(let i = 0; i < dragablePoints.length-1; i++) {
    const line = new LineFollow(dragablePoints[i], dragablePoints[i+1], Colors.slate50);
    graphicContainer.addChild(line);
    graphicContainer.setChildIndex(line, 0); // send to back so the points are on top and can be dragged easily
    lines.push(line);
  }
}

/**
 * Add a new point input and dragable points
 * @param {number} defaultX 
 * @param {number} defaultY 
 */
function addInput(defaultX, defaultY) {

  const dragablePoint = new DragablePoint(defaultX, defaultY, Data.rsm, Colors.slate50);
  dragablePoint.setDragable(app);
  
  graphicContainer.addChild(dragablePoint);
  dragablePoints.push(dragablePoint);
  refreshLines();

  const [newInput, inputX, inputY] = PointInput("P"+highestId, defaultX, defaultY, 
    (div) => { // onRemove
      highestId--;
      graphicContainer.removeChild(dragablePoint);
      dragablePoints.splice(dragablePoints.indexOf(dragablePoint), 1);
      refreshLines();

      // update the point names
      inputListParent.querySelectorAll('[id=point-name]').forEach((el, i) => {
        const newName = `P${i}`
        el.textContent = newName;
      });
      

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

const iterationInput = document.getElementById('iterations');
function getIteration() {
  return parseInt(iterationInput.value);
}

/** To cache wether we should clear the curves or not */
let hasVisualized = false;
function visualizeCurve() {
  if(hasVisualized)clearCurves(); 
  hasVisualized = true;
  const iterations = getIteration();
  const bezierCurve = new QuadraticBezierCurve();
  const p = dragablePoints; // shorthand
  bezierCurve.generateToContainer(p[0], p[1], p[2], iterations, graphicContainer);
  // bezierCurve.generateWithNonOutputToContainer(p[0], p[1], p[2], iterations, graphicContainer);
  // bezierCurve.generateWithPointsToContainer(p[0], p[1], p[2], iterations, graphicContainer);
  // await bezierCurve.generateWithAnimatedVisualizationToContainer(p[0], p[1], p[2], iterations, graphicContainer, 100);
  // bezierCurve.generateWithConcurentAnimatedVisualizationToContainer(p[0], p[1], p[2], iterations, graphicContainer, 100);

  // const bezierCurve = new BezierCurve();
  // const pointList = [p[0], p[1], p[2]];
  // bezierCurve.generateToContainer(pointList, iterations, pointsContainer);
}
async function showStepsAnimated() {
  if(hasVisualized)clearCurves(); 
  hasVisualized = true;
  const iterations = getIteration();
  const bezierCurve = new QuadraticBezierCurve();
  const p = dragablePoints; // shorthand
  await bezierCurve.generateWithAnimatedVisualizationToContainer(p[0], p[1], p[2], iterations, graphicContainer, 100);
}
async function showStepsAnimatedConcurent() {
  if(hasVisualized)clearCurves(); 
  hasVisualized = true;
  const iterations = getIteration();
  const bezierCurve = new QuadraticBezierCurve();
  const p = dragablePoints; // shorthand
  bezierCurve.generateWithConcurentAnimatedVisualizationToContainer(p[0], p[1], p[2], iterations, graphicContainer, 100);
}
function clearCurves() {
  graphicContainer.removeChildren();
  dragablePoints.forEach(p => graphicContainer.addChild(p));
  refreshLines();
}


document.getElementById('add-point').addEventListener('click', () => addInput(canvasWidth/2, canvasheight/2));
document.getElementById('visualize-curve').addEventListener('click', visualizeCurve);
document.getElementById('show-steps').addEventListener('click', showStepsAnimated);
document.getElementById('clear-curves').addEventListener('click', clearCurves);

addInput(canvasWidth/2-350, canvasheight/2+250);
addInput(canvasWidth/2-250, canvasheight/2-250);
addInput(canvasWidth/2+250, canvasheight/2-250);
addInput(canvasWidth/2+350, canvasheight/2+250);


(async () =>
{
  await app.init({ background: Colors.slate950, width:canvasWidth, height: canvasheight });
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
})();