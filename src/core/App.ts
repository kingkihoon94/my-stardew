import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';

import { FarmScene } from '../scenes/FarmScene';
import { UiPanel } from '../scenes/UiPanel';

import { SoundManager } from './SoundManager';
import { MarketPopup } from '../scenes/MarketPopup';

export class App {
  public app: Application;
  private farmScene: FarmScene;
  private uiPanel: UiPanel;
  private day: number = 1;
  private dayText: Text;
  private isPopupActive: boolean = false;
  private marketPopup: MarketPopup | null = null;

  constructor() {
    SoundManager.init();

    this.app = new Application({
      width: 1000,
      height: 608,
      backgroundColor: '#ffffff'
    });
    document.body.appendChild(this.app.view as HTMLCanvasElement);

    const farmContainer = new Container();
    this.app.stage.addChild(farmContainer);

    this.farmScene = new FarmScene(farmContainer);

    this.farmScene.onOpenMarket = () => {
      this.showMarketPopup();
    };

    this.uiPanel = new UiPanel(this.farmScene.player);
    this.app.stage.addChild(this.uiPanel);

    this.dayText = new Text(`Day ${this.day}`, {
      fontFamily: 'Galmuri11',
      fontSize: 20,
      fill: 0x000000,
    });
    this.dayText.position.set(20, 20);
    this.app.stage.addChild(this.dayText);

    this.app.ticker.add(() => {
      this.uiPanel.update(this.farmScene.player);
    });

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.cursor = 'auto';

    window.addEventListener('keydown', (e) => {
      if (this.isPopupActive) return;

      if (e.key === 'Enter') {
        this.showSleepPopup();
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        if (this.uiPanel.visibleTab === 'character') {
          this.uiPanel.toggle('inventory');
        } else if (this.uiPanel.visibleTab === 'inventory') {
          this.uiPanel.toggle('setting');
        } else {
          this.uiPanel.toggle('character');
        }
      }
    });
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
      this.farmScene.player.sleep();
      this.farmScene.nextDaySimulate();
      this.day += 1;
      this.dayText.text = `Day ${this.day}`;
      this.farmScene.player.resetPosition();
      this.app.stage.removeChild(popup);
      this.isPopupActive = false;
      this.farmScene.player.setIsPopupActive(false);
    });
    popup.addChild(yesBtn);

    const noBtn = new Text('NO', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0x000000 });
    noBtn.position.set(250, 120);
    noBtn.eventMode = 'static';
    noBtn.cursor = 'pointer';
    noBtn.on('pointerdown', () => {
      this.app.stage.removeChild(popup);
      this.isPopupActive = false;
      this.farmScene.player.setIsPopupActive(false);
    });
    popup.addChild(noBtn);

    this.app.stage.addChild(popup);
  }

  private showMarketPopup(): void {
    if (this.marketPopup) return;
    this.isPopupActive = true;
    this.farmScene.player.setIsPopupActive(true);
    this.marketPopup = new MarketPopup(this.farmScene.player, () => this.closeMarketPopup());
    this.app.stage.addChild(this.marketPopup);
  }

  private closeMarketPopup(): void {
    if (!this.marketPopup) return;
    this.app.stage.removeChild(this.marketPopup);
    this.marketPopup = null;
    this.isPopupActive = false;
    this.farmScene.player.setIsPopupActive(false);
  }
}
