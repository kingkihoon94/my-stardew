import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Player } from '../objects/Player';
import { House } from '../objects/House';
import { TileType } from '../types/Tile';

export class FarmScene {
  private container: Container;
  private player: Player;
  private house: House;
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

    this.player = new Player(this.mapData);
    this.container.addChild(this.player.sprite);

    this.house = new House(7, 1, 5, 2);
    this.house.occupyMap(this.mapData);
    this.house.draw(this.container);
  }

  private generateMap(): void {
    // 상단 5줄 고정 Stone
    for (let row = 0; row < this.fixedMapRows; row++) {
      const rowData: TileType[] = [];
      for (let col = 0; col < this.cols; col++) {
        rowData.push(TileType.Stone);
      }
      this.mapData.push(rowData);
    }

    // 나머지 줄: Soil, Tree만 랜덤
    for (let row = this.fixedMapRows; row < this.rows; row++) {
      const rowData: TileType[] = [];
      for (let col = 0; col < this.cols; col++) {
        let tileType = Math.random() < 0.75
          ? TileType.Soil   // 75% 확률로 흙
          : TileType.Tree;  // 25% 확률로 나무

        if (tileType === TileType.Soil && Math.random() < 0.20) {
          tileType = TileType.SoilWithStone;
        }
        rowData.push(tileType);
      }
      this.mapData.push(rowData);
    }

    // 물 영역은 따로 수동으로 삽입 (초기 1개 보장)
    const waterWidth = Math.floor(Math.random() * 3) + 2;
    const waterHeight = Math.floor(Math.random() * 3) + 2;
    const startX = this.cols - waterWidth - 1;
    const startY = this.fixedMapRows + 1;

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
        let fillColor: number = 0x8b5a2b; // 0: 농사 (갈색)

        if (tileType === TileType.Soil) {
          fillColor = 0xdeb887; // 일반 흙 (갈색)
        } else if (tileType === TileType.Tilled) {
          fillColor = 0xcd853f; // 다져진 땅 (짙은 갈색)
        } else if (tileType === TileType.Watered) {
          fillColor = 0x87ceeb; // 물 준 땅 (하늘색)
        } else if (tileType === TileType.Tree) {
          fillColor = 0x228b22; // 나무 (초록)
        } else if (tileType === TileType.Water) {
          fillColor = 0x1e90ff; // 물 (파랑)
        } else if (tileType === TileType.Stone) {
          fillColor = 0xa9a9a9; // 돌 (회색)
        } else if (tileType === TileType.SoilWithStone) {
          fillColor = 0xc1e0dc; // 일반 흙 위에 부실 수 있는 돌
        }

        const g: Graphics = new Graphics();
        g.lineStyle(1, 0x000000, 0.1); // 얇은 검정 테두리
        g.beginFill(fillColor);
        g.drawRect(0, 0, this.tileSize, this.tileSize);
        g.endFill();
        g.x = x;
        g.y = y;
        this.container.addChild(g);
      }
    }
  }
}
