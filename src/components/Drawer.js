import Data from '../config/data.json'

/**
 * Redraw animated line results
 * @param {SyncablePoint} p The point to draw
 * @param {Graphics} stepLinesGraphic The graphics that will get drawn
 */
export function drawLineStep(p, stepLinesGraphic){
  stepLinesGraphic
    .beginFill(Data.slate50).lineStyle({ width: Data.lineWidth, color: Data.slate50 })
    .moveTo(p.point1.x, p.point1.y).lineTo(p.point2.x, p.point2.y)
}

/**
 * Redraw animated line results
 * @param {SyncablePoint} p The point to draw
 * @param {Graphics} stepLinesGraphic The graphics that will get drawn
 */
export function drawLineResult(p, stepLinesGraphic){
  stepLinesGraphic
    .beginFill(Data.yellow400).lineStyle({ width: Data.lineWidth, color: Data.yellow400 })
    .moveTo(p.point1.x, p.point1.y).lineTo(p.point2.x, p.point2.y)
}

/**
 * Redraw animated line results
 * @param {SyncablePoint} p The point that connected to 2 other points to draw
 * @param {Graphics} stepCirclesGraphic The graphics that will get drawn
 */
export function drawPointStep(p, stepCirclesGraphic){
  // stepsGraphic.beginFill(Data.slate50).drawCircle(p.x, p.y, Data.pointRadius*0.5)
  stepCirclesGraphic.beginFill(Data.slate50).drawCircle(p.x, p.y, Data.pointRadius)
    .beginFill(Data.slate950).drawCircle(p.x, p.y, Data.pointRadius*0.80)
    .beginFill(Data.slate50).drawCircle(p.x, p.y, Data.pointRadius*0.40);
}

/**
 * Redraw animated line results
 * @param {SyncablePoint} p The point that connected to 2 other points to draw
 * @param {Graphics} stepCirclesGraphic The graphics that will get drawn
 */
export function drawPointResult(p, stepCirclesGraphic){
  stepCirclesGraphic.beginFill(Data.yellow400).drawCircle(p.x, p.y, Data.pointRadius)
    .beginFill(Data.slate950).drawCircle(p.x, p.y, Data.pointRadius*0.80)
    .beginFill(Data.yellow400).drawCircle(p.x, p.y, Data.pointRadius*0.40);
}