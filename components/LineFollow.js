import { Graphics } from "pixi.js";


export class LineFollow extends Graphics {

  update() {
    this.clear();
    this.moveTo(this.p1.x, this.p1.y);
    this.lineTo(this.p2.x, this.p2.y);
    this.fill(this.color);
    this.stroke({ width: 3, color: this.color });
  }

  constructor(p1, p2, color) {
    super();
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
    this.update();
    
    this.p1.on('pointermove', () => {
      this.update();
    });

    this.p2.on('pointermove', () => {
      this.update();
    });
  }
}