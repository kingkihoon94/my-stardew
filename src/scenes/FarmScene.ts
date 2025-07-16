import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { Player } from '../objects/Player';
import { House } from '../objects/House';
import { TileType } from '../types/Tile';

export class FarmScene {
  public player: Player;
  private house: House;
  private container: Container;
  private tileSize: number = 32;
  private cols: number = 25;
  private rows: number = 19;
  private fixedMapRows: number = 5;
  private mapData: number[][] = [];

  private toastQueue: string[] = [];
  private toastText: Text;
  private toastTimer: number = 0;

  private inventoryContainer: Container;
  private woodText: Text;
  private stoneText: Text;
  private waterText: Text;

  constructor(stage: Container) {
    this.container = new Container();
    stage.addChild(this.container);

    this.generateMap();
    this.drawTileMap();

    // 플레이어 관련.
    this.player = new Player(this.mapData, this);
    this.container.addChild(this.player.sprite);

    // 하우스 관련.
    this.house = new House(7, 1, 5, 2);
    this.house.occupyMap(this.mapData);
    this.house.draw(this.container);

    // 토스트 알람 관련.
    this.toastText = new Text('', { fontSize: 24, fill: 0xff0000 });
    this.toastText.anchor.set(0.5, 0);
    this.toastText.position.set(450, 20); // 화면 중앙 상단 (1000px 기준)
    this.toastText.visible = false;
    stage.addChild(this.toastText);

    // 인벤토리 관련.
    this.inventoryContainer = new Container();
    this.inventoryContainer.position.set(750, 20); // 우측 상단
    stage.addChild(this.inventoryContainer);

    this.woodText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.woodText.position.set(0, 0);
    this.inventoryContainer.addChild(this.woodText);

    this.stoneText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.stoneText.position.set(0, 30);
    this.inventoryContainer.addChild(this.stoneText);

    this.waterText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.waterText.position.set(0, 60);
    this.inventoryContainer.addChild(this.waterText);

    this.updateInventoryInfo(this.player);
  }

  private generateMap(): void {
    for (let row = 0; row < this.fixedMapRows; row++) {
      const rowData: TileType[] = [];
      for (let col = 0; col < this.cols; col++) {
        rowData.push(TileType.Stone);
      }
      this.mapData.push(rowData);
    }

    for (let row = this.fixedMapRows; row < this.rows; row++) {
      const rowData: TileType[] = [];
      for (let col = 0; col < this.cols; col++) {
        let tileType = Math.random() < 0.75 ? TileType.Soil : TileType.Tree;
        if (tileType === TileType.Soil && Math.random() < 0.2) {
          tileType = TileType.SoilWithStone;
        }
        rowData.push(tileType);
      }
      this.mapData.push(rowData);
    }

    const waterWidth = Math.floor(Math.random() * 3) + 2;   // 물 구역 넓이는 2 ~ 4
    const waterHeight = Math.floor(Math.random() * 3) + 2;  // 물 구역 높이는 2 ~ 4

    const startXMax = this.cols - waterWidth;
    const startYMax = this.rows - waterHeight;

    const startX = Math.floor(Math.random() * (startXMax + 1));
    const startY = this.fixedMapRows + Math.floor(Math.random() * (startYMax - this.fixedMapRows + 1));

    for (let row = startY; row < startY + waterHeight; row++) {
      for (let col = startX; col < startX + waterWidth; col++) {
        this.mapData[row][col] = TileType.Water;
      }
    }
  }

  private drawTileMap(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x: number = col * this.tileSize;
        const y: number = row * this.tileSize;
        const tileType: number = this.mapData[row][col];
        let fillColor: number = 0x8b5a2b;

        if (tileType === TileType.Soil) fillColor = 0xdeb887;
        else if (tileType === TileType.Tilled) fillColor = 0xcd853f;
        else if (tileType === TileType.Watered) fillColor = 0x87ceeb;
        else if (tileType === TileType.Tree) fillColor = 0x228b22;
        else if (tileType === TileType.Water) fillColor = 0x1e90ff;
        else if (tileType === TileType.Stone) fillColor = 0xa9a9a9;
        else if (tileType === TileType.SoilWithStone) fillColor = 0xc1e0dc;

        const g: Graphics = new Graphics();
        g.lineStyle(1, 0x000000, 0.1);
        g.beginFill(fillColor);
        g.drawRect(0, 0, this.tileSize, this.tileSize);
        g.endFill();
        g.x = x;
        g.y = y;
        this.container.addChild(g);
      }
    }
  }

  public updateTile(row: number, col: number): void {
    const tileType = this.mapData[row][col];
    let fillColor = 0x8b5a2b;

    if (tileType === TileType.Soil) fillColor = 0xdeb887;
    else if (tileType === TileType.Tilled) fillColor = 0xcd853f;
    else if (tileType === TileType.Watered) fillColor = 0x87ceeb;
    else if (tileType === TileType.Tree) fillColor = 0x228b22;
    else if (tileType === TileType.Water) fillColor = 0x1e90ff;
    else if (tileType === TileType.Stone) fillColor = 0xa9a9a9;
    else if (tileType === TileType.SoilWithStone) fillColor = 0xc1e0dc;

    // 기존 그래픽 삭제 후 다시 그림
    const graphicsIndex = row * this.cols + col;
    const graphics = this.container.children[graphicsIndex] as Graphics;
    graphics.clear();
    graphics.lineStyle(1, 0x000000, 0.1);
    graphics.beginFill(fillColor);
    graphics.drawRect(0, 0, this.tileSize, this.tileSize);
    graphics.endFill();
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
  }
}
