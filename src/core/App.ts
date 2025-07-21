import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';

// 화면 구성 (농장 + UI 패널)
import { FarmScene } from '../scenes/FarmScene';
import { UiPanel } from '../scenes/UiPanel';

// 사운드 매니저.
import { SoundManager } from './SoundManager';

// 팝업.
import { MarketPopup } from '../popup/MarketPopup';
import { BlacksmithPopup } from '../popup/BlackSmithPopup';

const DAY_PER_SEASON = 10;

export enum Season {
  Spring = '\u00A0봄',
  Summer = '여름',
  Autumn = '가을',
  Winter = '겨울'
}

export class App {
  public app: Application;
  private farmScene: FarmScene;
  private uiPanel: UiPanel;

  private seasons = [Season.Spring, Season.Summer, Season.Autumn, Season.Winter];
  private seasonIndex: number = 0;

  private season: Season = Season.Spring;
  private seasonText: Text;

  private day: number = 1;
  private dayText: Text;

  private isPopupActive: boolean = false;

  private marketPopup: MarketPopup | null = null;
  private blackSmithPopup: BlacksmithPopup | null = null;

  private popupLayer: Container;
  private blackOverlay: Graphics;

  constructor() {
    SoundManager.init();

    this.app = new Application({ width: 1000, height: 608, backgroundColor: '#ffffff' });
    document.body.appendChild(this.app.view as HTMLCanvasElement);

    const farmContainer = new Container();
    this.app.stage.addChild(farmContainer);
    this.farmScene = new FarmScene(farmContainer);

    this.uiPanel = new UiPanel(this.farmScene.player);
    this.app.stage.addChild(this.uiPanel);

    this.popupLayer = new Container();
    this.app.stage.addChild(this.popupLayer);

    this.seasonText = new Text(`${this.season}`, {
      fontFamily: 'Galmuri11',
      fontSize: 20,
      fill: 0x000000,
    });
    this.seasonText.position.set(20, 20);
    this.app.stage.addChild(this.seasonText);

    this.dayText = new Text(`Day ${this.day}`, {
      fontFamily: 'Galmuri11',
      fontSize: 20,
      fill: 0x000000,
    });
    this.dayText.position.set(65, 20);
    this.app.stage.addChild(this.dayText);

    this.farmScene.onOpenMarket = () => this.showMarketPopup();
    this.farmScene.onOpenBlackSmith = () => this.showBlackSmithPopup();
    this.farmScene.onShowInventory = () => this.uiPanel.toggle("inventory");

    this.app.ticker.maxFPS = 60;
    this.app.ticker.add(() => {
      this.uiPanel.update(this.farmScene.player);
    });

    this.blackOverlay = new Graphics();
    this.blackOverlay.beginFill(0x000000);
    this.blackOverlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    this.blackOverlay.endFill();
    this.blackOverlay.alpha = 0;
    this.blackOverlay.eventMode = 'none';
    this.app.stage.addChild(this.blackOverlay);

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.cursor = 'auto';

    window.addEventListener('keydown', (e) => {
      if (this.isPopupActive) return;
      if (e.key === 'Enter') this.showSleepPopup();
      if (e.key === 'Tab') {
        e.preventDefault();
        this.toggleTab();
      }
    });
  }

  private toggleTab() {
    const next = this.uiPanel.visibleTab === 'character'
      ? 'inventory'
      : this.uiPanel.visibleTab === 'inventory'
        ? 'setting'
        : 'character';
    this.uiPanel.toggle(next);
  }

  private showSleepPopup(): void {
    this.isPopupActive = true;
    this.farmScene.player.setIsPopupActive(true);

    const popup = new Container();
    popup.position.set(300, 200);

    const bg = new Graphics();
    bg.beginFill(0xffffff);
    bg.drawRect(0, 0, 400, 200);
    bg.endFill();
    popup.addChild(bg);

    const text = new Text('잠을 자시겠습니까?', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0x000000 });
    text.position.set(100, 50);
    popup.addChild(text);

    const yesBtn = new Text('YES', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0x000000 });
    yesBtn.position.set(100, 120);
    yesBtn.eventMode = 'static';
    yesBtn.cursor = 'pointer';
    yesBtn.on('pointerdown', () => {
      this.farmScene.player.setIsPopupActive(false);
      this.popupLayer.removeChild(popup);
      this.sleepTransition();
    });
    popup.addChild(yesBtn);

    const noBtn = new Text('NO', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0x000000 });
    noBtn.position.set(250, 120);
    noBtn.eventMode = 'static';
    noBtn.cursor = 'pointer';
    noBtn.on('pointerdown', () => {
      this.farmScene.player.setIsPopupActive(false);
      this.popupLayer.removeChild(popup);
      this.isPopupActive = false;
    });
    popup.addChild(noBtn);

    this.popupLayer.addChild(popup);
  }

  private showMarketPopup(): void {
    if (this.marketPopup) return;
    this.isPopupActive = true;
    this.farmScene.player.setIsPopupActive(true);
    this.marketPopup = new MarketPopup(this.farmScene.player, this.season, () => this.closeMarketPopup());
    this.popupLayer.addChild(this.marketPopup);
  }

  private closeMarketPopup(): void {
    if (!this.marketPopup) return;
    this.popupLayer.removeChild(this.marketPopup);
    this.marketPopup = null;
    this.isPopupActive = false;
    this.farmScene.player.setIsPopupActive(false);
  }

  private showBlackSmithPopup(): void {
    if (this.blackSmithPopup) return;
    this.isPopupActive = true;
    this.farmScene.player.setIsPopupActive(true);
    this.blackSmithPopup = new BlacksmithPopup(this.farmScene.player, this.popupLayer, () => this.closeBlackSmithPopup());
    this.popupLayer.addChild(this.blackSmithPopup);
  }

  private closeBlackSmithPopup(): void {
    if (!this.blackSmithPopup) return;
    this.popupLayer.removeChild(this.blackSmithPopup);
    this.blackSmithPopup = null;
    this.isPopupActive = false;
    this.farmScene.player.setIsPopupActive(false);
    this.farmScene.player.updateToolEffectStats();
  }

  // 예시 사용: 슬립 전환
  private async sleepTransition() {
    SoundManager.playEffect('byebye');
    await this.fadeIn(1); // 1초 동안 점점 검게
    await new Promise((r) => setTimeout(r, 250));
    this.farmScene.player.sleep();
    this.farmScene.player.resetPosition();
    this.farmScene.nextDaySimulate();
    this.updateSeasonAndDay();
    this.isPopupActive = false;
    this.farmScene.player.setIsPopupActive(false);
    await new Promise((r) => setTimeout(r, 250));
    await this.fadeOut(1); // 1초 동안 점점 밝아짐
  }

  // 페이드 인 함수 (점점 검게)
  private fadeIn(duration: number): Promise<void> {
    return new Promise((resolve) => {
      let elapsed = 0;

      const tick = (delta: number) => {
        elapsed += delta / this.app.ticker.maxFPS;
        this.blackOverlay.alpha = Math.min(elapsed / duration, 1);
        if (this.blackOverlay.alpha >= 1) {
          this.app.ticker.remove(tick);
          resolve();
        }
      };

      this.app.ticker.add(tick);
    });
  }

  // 페이드 아웃 함수 (점점 밝게)
  private fadeOut(duration: number): Promise<void> {
    return new Promise((resolve) => {
      let elapsed = 0;

      const tick = (delta: number) => {
        elapsed += delta / this.app.ticker.maxFPS;
        this.blackOverlay.alpha = Math.max(1 - (elapsed / duration), 0);
        if (this.blackOverlay.alpha <= 0) {
          this.app.ticker.remove(tick);
          resolve();
        }
      };

      this.app.ticker.add(tick);
    });
  }

  private updateSeasonAndDay(): void {
    if (this.day >= DAY_PER_SEASON) {
      this.day = 1;
      this.seasonIndex = (this.seasonIndex + 1) % this.seasons.length;
      this.season = this.seasons[this.seasonIndex];
      this.farmScene.setNewSeasonMap(this.season);
    } else {
      this.day += 1;
    }

    this.dayText.text = `Day ${this.day}`;
    this.seasonText.text = `${this.season}`;
  }
}