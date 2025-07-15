import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { FarmScene } from '../scenes/FarmScene';
import { UiPanel } from '../scenes/UiPanel';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { FederatedPointerEvent } from '@pixi/events';

export class App {
  public app: Application;
  private farmScene: FarmScene;
  private uiPanel: UiPanel;
  private day: number = 1;
  private dayText: Text;

  constructor() {
    this.app = new Application({
      width: 1000,
      height: 608,
      backgroundColor: '#ffffff'
    });
    document.body.appendChild(this.app.view as HTMLCanvasElement);

    const farmContainer = new Container();
    this.app.stage.addChild(farmContainer);

    this.farmScene = new FarmScene(farmContainer);

    this.uiPanel = new UiPanel(this.farmScene.player);
    this.app.stage.addChild(this.uiPanel);

    this.dayText = new Text(`Day ${this.day}`, {
      fontSize: 20,
      fill: 0x000000,
    });
    this.dayText.position.set(20, 20);
    this.app.stage.addChild(this.dayText);

    this.app.ticker.add(() => {
      this.uiPanel.updatePlayerInfo(this.farmScene.player);
    });

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.cursor = 'auto';

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.showSleepPopup();
      }
    });
  }

  private showSleepPopup(): void {
    const popup = new Container();
    popup.position.set(300, 200);

    const bg = new Graphics();
    bg.beginFill(0xffffff);
    bg.drawRect(0, 0, 400, 200);
    bg.endFill();
    popup.addChild(bg);

    const text = new Text('잠을 자시겠습니까?', { fontSize: 20, fill: 0x000000 });
    text.position.set(100, 50);
    popup.addChild(text);

    const yesBtn = new Text('YES', { fontSize: 20, fill: 0x000000 });
    yesBtn.position.set(100, 120);
    yesBtn.eventMode = 'static';
    yesBtn.cursor = 'pointer';
    yesBtn.on('pointerdown', (e: FederatedPointerEvent) => {
      this.farmScene.player.sleep();
      this.day += 1;
      this.dayText.text = `Day ${this.day}`;
      this.farmScene.player.resetPosition();
      this.app.stage.removeChild(popup);
    });
    popup.addChild(yesBtn);

    const noBtn = new Text('NO', { fontSize: 20, fill: 0x000000 });
    noBtn.position.set(250, 120);
    noBtn.eventMode = 'static';
    noBtn.cursor = 'pointer';
    noBtn.on('pointerdown', (e: FederatedPointerEvent) => {
      this.app.stage.removeChild(popup);
    });
    popup.addChild(noBtn);

    this.app.stage.addChild(popup);
  }
}
