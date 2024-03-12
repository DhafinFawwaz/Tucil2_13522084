import "./style.css"
import { PointInput } from './components/PointInput.js'
import { Application, Assets, Circle, Sprite, Graphics } from 'pixi.js';
import Colors from "./config/color.json"
import Data from "./config/data.json"
import { DragablePoint } from "./components/DragablePoint.js";
import { LineFollow } from "./components/LineFollow.js";

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
  app.stage.on('pointerup', onDragEnd);
  app.stage.on('pointerupoutside', onDragEnd);
  
  app.canvas.style.position = 'fixed';
  app.canvas.style.top = 0;
  app.canvas.style.right = 0;
  app.canvas.style.height = '100%';
  document.body.appendChild(app.canvas);
  
  let p1 = new DragablePoint(canvasWidth/2-200, canvasheight/2, Data.rsm, Colors.slate50);
  p1.setDragStart(onDragStart);
  app.stage.addChild(p1);

  let p2 = new DragablePoint(canvasWidth/2, canvasheight/2-200, Data.rsm, Colors.slate50);
  p2.setDragStart(onDragStart);
  app.stage.addChild(p2);

  let p3 = new DragablePoint(canvasWidth/2+200, canvasheight/2, Data.rsm, Colors.slate50);
  p3.setDragStart(onDragStart);
  app.stage.addChild(p3);

  let l12 = new LineFollow(p1, p2, Colors.slate50);
  app.stage.addChild(l12);

  
  let l23 = new LineFollow(p2, p3, Colors.slate50);
  app.stage.addChild(l23);
  
})();

let dragTarget = null;
function onDragStart(){
  this.alpha = 0.5;
  dragTarget = this;
  app.stage.on('pointermove', onDragMove);
}
function onDragMove(event){
  if (dragTarget){
    dragTarget.parent.toLocal(event.global, null, dragTarget.position);
  }
}
function onDragEnd(){
  console.log('drag end')
  if (dragTarget){
    app.stage.off('pointermove', onDragMove);
    dragTarget.alpha = 1;
    dragTarget = null;
  }
}