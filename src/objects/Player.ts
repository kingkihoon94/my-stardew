import { Graphics } from '@pixi/graphics';
import { TileType } from '../types/Tile';
import { FarmScene } from '../scenes/FarmScene';
import { Ticker } from '@pixi/core';

const DEFAULT_SIZE = 32;
const STAMINA_TREE = 3;
const STAMINA_ROCK = 4;
const STAMINA_WATER = 5;

export class Player {
  public sprite: Graphics;
  public hp: number = 100;
  public stamina: number = 50;
  public level: number = 1;

  public maxHp: number = 100;
  public maxStamina: number = 50;

  public inventory: Record<string, number> = {
    wood: 0,
    stone: 0,
    water: 0,
  };

  private exp: number = 0;
  private expToLevelUp: number = 100;

  private tileSize: number = 32;
  private speed: number = DEFAULT_SIZE;
  private mapData: number[][];
  private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  private exhaustedTicker: Ticker | null = null;
  private isExhausted: boolean = false;


  constructor(mapData: number[][], private farmScene: FarmScene) {
    this.mapData = mapData;
    this.sprite = new Graphics();
    this.resetPosition();
    this.drawPlayerFace(this.lastDirection);

    window.addEventListener('keydown', (e) => this.handleKey(e));
  }

  public gainExp(amount: number): void {
    this.exp += amount;
  }

  public sleep(): void {
    this.levelUpCheck();
    this.hp = this.maxHp;
    this.stamina = this.maxStamina;
  }

  private levelUpCheck(): void {
    while (this.exp >= this.expToLevelUp) {
      this.exp -= this.expToLevelUp;
      this.level += 1;
      this.expToLevelUp += 20;
      this.maxHp += 10;
      this.maxStamina += 5;
    }
  }

  public resetPosition(): void {
    this.sprite.x = DEFAULT_SIZE * 9;
    this.sprite.y = DEFAULT_SIZE * 4;
    this.lastDirection = 'down';
    this.drawPlayerFace(this.lastDirection);

    if (this.isExhausted) {
      this.isExhausted = false;
      this.stopExhaustedEffect();
    }
  }

  private handleKey(e: KeyboardEvent): void {
    if (this.hp <= 0 || this.stamina <= 0) {
      if (!this.isExhausted) {
        this.isExhausted = true;
        this.showExhaustedEffect();
      }
      return;
    } else if (this.isExhausted) {
      this.isExhausted = false;
      this.stopExhaustedEffect();
    }

    const nextX = this.sprite.x;
    const nextY = this.sprite.y;

    if (e.key === 'ArrowUp') {
      this.lastDirection = 'up';
      if (this.canMove(nextX, nextY - this.speed)) {
        this.sprite.y -= this.speed;
        this.stamina -= 1;
      }
    }
    if (e.key === 'ArrowDown') {
      this.lastDirection = 'down';
      if (this.canMove(nextX, nextY + this.speed)) {
        this.sprite.y += this.speed;
        this.stamina -= 1;
      }
    }
    if (e.key === 'ArrowLeft') {
      this.lastDirection = 'left';
      if (this.canMove(nextX - this.speed, nextY)) {
        this.sprite.x -= this.speed;
        this.stamina -= 1;
      }
    }
    if (e.key === 'ArrowRight') {
      this.lastDirection = 'right';
      if (this.canMove(nextX + this.speed, nextY)) {
        this.sprite.x += this.speed;
        this.stamina -= 1;
      }
    }

    if (e.key === ' ') {
      this.performAction();
    }

    this.drawPlayerFace(this.lastDirection);
  }

  private performAction(): void {
    const offsetX = this.lastDirection === 'left' ? -this.speed : this.lastDirection === 'right' ? this.speed : 0;
    const offsetY = this.lastDirection === 'up' ? -this.speed : this.lastDirection === 'down' ? this.speed : 0;

    const targetCol = (this.sprite.x + offsetX) / this.tileSize;
    const targetRow = (this.sprite.y + offsetY) / this.tileSize;

    if (targetRow < 0 || targetRow >= this.mapData.length || targetCol < 0 || targetCol >= this.mapData[0].length) return;

    const targetTile = this.mapData[targetRow][targetCol];

    if (targetTile === TileType.Tree) {
      if (this.stamina < STAMINA_TREE) return;
      this.stamina -= STAMINA_TREE;
      this.mapData[targetRow][targetCol] = TileType.Soil;
      this.gainExp(10); // 나무는 경험치 10
      this.farmScene.updateTile(targetRow, targetCol);
      console.log('나무 아이템 획득');
    }

    if (targetTile === TileType.SoilWithStone) {
      if (this.stamina < STAMINA_ROCK) return;
      this.stamina -= STAMINA_ROCK;
      this.mapData[targetRow][targetCol] = TileType.Soil;
      this.gainExp(20); // 바위는 경험치 20
      this.farmScene.updateTile(targetRow, targetCol);
      console.log('돌 아이템 획득');
    }

    if (targetTile === TileType.Water) {
      if (this.stamina < STAMINA_WATER) return;
      this.stamina -= STAMINA_WATER;
      console.log('물 획득');
    }
  }

  public showExhaustedEffect(): void {
    let direction = -1;
    this.exhaustedTicker = new Ticker();
    this.exhaustedTicker.add(() => {
      this.sprite.alpha += 0.05 * direction;
      if (this.sprite.alpha <= 0.5) direction = 1;
      if (this.sprite.alpha >= 1) direction = -1;
    });
    this.exhaustedTicker.start();
  }

  public stopExhaustedEffect(): void {
    if (this.exhaustedTicker) {
      this.exhaustedTicker.stop();
      this.exhaustedTicker.destroy();
      this.exhaustedTicker = null;
      this.sprite.alpha = 1;
    }
  }

  private drawPlayerFace(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.sprite.clear();
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

    this.sprite.beginFill(0x000000);
    this.sprite.drawCircle(leftEyeX, leftEyeY, 2);
    this.sprite.drawCircle(rightEyeX, rightEyeY, 2);
    this.sprite.endFill();

    const pacifierOffset = this.tileSize * 0.4;
    let pacifierX = centerX;
    let pacifierY = centerY;

    if (direction === 'up') pacifierY -= pacifierOffset;
    else if (direction === 'down') pacifierY += pacifierOffset;
    else if (direction === 'left') pacifierX -= pacifierOffset;
    else if (direction === 'right') pacifierX += pacifierOffset;

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

