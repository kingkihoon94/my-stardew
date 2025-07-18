import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { ToolSlot } from '../types/Tools';
import { SoundManager } from '../core/SoundManager';

export class ToolOptionSelectPopup<T extends string> extends Container {
  private options: ToolSlot<T>[];
  private onSelect: (selected: ToolSlot<T>) => void;

  constructor(
    options: ToolSlot<T>[],
    onSelect: (selected: ToolSlot<T>) => void
  ) {
    super();
    this.position.set(150, 75);
    this.options = options;
    this.onSelect = onSelect;
    this.buildUI();
  }

  private buildUI(): void {
    const bg = new Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.drawRect(0, 0, 700, 450);
    bg.endFill();
    this.addChild(bg);

    const cardWidth = 210;
    const cardHeight = 430;
    const padding = 20;

    const totalWidth = this.options.length * (cardWidth + padding) - padding;
    const startX = (700 - totalWidth) / 2;

    this.options.forEach((option, index) => {
      const x = startX + index * (cardWidth + padding);
      const y = 10;

      const container = new Container();
      container.position.set(x, y);
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointerdown', () => {
        this.onSelect(option);
        SoundManager.playEffect('success');
        this.destroy();
      });

      const bg = new Graphics();
      bg.beginFill(0xffffff);
      bg.lineStyle(2, 0x000000);
      bg.drawRect(0, 0, cardWidth, cardHeight);
      bg.endFill();
      container.addChild(bg);

      const text = new Text(`${option.type}\n 수치 : +${option.value}`, {
        fontFamily: 'Galmuri11',
        fontSize: 14,
        align: 'center',
        fill: 0x000000,
      });
      text.anchor.set(0.5);
      text.position.set(cardWidth / 2, cardHeight / 2);
      container.addChild(text);

      this.addChild(container);
    });
  }
}
