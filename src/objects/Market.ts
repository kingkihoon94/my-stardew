import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';

import { ObjectMap } from '../types/Object';

import marketImage from '../assets/texture/market.png';
import { TILE_SIZE } from '../constants';

export class Market {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public occupyMap(objectMap: ObjectMap): void {
    for (let row = this.y; row < this.y + this.height; row++) {
      for (let col = this.x; col < this.x + this.width; col++) {
        objectMap[row][col] = { target: 'upper', type: 'Market', sprite: null };
      }
    }
  }

  public draw(container: Container): void {
    const sprite = Sprite.from(marketImage);
    sprite.x = this.x * TILE_SIZE;
    sprite.y = this.y * TILE_SIZE;
    sprite.width = this.width * TILE_SIZE;
    sprite.height = this.height * TILE_SIZE;
    sprite.anchor.set(0, 0.1); // 원하는 앵커 조정.

    container.addChild(sprite);
  }
}
