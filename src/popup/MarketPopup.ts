import { Container } from '@pixi/display';
import { Text } from '@pixi/text';
import { Graphics } from '@pixi/graphics';

import { SoundManager } from '../core/SoundManager';

import { InventoryItem, Player } from '../objects/Player';

import { COST_SEED, COST_STONE, COST_WOOD } from '../constants';
import { Season } from '../core/App';

export class MarketPopup extends Container {

  private player: Player;
  private season: Season;
  private onClose: () => void;

  constructor(player: Player, season: Season, onClose: () => void,) {
    super();
    this.position.set(200, 100);
    this.player = player;
    this.season = season;
    this.onClose = onClose;
    this.buildUI(player, onClose);
  }

  private buildUI(player: Player, onClose: () => void): void {

    const bg = new Graphics();
    bg.beginFill(0xffffff);
    bg.lineStyle(2, 0x000000);
    bg.drawRect(0, 0, 600, 400);
    bg.endFill();
    this.addChild(bg);

    const title = new Text('마켓 오픈', { fontFamily: 'Galmuri11', fontSize: 24, fill: 0x000000 });
    title.position.set(250, 10);
    this.addChild(title);

    const exitBtn = new Text('X', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0xff0000 });
    exitBtn.position.set(570, 10); // 오른쪽 상단
    exitBtn.eventMode = 'static';
    exitBtn.cursor = 'pointer';
    exitBtn.on('pointerdown', () => {
      onClose();
    });
    this.addChild(exitBtn);

    switch (this.season) {
      case Season.Spring:
        this.setSpringMarket(this.player);
        break;
      case Season.Summer:
        this.setSummerMarket(this.player);
        break;
      case Season.Autumn:
        this.setAutumnMarket(this.player);
        break;
      case Season.Winter:
        this.setWinterMarket(this.player);
        break;
    }


    // 나무 판매 버튼
    const sellWoodBtn = new Container();
    sellWoodBtn.position.set(40, 350);
    sellWoodBtn.eventMode = 'static';
    sellWoodBtn.cursor = 'pointer';
    sellWoodBtn.on('pointerdown', () => {
      this.attemptSellItem(player, 'wood');
    });

    const woodBg = new Graphics();
    woodBg.beginFill(0xdddddd);
    woodBg.drawRect(0, 0, 240, 40);
    woodBg.endFill();
    sellWoodBtn.addChild(woodBg);

    const woodText = new Text(`🌲 나무 1개 판매 : ${COST_WOOD} Gold`, { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x000000 });
    woodText.position.set(10, 10);
    sellWoodBtn.addChild(woodText);

    this.addChild(sellWoodBtn);

    // 돌 판매 버튼
    const sellStoneBtn = new Container();
    sellStoneBtn.position.set(330, 350);
    sellStoneBtn.eventMode = 'static';
    sellStoneBtn.cursor = 'pointer';
    sellStoneBtn.on('pointerdown', () => {
      this.attemptSellItem(player, 'stone');
    });

    const stoneBg = new Graphics();
    stoneBg.beginFill(0xdddddd);
    stoneBg.drawRect(0, 0, 240, 40);
    stoneBg.endFill();
    sellStoneBtn.addChild(stoneBg);

    const stoneText = new Text(`🪨 돌 1개 판매 : ${COST_STONE} Gold`, { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x000000 });
    stoneText.position.set(10, 10);
    sellStoneBtn.addChild(stoneText);

    this.addChild(sellStoneBtn);
  }

  /** 봄 시즌 마켓 구매 목록 */
  private setSpringMarket(player: Player): void {
    // 봄 씨앗 구매 버튼
    const buySeedBtn = new Container();
    buySeedBtn.position.set(50, 100);
    buySeedBtn.eventMode = 'static';
    buySeedBtn.cursor = 'pointer';
    buySeedBtn.on('pointerdown', () => {
      this.attemptBuyItem(player, 'springSeed');
    });

    const seedBg = new Graphics();
    seedBg.beginFill(0xdddddd);
    seedBg.drawRect(0, 0, 400, 40);
    seedBg.endFill();
    buySeedBtn.addChild(seedBg);

    const seedText = new Text(`🌱 봄 씨앗 1개 구매 : ${COST_SEED} Gold`, { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x000000 });
    seedText.position.set(10, 10);
    buySeedBtn.addChild(seedText);

    this.addChild(buySeedBtn);
  }

  /** 여름 시즌 마켓 구매 목록 */
  private setSummerMarket(player: Player): void {
    // 여름 씨앗 구매 버튼
    const buySeedBtn = new Container();
    buySeedBtn.position.set(50, 100);
    buySeedBtn.eventMode = 'static';
    buySeedBtn.cursor = 'pointer';
    buySeedBtn.on('pointerdown', () => {
      this.attemptBuyItem(player, 'summerSeed');
    });

    const seedBg = new Graphics();
    seedBg.beginFill(0xdddddd);
    seedBg.drawRect(0, 0, 400, 40);
    seedBg.endFill();
    buySeedBtn.addChild(seedBg);

    const seedText = new Text(`🌱 여름 씨앗 1개 구매 : ${COST_SEED} Gold`, { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x000000 });
    seedText.position.set(10, 10);
    buySeedBtn.addChild(seedText);

    this.addChild(buySeedBtn);
  }

  /** 가을 시즌 마켓 구매 목록 */
  private setAutumnMarket(player: Player): void {
    // 가을 씨앗 구매 버튼
    const buySeedBtn = new Container();
    buySeedBtn.position.set(50, 100);
    buySeedBtn.eventMode = 'static';
    buySeedBtn.cursor = 'pointer';
    buySeedBtn.on('pointerdown', () => {
      this.attemptBuyItem(player, 'autumnSeed');
    });

    const seedBg = new Graphics();
    seedBg.beginFill(0xdddddd);
    seedBg.drawRect(0, 0, 400, 40);
    seedBg.endFill();
    buySeedBtn.addChild(seedBg);

    const seedText = new Text(`🌱 가을 씨앗 1개 구매 : ${COST_SEED} Gold`, { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x000000 });
    seedText.position.set(10, 10);
    buySeedBtn.addChild(seedText);

    this.addChild(buySeedBtn);
  }

  /** 겨울 시즌 마켓 구매 목록 */
  private setWinterMarket(player: Player): void {
    // 겨울 씨앗 구매 버튼
    const buySeedBtn = new Container();
    buySeedBtn.position.set(50, 100);
    buySeedBtn.eventMode = 'static';
    buySeedBtn.cursor = 'pointer';
    buySeedBtn.on('pointerdown', () => {
      this.attemptBuyItem(player, 'winterSeed');
    });

    const seedBg = new Graphics();
    seedBg.beginFill(0xdddddd);
    seedBg.drawRect(0, 0, 400, 40);
    seedBg.endFill();
    buySeedBtn.addChild(seedBg);

    const seedText = new Text(`🌱 겨울 씨앗 1개 구매 : ${COST_SEED} Gold`, { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x000000 });
    seedText.position.set(10, 10);
    buySeedBtn.addChild(seedText);

    this.addChild(buySeedBtn);
  }

  private getItemCost(item: InventoryItem): number {
    switch (item) {
      case 'springSeed':
      case 'summerSeed':
      case 'autumnSeed':
      case 'winterSeed':
        return COST_SEED;
      case 'wood':
        return COST_WOOD;
      case 'stone':
        return COST_STONE;

      default: return 0;
    }
  }

  private attemptBuyItem(player: Player, item: InventoryItem): void {
    const cost = this.getItemCost(item);
    if (player.gold >= cost) {
      player.gold -= cost;
      player.inventory[item]++;;
      SoundManager.playEffect('success');
      this.refresh();
    }
  }


  private attemptSellItem(player: Player, item: 'wood' | 'stone'): void {
    if (item === 'wood') {
      if (player.inventory.wood > 0) {
        player.gold += COST_WOOD;
        player.inventory.wood--;
        SoundManager.playEffect('getCoin');
        this.refresh();
      }
    } else if (item === 'stone') {
      if (player.inventory.stone > 0) {
        player.gold += COST_STONE;
        player.inventory.stone--;
        SoundManager.playEffect('getCoin');
        this.refresh();
      }
    }
  }

  private refresh(): void {
    this.removeChildren();
    this.buildUI(this.player, this.onClose);
  }
}