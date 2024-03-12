import { Graphics, Circle } from 'pixi.js';

export class DragablePoint extends Graphics {
  constructor(x, y, radius, color) {
    super();
    this.circle(0, 0, radius);
    this.fill(color);

    this.circle(0, 0, radius*0.80);
    this.cut();

    this.circle(0, 0, radius*0.45);
    this.fill(color);
    

    this.hitArea = new Circle(0, 0, radius);
    
    this.x = x;
    this.y = y;
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', () => {
      this.alpha = 0.75;
    });
    this.on('pointerout', () => {
      this.alpha = 1;
    });
  }
  setDragStart(onDragStart) {
    this.on('pointerdown', onDragStart, this.graphics);
  }
}