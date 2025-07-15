import { Graphics } from '@pixi/graphics';
import { TileType } from '../types/Tile';

const DEFAULT_SIZE = 32;

export class Player {
  public sprite: Graphics;
  private tileSize: number = DEFAULT_SIZE;
  private speed: number = DEFAULT_SIZE;
  private mapData: number[][];
  private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  constructor(mapData: number[][]) {
    this.mapData = mapData;
    this.sprite = new Graphics();
    this.sprite.x = DEFAULT_SIZE * 9;
    this.sprite.y = DEFAULT_SIZE * 4;
    this.drawPlayerFace(this.lastDirection);

    window.addEventListener('keydown', (e) => this.handleKey(e));
  }

  private handleKey(e: KeyboardEvent): void {
    const nextX = this.sprite.x;
    const nextY = this.sprite.y;

    if (e.key === 'ArrowUp') {
      this.lastDirection = 'up';
      if (this.canMove(nextX, nextY - this.speed)) {
        this.sprite.y -= this.speed;
      }
    }
    if (e.key === 'ArrowDown') {
      this.lastDirection = 'down';
      if (this.canMove(nextX, nextY + this.speed)) {
        this.sprite.y += this.speed;
      }
    }
    if (e.key === 'ArrowLeft') {
      this.lastDirection = 'left';
      if (this.canMove(nextX - this.speed, nextY)) {
        this.sprite.x -= this.speed;
      }
    }
    if (e.key === 'ArrowRight') {
      this.lastDirection = 'right';
      if (this.canMove(nextX + this.speed, nextY)) {
        this.sprite.x += this.speed;
      }
    }

    this.drawPlayerFace(this.lastDirection);
  }

  private drawPlayerFace(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.sprite.clear();

    // 몸통
    this.sprite.beginFill(0xfbceb1);
    this.sprite.drawRoundedRect(0, 0, this.tileSize, this.tileSize, 20);
    this.sprite.endFill();

    const centerX = this.tileSize / 2;
    const centerY = this.tileSize / 2;
    const offset = 3;
    const eyeGap = 4;

    let leftEyeX = centerX;
    let leftEyeY = centerY;
    let rightEyeX = centerX;
    let rightEyeY = centerY;

    if (direction === 'up') {
      leftEyeX = centerX - eyeGap;
      rightEyeX = centerX + eyeGap;
      leftEyeY = rightEyeY = centerY - offset;
    } else if (direction === 'down') {
      leftEyeX = centerX - eyeGap;
      rightEyeX = centerX + eyeGap;
      leftEyeY = rightEyeY = centerY + offset;
    } else if (direction === 'left') {
      leftEyeX = rightEyeX = centerX - offset;
      leftEyeY = centerY - eyeGap;
      rightEyeY = centerY + eyeGap;
    } else if (direction === 'right') {
      leftEyeX = rightEyeX = centerX + offset;
      leftEyeY = centerY - eyeGap;
      rightEyeY = centerY + eyeGap;
    }

    // 눈
    this.sprite.beginFill(0x000000);
    this.sprite.drawCircle(leftEyeX, leftEyeY, 2);
    this.sprite.drawCircle(rightEyeX, rightEyeY, 2);
    this.sprite.endFill();

    //공갈젖꼭지
    const pacifierOffset = this.tileSize * 0.4;
    let pacifierX = centerX;
    let pacifierY = centerY;

    if (direction === 'up') {
      pacifierY -= pacifierOffset;
    } else if (direction === 'down') {
      pacifierY += pacifierOffset;
    } else if (direction === 'left') {
      pacifierX -= pacifierOffset;
    } else if (direction === 'right') {
      pacifierX += pacifierOffset;
    }

    this.sprite.beginFill(0xffffff);
    this.sprite.drawCircle(pacifierX, pacifierY, 4);
    this.sprite.endFill();
  }


  private canMove(nextX: number, nextY: number): boolean {
    const col = nextX / this.tileSize;
    const row = nextY / this.tileSize;

    if (row < 0 || row >= this.mapData.length || col < 0 || col >= this.mapData[0].length) {
      return false;
    }

    const tile = this.mapData[row][col];
    return tile === TileType.Soil || tile === TileType.Tilled || tile === TileType.Watered || tile === TileType.Stone;
  }
}
