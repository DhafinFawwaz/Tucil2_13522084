import "./style.css"
import { PointInput } from './components/PointInput.js'
import { Application, Assets, Circle, Sprite, Graphics, Container } from 'pixi.js';
import Colors from "./config/color.json"
import Data from "./config/data.json"
import { DragablePoint } from "./components/DragablePoint.js";
import { LineFollow } from "./components/LineFollow.js";
import QuadraticBezierCurve from "./beziercurve/QuadraticBezierCurve.js";

let lastID = 0;
function addInput() {
  const inputListParent = document.getElementById('point-input-list')
  ++lastID;
  const newInput = PointInput(lastID, (newPos) => {

  });
  inputListParent.appendChild(newInput)
}
function visualizeCurve() {
  console.log('visualizing curve')
}
function showSteps() {
  console.log('showing steps')
}
document.getElementById('add-point').addEventListener('click', addInput);
document.getElementById('visualize-curve').addEventListener('click', visualizeCurve);
document.getElementById('show-steps').addEventListener('click', showSteps);
addInput();
addInput();
addInput();

const app = new Application();
const leftMargin = Data.leftMargin; // width of the sidebar
const canvasWidth = window.innerWidth-leftMargin;
const canvasheight = window.innerHeight;
(async () =>
{
  await app.init({ background: Colors.slate950, width:canvasWidth, height: canvasheight });
  
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', DragablePoint.onDragEnd);
  app.stage.on('pointerupoutside', DragablePoint.onDragEnd);
  
  app.canvas.style.position = 'fixed';
  app.canvas.style.top = 0;
  app.canvas.style.right = 0;
  app.canvas.style.height = '100%';
  document.body.appendChild(app.canvas);
  
  const p0 = new DragablePoint(canvasWidth/2-350, canvasheight/2+250, Data.rsm, Colors.slate50);
  p0.setDragable(app);

  const p1 = new DragablePoint(canvasWidth/2, canvasheight/2-250, Data.rsm, Colors.slate50);
  p1.setDragable(app);

  const p2 = new DragablePoint(canvasWidth/2+350, canvasheight/2+250, Data.rsm, Colors.slate50);
  p2.setDragable(app);
  
  const p0p1 = new LineFollow(p0, p1, Colors.slate50);
  const p1p2 = new LineFollow(p1, p2, Colors.slate50);

  const container = new Container();
  app.stage.addChild(container);
  container.addChild(p0, p1, p2);
  container.addChild(p0p1, p1p2);

  const bezierCurve = new QuadraticBezierCurve();
  const iterations = 3;
  // bezierCurve.generateToContainer(p0, p1, p2, iterations, container);
  bezierCurve.generateWithNonOutputToContainer(p0, p1, p2, iterations, container);

  return;
})();