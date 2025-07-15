import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
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

  constructor(stage: Container) {
    this.container = new Container();
    stage.addChild(this.container);

    this.generateMap();
    this.drawTileMap();

    this.player = new Player(this.mapData, this);
    this.container.addChild(this.player.sprite);

    this.house = new House(7, 1, 5, 2);
    this.house.occupyMap(this.mapData);
    this.house.draw(this.container);
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
}
