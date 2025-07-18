import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { Player } from '../objects/Player';
import { SoundManager } from '../core/SoundManager';
import { levelUpTool } from '../types/Tools';
import { HOE_OPTIONS, AXE_OPTIONS, PICKAXE_OPTIONS, WATERINGCAN_OPTIONS } from '../types/Tools';

const toolNames: Record<string, string> = {
  hoe: '호미',
  axe: '도끼',
  pickaxe: '곡괭이',
  wateringCan: '주전자'
};

export class BlacksmithPopup extends Container {
  private player: Player;
  private onClose: () => void;

  constructor(player: Player, onClose: () => void) {
    super();
    this.position.set(200, 100);
    this.player = player;
    this.onClose = onClose;
    this.buildUI();
  }

  private buildUI(): void {
    const bg = new Graphics();
    bg.beginFill(0xffffff);
    bg.lineStyle(2, 0x000000);
    bg.drawRect(0, 0, 600, 400);
    bg.endFill();
    this.addChild(bg);

    const title = new Text('대장간', { fontFamily: 'Galmuri11', fontSize: 24, fill: 0x000000 });
    title.position.set(250, 10);
    this.addChild(title);

    const exitBtn = new Text('X', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0xff0000 });
    exitBtn.position.set(570, 10);
    exitBtn.eventMode = 'static';
    exitBtn.cursor = 'pointer';
    exitBtn.on('pointerdown', () => {
      this.onClose();
    });
    this.addChild(exitBtn);

    const tools = ['hoe', 'axe', 'pickaxe', 'wateringCan'] as const;

    tools.forEach((tool, index) => {
      const y = 80 + index * 60;
      const container = new Container();
      container.position.set(50, y);
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointerdown', () => {
        this.attemptUpgradeTool(tool);
      });

      const bg = new Graphics();
      bg.beginFill(0xeeeeee);
      bg.drawRect(0, 0, 500, 40);
      bg.endFill();
      container.addChild(bg);

      const level = this.player.tools[tool].level;

      const textContainer = new Container();

      if (level >= 5) {
        const maxText = new Text(
          `${toolNames[tool]} Lv.MAX`,
          { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x888888 }
        );
        textContainer.addChild(maxText);
      } else {
        const wood = 5 * (level + 1);
        const stone = 5 * (level + 1);
        const gold = 10 * (level + 1);

        const hasEnoughWood = this.player.inventory.wood >= wood;
        const hasEnoughStone = this.player.inventory.stone >= stone;
        const hasEnoughGold = this.player.gold >= gold;

        const baseText = new Text(
          `${toolNames[tool]} Lv.${level} → Lv.${level + 1}  | `,
          { fontFamily: 'Galmuri11', fontSize: 16, fill: 0x000000 }
        );
        textContainer.addChild(baseText);

        const woodText = new Text(
          `🌲 ${wood}`,
          { fontFamily: 'Galmuri11', fontSize: 16, fill: hasEnoughWood ? 0x000000 : 0xff0000 }
        );
        woodText.x = baseText.width;
        textContainer.addChild(woodText);

        const stoneText = new Text(
          `  🪨 ${stone}`,
          { fontFamily: 'Galmuri11', fontSize: 16, fill: hasEnoughStone ? 0x000000 : 0xff0000 }
        );
        stoneText.x = baseText.width + woodText.width;
        textContainer.addChild(stoneText);

        const goldText = new Text(
          `  💰 ${gold}`,
          { fontFamily: 'Galmuri11', fontSize: 16, fill: hasEnoughGold ? 0x000000 : 0xff0000 }
        );
        goldText.x = baseText.width + woodText.width + stoneText.width;
        textContainer.addChild(goldText);
      }

      textContainer.position.set(10, 10);
      container.addChild(textContainer);

      this.addChild(container);
    });
  }

  private attemptUpgradeTool(tool: 'hoe' | 'axe' | 'pickaxe' | 'wateringCan'): void {
    const currentTool = this.player.tools[tool];
    const level = currentTool.level;
    if (level >= 5) return;

    const required = 5 * (level + 1);
    if (
      this.player.inventory.wood >= required &&
      this.player.inventory.stone >= required &&
      this.player.gold >= required * 2
    ) {
      this.player.inventory.wood -= required;
      this.player.inventory.stone -= required;
      this.player.gold -= required * 2;

      switch (tool) {
        case 'hoe':
          levelUpTool(this.player.tools.hoe, HOE_OPTIONS);
          break;
        case 'axe':
          levelUpTool(this.player.tools.axe, AXE_OPTIONS);
          break;
        case 'pickaxe':
          levelUpTool(this.player.tools.pickaxe, PICKAXE_OPTIONS);
          break;
        case 'wateringCan':
          levelUpTool(this.player.tools.wateringCan, WATERINGCAN_OPTIONS);
          break;
      }

      SoundManager.playEffect('levelUp');
      this.refresh();
    }
  }

  private refresh(): void {
    this.removeChildren();
    this.buildUI();
  }
}
