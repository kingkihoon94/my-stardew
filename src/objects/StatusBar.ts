import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';

export class StatusBar extends Container {
  private backgroundBar: Graphics;
  private titleText: Text;
  private fillBar: Graphics;
  private maxValue: number;
  private currentValue: number;
  private widthSize: number;
  private heightSize: number;
  private color: number;

  constructor(maxValue: number, title: string, width: number, height: number, color: number) {
    super();
    this.maxValue = maxValue;
    this.currentValue = maxValue;
    this.widthSize = width;
    this.heightSize = height;
    this.color = color;

    this.backgroundBar = new Graphics();
    this.fillBar = new Graphics();
    this.titleText = new Text(title, { fontFamily: 'Galmuri11', fontSize: 14, fill: 0x000000 });

    this.addChild(this.titleText);
    this.addChild(this.backgroundBar);
    this.addChild(this.fillBar);

    this.layout();
    this.update(maxValue, maxValue);
  }

  private layout(): void {
    this.titleText.position.set(0, -this.heightSize - 5);

    this.backgroundBar.clear();
    this.backgroundBar.beginFill(0xcccccc);
    this.backgroundBar.drawRect(0, 0, this.widthSize, this.heightSize);
    this.backgroundBar.endFill();
  }

  /** 실시간 값 업데이트 */
  public update(currentValue: number, currentMaxValue?: number): void {
    if (currentMaxValue !== undefined) {
      this.maxValue = currentMaxValue;
    }
    this.currentValue = currentValue;
    this.redraw();
  }

  private redraw(): void {
    const ratio = Math.max(0, Math.min(this.currentValue / this.maxValue, 1));
    this.fillBar.clear();
    this.fillBar.beginFill(this.color);
    this.fillBar.drawRect(0, 0, this.widthSize * ratio, this.heightSize);
    this.fillBar.endFill();
  }
}
