import "./style.css"
import { PointInput } from './components/PointInput.js'
import { Application, Assets, Circle, Sprite, Graphics } from 'pixi.js';

let lastID = 0;
function addInput() {
  const inputListParent = document.getElementById('point-input-list')
  ++lastID;
  const newInput = PointInput(lastID);
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
const leftMargin = 256; // width of the sidebar
const canvasWidth = window.innerWidth-leftMargin;
const canvasheight = window.innerHeight;

(async () =>
{
  await app.init({ background: '#1099bb', width:canvasWidth, height: canvasheight });
  app.canvas.style.position = 'fixed';
  app.canvas.style.top = 0;
  app.canvas.style.right = 0;
  app.canvas.style.height = '100%';
  document.body.appendChild(app.canvas);
  
  let graphics = new Graphics();
  graphics.circle(canvasWidth/2, canvasheight/2, 20);
  graphics.fill(0xff3333);
  graphics.interactive = true;
  graphics.on('click', (event) => {
    graphics.x = 10
  });
  
  app.stage.addChild(graphics);
  app.ticker.add((time) => {
  });
})();
