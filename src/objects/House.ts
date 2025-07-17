import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { ObjectMap } from '../types/Object';

export class House {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private tileSize: number = 32;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public occupyMap(objectMap: ObjectMap): void {
    for (let row = this.y; row < this.y + this.height; row++) {
      for (let col = this.x; col < this.x + this.width; col++) {
        objectMap[row][col] = { type: 'House' };
      }
    }
  }

  public draw(container: Container): void {
    for (let row = this.y; row < this.y + this.height; row++) {
      for (let col = this.x; col < this.x + this.width; col++) {
        const xPos = col * this.tileSize;
        const yPos = row * this.tileSize;

        const g: Graphics = new Graphics();
        g.lineStyle(1, 0x000000, 0.2);
        g.beginFill(0xffd700); // 노란색 집
        g.drawRect(0, 0, this.tileSize, this.tileSize);
        g.endFill();
        g.x = xPos;
        g.y = yPos;
        container.addChild(g);
      }
    }
  }
}
