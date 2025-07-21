import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Sprite } from '@pixi/sprite';
import { Text } from '@pixi/text';

import { Player } from '../objects/Player';
import { TileType } from '../types/Tile';
import { FruitType, ObjectCell, ObjectMap, ObjectType, SeedType, SproutType } from '../types/Object';

import treeImage from '../assets/texture/tree.png';
import stoneImage from '../assets/texture/stone.png';
import fondImage from '../assets/texture/fond.png';
import seedImage from '../assets/texture/seed.png';
import sproutImage from '../assets/texture/sprout.png';
import strawberryImage from '../assets/texture/spring_strawberry.png';
import cherryImage from "../assets/texture/spring_cherry.png";
import watermelonImage from "../assets/texture/summer_watermelon.png";
import cornImage from "../assets/texture/summer_corn.png";
import raspberryImage from "../assets/texture/autumn_raspberry.png";
import peachImage from "../assets/texture/autumn_peach.png";
import kiwiImage from "../assets/texture/winter_kiwi.png";
import orangeImage from "../assets/texture/winter_orange.png";

import { TILE_SIZE } from '../constants';
import { House } from '../objects/House';
import { Market } from '../objects/Market';
import { StatusBar } from '../objects/StatusBar';
import { Ticker } from '@pixi/core';
import { BlackSmith } from '../objects/BlackSmith';
import { Season } from '../core/App';

function isSeed(type: string): type is SeedType {
  return ['SpringSeed', 'SummerSeed', 'AutumnSeed', 'WinterSeed'].includes(type);
}

function isSprout(type: string): type is SproutType {
  return ['SpringSprout', 'SummerSprout', 'AutumnSprout', 'WinterSprout'].includes(type);
}

function isFruit(type: string): type is FruitType {
  return ['Strawberry', 'Cherry', 'Watermelon', 'Corn', 'Raspberry', 'Peach', 'Kiwi', 'Orange'].includes(type);
}

export class FarmScene {
  // 컨테이너 Layer 관련.
  private tileContainer: Container;
  private lowerObjectContainer = new Container();
  private playerContainer: Container;
  private upperObjectContainer: Container;
  private uiContainer: Container;

  // 플레이어 관련.
  public player: Player;

  // 건물 관련.
  private house: House;
  private market: Market;
  private blackSmith: BlackSmith;
  public onOpenMarket?: () => void;
  public onOpenBlackSmith?: () => void;
  public onShowInventory?: () => void;

  // 맵 크기 관련.
  private cols: number = 25;
  private rows: number = 19;
  private fixedMapRows: number = 5;

  // 맵 내 데이터 관련.
  private tileMap: number[][] = [];
  private objectMap: ObjectMap = [];

  // 토스트 알람 관련.
  private toastText: Text;
  private toastTimer = 0;
  private toastQueue: string[] = [];

  // 골드 UI 관련.
  private goldUnitText: Text;
  private goldText: Text;

  // 스테이터스 바 관련.
  public hpBar: StatusBar;
  public staminaBar: StatusBar;
  public waterBar: StatusBar;

  // Ticker 관련.
  private ticker: Ticker;

  constructor(stage: Container) {
    this.tileContainer = new Container();
    this.lowerObjectContainer = new Container();
    this.playerContainer = new Container();
    this.upperObjectContainer = new Container();
    this.uiContainer = new Container();

    stage.addChild(this.tileContainer);
    stage.addChild(this.lowerObjectContainer);
    stage.addChild(this.playerContainer);
    stage.addChild(this.upperObjectContainer);
    stage.addChild(this.uiContainer);

    this.generateMap();
    this.drawTiles();
    this.drawObjects();

    // 플레이어 관련.
    this.player = new Player(this.tileMap, this.objectMap, this);
    this.playerContainer.addChild(this.player.sprite);

    // 하우스 관련.
    this.house = new House(9, 1, 5, 2);
    this.house.occupyMap(this.objectMap);
    this.house.draw(this.upperObjectContainer);

    // 마켓 관련.
    this.market = new Market(16, 1, 3, 2);
    this.market.occupyMap(this.objectMap);
    this.market.draw(this.upperObjectContainer);

    // 대장간 관련.
    this.blackSmith = new BlackSmith(5, 1, 2, 2);
    this.blackSmith.occupyMap(this.objectMap);
    this.blackSmith.draw(this.upperObjectContainer);

    // 토스트 알람 관련.
    this.toastText = new Text('', { fontFamily: 'Galmuri11', fontSize: 14, fill: 0xff0000 });
    this.toastText.position.set(20, 70);
    this.toastText.visible = false;
    this.uiContainer.addChild(this.toastText);

    // 골드 관련.
    this.goldUnitText = new Text('G', { fontFamily: 'Galmuri11', fontSize: 14, fill: 0xffd700 });
    this.goldUnitText.position.set(675, 10);
    this.uiContainer.addChild(this.goldUnitText);

    this.goldText = new Text('', { fontFamily: 'Galmuri11', fontSize: 14, fill: 0xffd700 });
    this.uiContainer.addChild(this.goldText);

    // 스테이터스 바 관련.
    this.hpBar = new StatusBar(this.player.maxHp, '체력', 90, 10, 0xff0000);
    this.hpBar.position.set(700, 20);
    this.uiContainer.addChild(this.hpBar);

    this.staminaBar = new StatusBar(this.player.maxStamina, '기력', 90, 10, 0x00aa00);
    this.staminaBar.position.set(700, 50);
    this.uiContainer.addChild(this.staminaBar);

    this.waterBar = new StatusBar(this.player.maxWater, '물', 90, 10, 0x0000FF);
    this.waterBar.position.set(700, 80);
    this.uiContainer.addChild(this.waterBar);

    // Ticker 관련.
    this.ticker = new Ticker();
    this.ticker.maxFPS = 60;
    this.ticker.add(this.update.bind(this));
    this.ticker.start();
  }

  /** 맵 초기 생성 함수 */
  private generateMap(): void {
    this.tileMap = [];
    this.objectMap = [];

    // 각 행렬에 맞는 타일 유형 및 확률적으로 나무와 돌 오브젝트 생성.
    for (let row = 0; row < this.rows; row++) {
      const rowData: TileType[] = [];
      const objectRow: (ObjectCell | null)[] = [];

      for (let col = 0; col < this.cols; col++) {
        const isSoil = row >= this.fixedMapRows;
        rowData.push(isSoil ? TileType.Soil : TileType.Stone);

        if (isSoil && Math.random() < 0.2) {
          objectRow.push({
            target: 'upper',
            type: 'Tree',
            sprite: null,
          });
        } else if (isSoil && Math.random() < 0.15) {
          objectRow.push({
            target: 'upper',
            type: 'Stone',
            sprite: null,
          });
        } else objectRow.push(null);
      }

      this.tileMap.push(rowData);
      this.objectMap.push(objectRow);
    }

    // 연못 크기 및 위치 랜덤 배치
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
    this.upperObjectContainer.addChild(pondSprite);

    for (let row = startY; row < startY + waterHeight; row++) {
      for (let col = startX; col < startX + waterWidth; col++) {
        this.tileMap[row][col] = TileType.Water;
        this.objectMap[row][col] = null;
      }
    }
  }//end generateMap.

  public setNewSeasonMap(season: Season): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tileType = this.tileMap[row][col];
        const object = this.objectMap[row][col];

        if (object) {
          // 씨앗, 과일 리셋.
          if (object.target === 'lower' || isFruit(object.type)) {
            this.updateObject(row, col, null);
          }
        } else {
          if (tileType === TileType.Soil) {
            if (Math.random() < 0.1) {
              this.updateObject(row, col, 'Tree');
            } else if (Math.random() < 0.1) {
              this.updateObject(row, col, 'Stone');
            }
          }
        }
      }
    }

    this.player.setSeason(season); // 플레이어에게 시즌 정보 넘기기.
  }

  /** 맵 전체를 타일 유형에 맞게 그리는 함수 */
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
  }//end drawTiles.

  /** 맵 전체 오브젝트를 그리는 함수 */
  private drawObjects(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.drawObject(row, col);
      }
    }
  }

  /** 특정 row, col 에 오브젝트 그리는 함수. */
  private drawObject(row: number, col: number): void {
    const object = this.objectMap[row][col];

    if (!object) return;

    const targetContainer = object.target === 'upper' ? this.upperObjectContainer : this.lowerObjectContainer;

    if (object.type === 'Tree') {
      const sprite = Sprite.from(treeImage);
      sprite.anchor.set(0.5, 1.05); // X는 가운데, Y는 아래 기준 (땅에 닿게)
      sprite.x = col * TILE_SIZE + TILE_SIZE / 2;
      sprite.y = row * TILE_SIZE + TILE_SIZE; // 타일 하단에 맞춤
      sprite.scale.set(0.09); // 필요에 따라 조정, 비율 유지
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Stone') {
      const sprite = Sprite.from(stoneImage);
      sprite.anchor.set(0.5, 0.75); // X는 가운데, Y는 아래 기준 (땅에 닿게)
      sprite.x = col * TILE_SIZE + TILE_SIZE / 2;
      sprite.y = row * TILE_SIZE + TILE_SIZE; // 타일 하단에 맞춤
      sprite.scale.set(0.014, 0.025); // 필요에 따라 조정, 비율 유지
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (isSeed(object.type)) {
      const sprite = Sprite.from(seedImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (isSprout(object.type)) {
      const sprite = Sprite.from(sproutImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Strawberry') {
      const sprite = Sprite.from(strawberryImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Cherry') {
      const sprite = Sprite.from(cherryImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Watermelon') {
      const sprite = Sprite.from(watermelonImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Corn') {
      const sprite = Sprite.from(cornImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Raspberry') {
      const sprite = Sprite.from(raspberryImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Peach') {
      const sprite = Sprite.from(peachImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Kiwi') {
      const sprite = Sprite.from(kiwiImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    } else if (object.type === 'Orange') {
      const sprite = Sprite.from(orangeImage);
      sprite.x = col * TILE_SIZE;
      sprite.y = row * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      targetContainer.addChild(sprite);
      object.sprite = sprite;
    }

  }

  /** Ticker 를 통해 매번 갱신해줘야 하는 함수 모음. */
  private update(): void {
    this.toastUpdate();
    this.updateGold();
    this.hpBar.update(this.player.hp, this.player.maxHp);
    this.staminaBar.update(this.player.stamina, this.player.maxStamina);
    this.waterBar.update(this.player.water, this.player.maxWater);
  }

  /** 타일 유형에 맞춰 색상 값 뽑아내는 함수. */
  private getTileColor(tile: TileType): number {
    switch (tile) {
      case TileType.Soil: return 0xdeb887;
      case TileType.Tilled: return 0xcd853f;
      case TileType.Watered: return 0x8b5a2b;
      case TileType.Stone: return 0xa9a9a9;
      case TileType.Water: return 0xdeb887;
      default: return 0x8b5a2b;
    }
  }

  /** 타일 색깔에 맞춰 테구리 색깔 계산하는 함수. */
  public darkenColor(hex: number, amount: number): number {
    const r = Math.max(0, ((hex >> 16) & 0xff) - amount);
    const g = Math.max(0, ((hex >> 8) & 0xff) - amount);
    const b = Math.max(0, (hex & 0xff) - amount);
    return (r << 16) + (g << 8) + b;
  }

  /** 특정 row, col 에 타일 그리는 함수. *//** x */
  public drawTile(row: number, col: number): void {
    const index = row * this.cols + col;
    const color = this.getTileColor(this.tileMap[row][col]);

    const g = this.tileContainer.children[index] as Graphics;
    g.clear();
    g.lineStyle(1, this.darkenColor(color, 15), 0.7);
    g.beginFill(this.getTileColor(this.tileMap[row][col]));
    g.drawRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    g.endFill();
  }

  /** 특정 row, col 에 오브젝트 채우는 함수. */
  public updateObject(row: number, col: number, item: ObjectType | null): void {
    const object = this.objectMap[row][col];

    if (!!object) {
      const targetContainer = object.target === 'upper' ? this.upperObjectContainer : this.lowerObjectContainer;
      if (object.sprite) {
        targetContainer.removeChild(object.sprite);
        object.sprite.destroy();
      }
    }

    if (!item) {
      this.objectMap[row][col] = null;
      return;
    }

    if (item === 'SpringSeed') {
      this.objectMap[row][col] = { target: 'lower', type: 'SpringSeed', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'SummerSeed') {
      this.objectMap[row][col] = { target: 'lower', type: 'SummerSeed', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'AutumnSeed') {
      this.objectMap[row][col] = { target: 'lower', type: 'AutumnSeed', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'WinterSeed') {
      this.objectMap[row][col] = { target: 'lower', type: 'WinterSeed', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'SpringSprout') {
      this.objectMap[row][col] = { target: 'lower', type: 'SpringSprout', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'SummerSprout') {
      this.objectMap[row][col] = { target: 'lower', type: 'SummerSprout', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'AutumnSprout') {
      this.objectMap[row][col] = { target: 'lower', type: 'AutumnSprout', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'WinterSprout') {
      this.objectMap[row][col] = { target: 'lower', type: 'WinterSprout', sprite: null, data: { dayCnt: 0, duration: 2 } };
      this.drawObject(row, col);
    } else if (item === 'Tree') {
      this.objectMap[row][col] = { target: 'upper', type: 'Tree', sprite: null };
      this.drawObject(row, col);
    } else if (item === 'Stone') {
      this.objectMap[row][col] = { target: 'upper', type: 'Stone', sprite: null };
      this.drawObject(row, col);
    } else if (isFruit(item)) {
      this.updateFruitObject(row, col, item);
    }
  }

  /** 특정 row, col 에 과일(열매) 채우는 함수. */
  private updateFruitObject(row: number, col: number, type: FruitType): void {
    const randomQuality = Math.random();

    let quality: 0 | 1 | 2 = 0;
    if (randomQuality < 0.1) {
      quality = 2;
    } else if (randomQuality < 0.4) {
      quality = 1;
    }

    this.objectMap[row][col] = { target: 'upper', type, sprite: null, data: { dayCnt: 0, duration: 3, quality } };
    this.drawObject(row, col);
  }


  /** 토스트 알람 메세지 내용 큐 넣는 함수. */
  public queueToast(message: string): void {
    this.toastQueue.push(message);
    if (!this.toastText.visible) {
      this.showNextToast();
    }
  }

  /** 토스트 알람 노출 함수. */
  private showNextToast(): void {
    if (this.toastQueue.length === 0) return;
    this.toastText.text = this.toastQueue.shift()!;
    this.toastText.visible = true;
    this.toastTimer = 90;
  }

  /** 토스트 알람 타이머를 위한 함수. */
  public toastUpdate(): void {
    if (this.toastTimer > 0) {
      this.toastTimer--;
      if (this.toastTimer <= 0) {
        this.toastText.visible = false;
        this.showNextToast();
      }
    }
  }

  /** 현재 골드 상태 UI 갱신 함수. */
  private updateGold(): void {
    const amount = this.player.gold;
    this.goldText.text = amount.toString();
    this.goldText.position.set(this.goldUnitText.x - this.goldText.width - 5, 10);
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
        if (!object || object.target === 'upper') continue;

        const tileType = this.tileMap[row][col];
        if (tileType !== TileType.Watered) {
          this.updateObject(row, col, null);
          continue;
        }

        object.data.dayCnt++;
        if (object.data.dayCnt < object.data.duration) continue;

        if (object.type === 'SpringSeed') {
          this.updateObject(row, col, 'SpringSprout');
        } else if (object.type === 'SpringSprout') {
          const fruit = Math.random() < 0.3 ? 'Strawberry' : 'Cherry';
          this.updateObject(row, col, fruit);
        } else if (object.type === 'SummerSeed') {
          this.updateObject(row, col, 'SummerSprout');
        } else if (object.type === 'SummerSprout') {
          const fruit = Math.random() < 0.3 ? 'Watermelon' : 'Corn';
          this.updateObject(row, col, fruit);
        } else if (object.type === 'AutumnSeed') {
          this.updateObject(row, col, 'AutumnSprout');
        } else if (object.type === 'AutumnSprout') {
          const fruit = Math.random() < 0.3 ? 'Raspberry' : 'Peach';
          this.updateObject(row, col, fruit);
        } else if (object.type === 'WinterSeed') {
          this.updateObject(row, col, 'WinterSprout');
        } else if (object.type === 'WinterSprout') {
          const fruit = Math.random() < 0.3 ? 'Kiwi' : 'Orange';
          this.updateObject(row, col, fruit);
        }

      }//end for2.
    }//end for1.
  }//end nextDaySeedSimulate.

  /** 다음 날 갈때 타일 타입 재 계산. */
  private nextDayTileSimulate(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tileType = this.tileMap[row][col];

        if (tileType === TileType.Watered) {
          this.tileMap[row][col] = TileType.Tilled;
          this.drawTile(row, col);
        } else if (tileType === TileType.Tilled) {
          this.tileMap[row][col] = TileType.Soil;
          this.drawTile(row, col);
        }
      }//end for2.
    }//end for1.
  }//end nextDayTileSimulate.

}
