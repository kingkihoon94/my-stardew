import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Sprite } from '@pixi/sprite';
import { Text } from '@pixi/text';

import { Player } from '../objects/Player';
import { TileType } from '../types/Tile';
import { ObjectCell, ObjectMap, ObjectType } from '../types/Object';

import treeImage from '../assets/texture/tree.png';
import stoneImage from '../assets/texture/stone.png';
import fondImage from '../assets/texture/fond.png';
import seedImage from '../assets/texture/seed.png';

import { TILE_SIZE } from '../constants';
import { House } from '../objects/House';
import { Market } from '../objects/Market';

export class FarmScene {
  public player: Player;
  public onOpenMarket?: () => void;

  private house: House;
  private market: Market;

  private tileContainer: Container;
  private playerContainer: Container;
  private objectContainer: Container;
  private uiContainer: Container;

  private cols: number = 25;
  private rows: number = 19;
  private fixedMapRows: number = 5;

  private tileMap: number[][] = [];
  private objectMap: ObjectMap = [];

  private toastText: Text;
  private toastTimer = 0;
  private toastQueue: string[] = [];

  private woodText: Text;
  private stoneText: Text;
  private waterText: Text;
  private goldText: Text;

  constructor(stage: Container) {
    this.tileContainer = new Container();
    this.objectContainer = new Container();
    this.playerContainer = new Container();
    this.uiContainer = new Container();

    stage.addChild(this.tileContainer);
    stage.addChild(this.playerContainer);
    stage.addChild(this.objectContainer);
    stage.addChild(this.uiContainer);

    this.generateMap();
    this.drawTiles();
    this.drawObjects();

    // 플레이어 관련.
    this.player = new Player(this.tileMap, this.objectMap, this);
    this.playerContainer.addChild(this.player.sprite);

    // 하우스 관련.
    this.house = new House(7, 1, 5, 2);
    this.house.occupyMap(this.objectMap);
    this.house.draw(this.objectContainer);

    // 마켓 관련.
    this.market = new Market(14, 1, 3, 2);
    this.market.occupyMap(this.objectMap);
    this.market.draw(this.objectContainer);

    this.toastText = new Text('', { fontSize: 24, fill: 0xff0000 });
    this.toastText.position.set(400, 20);
    this.toastText.visible = false;
    this.uiContainer.addChild(this.toastText);

    this.woodText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.woodText.position.set(670, 20);
    this.uiContainer.addChild(this.woodText);

    this.stoneText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.stoneText.position.set(740, 20);
    this.uiContainer.addChild(this.stoneText);

    this.waterText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.waterText.position.set(670, 50);
    this.uiContainer.addChild(this.waterText);

    this.goldText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.goldText.position.set(740, 50);
    this.uiContainer.addChild(this.goldText);

    this.updateInventoryInfo();
  }

  private generateMap(): void {
    this.tileMap = [];
    this.objectMap = [];

    for (let row = 0; row < this.rows; row++) {
      const rowData: TileType[] = [];
      const objectRow: (ObjectCell | null)[] = [];

      for (let col = 0; col < this.cols; col++) {
        const isSoil = row >= this.fixedMapRows;
        rowData.push(isSoil ? TileType.Soil : TileType.Stone);

        if (isSoil && Math.random() < 0.2) {
          objectRow.push({
            type: 'Tree',
            sprite: null,
          });
        } else if (isSoil && Math.random() < 0.15) {
          objectRow.push({
            type: 'Stone',
            sprite: null,
          });
        } else objectRow.push(null);
      }

      this.tileMap.push(rowData);
      this.objectMap.push(objectRow);
    }

    const waterWidth = Math.floor(Math.random() * 3) + 5;   // 물 구역 넓이는 5 ~ 7
    const waterHeight = Math.floor(Math.random() * 3) + 3;  // 물 구역 높이는 3 ~ 5

    const startXMax = this.cols - waterWidth;
    const startYMax = this.rows - waterHeight;

    const startX = Math.floor(Math.random() * (startXMax + 1));
    const startY = this.fixedMapRows + Math.floor(Math.random() * (startYMax - this.fixedMapRows + 1));

    const pondSprite = Sprite.from(fondImage);
    pondSprite.x = startX * TILE_SIZE;
    pondSprite.y = startY * TILE_SIZE;
    pondSprite.width = waterWidth * TILE_SIZE;
    pondSprite.height = waterHeight * TILE_SIZE;
    this.objectContainer.addChild(pondSprite);

    for (let row = startY; row < startY + waterHeight; row++) {
      for (let col = startX; col < startX + waterWidth; col++) {
        this.tileMap[row][col] = TileType.Water;
        this.objectMap[row][col] = null;
      }
    }
  }

  private drawTiles(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const g = new Graphics();
        const color = this.getTileColor(this.tileMap[row][col]);
        g.lineStyle(1, this.darkenColor(color, 15), 0.7);
        g.beginFill(color);
        g.drawRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        g.endFill();
        this.tileContainer.addChild(g);
      }
    }
  }

  private drawObjects(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.drawObject(row, col);
      }
    }
  }

  private drawObject(row: number, col: number): void {
    const object = this.objectMap[row][col];

    if (object?.type === 'Tree') {
      const treeSprite = Sprite.from(treeImage);
      treeSprite.anchor.set(0.5, 1.05); // X는 가운데, Y는 아래 기준 (땅에 닿게)
      treeSprite.x = col * TILE_SIZE + TILE_SIZE / 2;
      treeSprite.y = row * TILE_SIZE + TILE_SIZE; // 타일 하단에 맞춤
      treeSprite.scale.set(0.09); // 필요에 따라 조정, 비율 유지
      this.objectContainer.addChild(treeSprite);
      object.sprite = treeSprite;
    } else if (object?.type === 'Stone') {
      const stoneSprite = Sprite.from(stoneImage);
      stoneSprite.anchor.set(0.5, 0.75); // X는 가운데, Y는 아래 기준 (땅에 닿게)
      stoneSprite.x = col * TILE_SIZE + TILE_SIZE / 2;
      stoneSprite.y = row * TILE_SIZE + TILE_SIZE; // 타일 하단에 맞춤
      stoneSprite.scale.set(0.014, 0.025); // 필요에 따라 조정, 비율 유지
      this.objectContainer.addChild(stoneSprite);
      object.sprite = stoneSprite;
    } else if (object?.type === 'SpringSeed') {
      const seedSprite = Sprite.from(seedImage);
      seedSprite.x = col * TILE_SIZE;
      seedSprite.y = row * TILE_SIZE;
      seedSprite.width = TILE_SIZE;
      seedSprite.height = TILE_SIZE;
      this.objectContainer.addChild(seedSprite);
      object.sprite = seedSprite;
    }
  }

  private getTileColor(tile: TileType): number {
    switch (tile) {
      case TileType.Soil: return 0xdeb887;
      case TileType.Tilled: return 0xcd853f;
      case TileType.Watered: return 0x87ceeb;
      case TileType.Stone: return 0xa9a9a9;
      case TileType.Water: return 0xdeb887;
      default: return 0x8b5a2b;
    }
  }

  public darkenColor(hex: number, amount: number): number {
    const r = Math.max(0, ((hex >> 16) & 0xff) - amount);
    const g = Math.max(0, ((hex >> 8) & 0xff) - amount);
    const b = Math.max(0, (hex & 0xff) - amount);
    return (r << 16) + (g << 8) + b;
  }

  public updateTile(row: number, col: number): void {
    const index = row * this.cols + col;
    const color = this.getTileColor(this.tileMap[row][col]);

    const g = this.tileContainer.children[index] as Graphics;
    g.clear();
    g.lineStyle(1, this.darkenColor(color, 15), 0.7);
    g.beginFill(this.getTileColor(this.tileMap[row][col]));
    g.drawRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    g.endFill();
  }

  /** 해당 맵에 오브젝트 넣는거 까지만 하는 함수. 그리는 부분은 drawObject 에서 한다. */
  public updateObject(row: number, col: number, item: ObjectType | null): void {
    const object = this.objectMap[row][col];
    if (object?.sprite) {
      this.objectContainer.removeChild(object.sprite);
    }
    this.objectMap[row][col] = null;

    if (item === 'Tree') {
      this.objectMap[row][col] = { type: 'Tree', sprite: null };
      this.drawObject(row, col);
    } else if (item === 'SpringSeed') {
      this.objectMap[row][col] = { type: 'SpringSeed', sprite: null, data: { dayCnt: 0 } }
      this.drawObject(row, col);
    }
  }

  public queueToast(message: string): void {
    this.toastQueue.push(message);
    if (!this.toastText.visible) {
      this.showNextToast();
    }
  }

  private showNextToast(): void {
    if (this.toastQueue.length === 0) return;
    this.toastText.text = this.toastQueue.shift()!;
    this.toastText.visible = true;
    this.toastTimer = 90;
  }

  public toastUpdate(): void {
    if (this.toastTimer > 0) {
      this.toastTimer--;
      if (this.toastTimer <= 0) {
        this.toastText.visible = false;
        this.showNextToast();
      }
    }
  }

  public updateInventoryInfo(): void {
    this.woodText.text = `🌲 ${this.player.inventory.wood}`;
    this.stoneText.text = `🪨 ${this.player.inventory.stone}`;
    this.waterText.text = `💧 ${this.player.inventory.water}`;
    this.goldText.text = `💰 ${this.player.inventory.gold}`;
  }

  /** 다음 날로 갈때 계산해야 하는 것들 모음. */
  public nextDaySimulate(): void {
    this.nextDaySeedSimulate();
    this.nextDayTileSimulate();
  }

  /** 다음 날 갈때 씨앗 성장. */
  private nextDaySeedSimulate(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const object = this.objectMap[row][col];

        if (object?.type === 'SpringSeed') {
          const tile = this.tileMap[row][col];

          if (tile === TileType.Watered) {
            object.data.dayCnt++;

            if (object.data.dayCnt === 3) {
              this.updateObject(row, col, 'Tree');
            }
          } else {
            this.updateObject(row, col, null);
          }
        }

      }
    }
  }

  /** 다음 날 갈때 타일 타입 재 계산. */
  private nextDayTileSimulate(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tile = this.tileMap[row][col];

        if (tile === TileType.Watered) {
          this.tileMap[row][col] = TileType.Tilled;
          this.updateTile(row, col);
        } else if (tile === TileType.Tilled) {
          this.tileMap[row][col] = TileType.Soil;
          this.updateTile(row, col);
        }
      }
    }
  }

}
