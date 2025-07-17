import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';

import { Player } from '../objects/Player';
import { House } from '../objects/House';
import { Market } from '../objects/Market';

import { TileType } from '../types/Tile';
import { ObjectCell, ObjectMap, ObjectType } from '../types/Object';

import { TILE_SIZE } from '../constants';

export class FarmScene {
  public player: Player;
  public onOpenMarket?: () => void;

  private container: Container;

  private house: House;
  private market: Market;

  private tileSize: number = TILE_SIZE;
  private cols: number = 25;
  private rows: number = 19;
  private fixedMapRows: number = 5; // 기존 돌 바닥 행의 수.

  private tileMap: number[][] = [];
  private objectMap: ObjectMap = [];

  private toastQueue: string[] = [];
  private toastText: Text;
  private toastTimer: number = 0;

  private inventoryContainer: Container;
  private woodText: Text;
  private stoneText: Text;
  private waterText: Text;
  private goldText: Text;

  constructor(stage: Container) {
    this.container = new Container();
    stage.addChild(this.container);

    // 타일 맵 그리기.
    this.generateMap();
    this.drawTileMap();

    // 플레이어 관련.
    this.player = new Player(this.tileMap, this.objectMap, this);
    this.container.addChild(this.player.sprite);

    // 하우스 관련.
    this.house = new House(7, 1, 5, 2);
    this.house.occupyMap(this.objectMap);
    this.house.draw(this.container);

    // 마켓 관련.
    this.market = new Market(14, 1, 3, 2);
    this.market.occupyMap(this.tileMap);
    this.market.draw(this.container);

    // 토스트 알람 관련.
    this.toastText = new Text('', { fontSize: 24, fill: 0xff0000 });
    this.toastText.anchor.set(0.5, 0);
    this.toastText.position.set(450, 20); // 화면 중앙 상단 (1000px 기준)
    this.toastText.visible = false;
    stage.addChild(this.toastText);

    // 인벤토리 관련.
    this.inventoryContainer = new Container();
    this.inventoryContainer.position.set(650, 20); // 우측 상단
    stage.addChild(this.inventoryContainer);

    this.woodText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.woodText.position.set(0, 0);
    this.inventoryContainer.addChild(this.woodText);

    this.stoneText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.stoneText.position.set(80, 0);
    this.inventoryContainer.addChild(this.stoneText);

    this.waterText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.waterText.position.set(0, 30);
    this.inventoryContainer.addChild(this.waterText);

    this.goldText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.goldText.position.set(80, 30);
    this.inventoryContainer.addChild(this.goldText);

    this.updateInventoryInfo(this.player);
  }

  /** 맵 초기 세팅하기. */
  private generateMap(): void {
    // 기존 tileMap 생성
    for (let row = 0; row < this.rows; row++) {
      const rowData: TileType[] = [];
      const objectRow: (ObjectCell | null)[] = [];
      for (let col = 0; col < this.cols; col++) {
        let tileType = TileType.Soil;
        if (row < this.fixedMapRows) tileType = TileType.Stone;
        if (tileType === TileType.Soil && Math.random() < 0.25) {
          objectRow.push({ type: 'Tree' as const });
        } else if (tileType === TileType.Soil && Math.random() < 0.10) {
          objectRow.push({ type: 'Stone' as const });
        } else {
          objectRow.push(null);
        }
        rowData.push(tileType);
      }
      this.tileMap.push(rowData);
      this.objectMap.push(objectRow);
    }

    // 물 구역 생성.
    const waterWidth = Math.floor(Math.random() * 3) + 3;   // 물 구역 넓이는 3 ~ 5
    const waterHeight = Math.floor(Math.random() * 3) + 3;  // 물 구역 높이는 3 ~ 5

    const startXMax = this.cols - waterWidth;
    const startYMax = this.rows - waterHeight;

    const startX = Math.floor(Math.random() * (startXMax + 1));
    const startY = this.fixedMapRows + Math.floor(Math.random() * (startYMax - this.fixedMapRows + 1));

    for (let row = startY; row < startY + waterHeight; row++) {
      for (let col = startX; col < startX + waterWidth; col++) {
        this.tileMap[row][col] = TileType.Water;
        this.objectMap[row][col] = null;
      }
    }
  }

  /** 맵 전체 타일 그리기. */
  private drawTileMap(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x: number = col * this.tileSize;
        const y: number = row * this.tileSize;
        const tileType: TileType = this.tileMap[row][col];

        let fillColor: number = 0x8b5a2b;

        if (tileType === TileType.Soil) fillColor = 0xdeb887;
        else if (tileType === TileType.Tilled) fillColor = 0xcd853f;
        else if (tileType === TileType.Watered) fillColor = 0x87ceeb;
        else if (tileType === TileType.Water) fillColor = 0x1e90ff;
        else if (tileType === TileType.Stone) fillColor = 0xa9a9a9;

        const g: Graphics = new Graphics();
        g.lineStyle(1, 0x000000, 0.1);
        g.beginFill(fillColor);
        g.drawRect(0, 0, this.tileSize, this.tileSize);
        g.endFill();
        g.x = x;
        g.y = y;
        this.container.addChild(g);

        // 오브젝트 그리기.
        const object = this.objectMap[row][col];
        if (object?.type === 'Tree') {
          g.beginFill(0x228b22);
          g.drawRect(10, 10, 6, 6);
          g.endFill();
        }
        if (object?.type === 'Stone') {
          g.beginFill(0xa9a9a9);
          g.drawRect(10, 10, 6, 6);
          g.endFill();
        }
      }
    }
  }

  /** 해당 행렬에 타일 업데이트 하기. */
  public updateTile(row: number, col: number): void {
    const tileType = this.tileMap[row][col];
    let fillColor = 0x8b5a2b;

    if (tileType === TileType.Soil) fillColor = 0xdeb887;
    else if (tileType === TileType.Tilled) fillColor = 0xcd853f;
    else if (tileType === TileType.Watered) fillColor = 0x87ceeb;
    else if (tileType === TileType.Water) fillColor = 0x1e90ff;
    else if (tileType === TileType.Stone) fillColor = 0xa9a9a9;

    // 기존 그래픽 삭제 후 다시 그림
    const graphicsIndex = row * this.cols + col;
    const graphics = this.container.children[graphicsIndex] as Graphics;
    graphics.clear();
    graphics.lineStyle(1, 0x000000, 0.1);
    graphics.beginFill(fillColor);
    graphics.drawRect(0, 0, this.tileSize, this.tileSize);
    graphics.endFill();
  }

  /** 해당 행렬에 오브젝트 업데이트 하기. (null 가능) */
  public updateObject(row: number, col: number, item: ObjectType | null): void {
    // 해당 타일에 있는 기존 그래픽을 제거하고 새로 그림
    const index = row * this.cols + col;
    const graphics = this.container.children[index] as Graphics;
    graphics.clear();

    // 타일 다시 칠하기 (배경)
    const tileType = this.tileMap[row][col];
    let fillColor = 0x8b5a2b;
    if (tileType === TileType.Soil) fillColor = 0xdeb887;
    else if (tileType === TileType.Tilled) fillColor = 0xcd853f;
    else if (tileType === TileType.Watered) fillColor = 0x87ceeb;
    else if (tileType === TileType.Water) fillColor = 0x1e90ff;
    else if (tileType === TileType.Stone) fillColor = 0xa9a9a9;

    graphics.lineStyle(1, 0x000000, 0.1);
    graphics.beginFill(fillColor);
    graphics.drawRect(0, 0, this.tileSize, this.tileSize);
    graphics.endFill();

    // 추가로 오브젝트 그리기
    if (item === 'Tree') {
      graphics.beginFill(0x228b22);
      graphics.drawRect(4, 4, this.tileSize - 8, this.tileSize - 8);
      graphics.endFill();
    } else if (item === 'Stone') {
      graphics.beginFill(0x999999);
      graphics.drawRect(8, 8, this.tileSize - 16, this.tileSize - 16);
      graphics.endFill();
    } else if (item === 'SpringSeed') {
      graphics.beginFill(0xffffff);
      graphics.drawRect(8, 8, this.tileSize - 16, this.tileSize - 16);
      graphics.endFill();
    }
  }

  public queueToast(message: string): void {
    this.toastQueue.push(message);
    if (!this.toastText.visible) {
      this.showNextToast();
    }
  }

  /** 다음 토스트 알람 보여주기 */
  private showNextToast(): void {
    if (this.toastQueue.length === 0) return;
    const message = this.toastQueue.shift()!;
    this.toastText.text = message;
    this.toastText.visible = true;
    this.toastTimer = 90;
  }

  /** 토스트 알람 업데이트 */
  public toastUpdate(): void {
    if (this.toastTimer > 0) {
      this.toastTimer--;
      if (this.toastTimer <= 0) {
        this.toastText.visible = false;
        this.showNextToast();
      }
    }
  }

  /** 인벤토리 상황 업데이트 */
  public updateInventoryInfo(player: Player): void {
    this.woodText.text = `🌲 ${player.inventory.wood}`;
    this.stoneText.text = `🪨 ${player.inventory.stone}`;
    this.waterText.text = `💧 ${player.inventory.water}`;
    this.goldText.text = `💰 ${player.inventory.gold}`;
  }
}
