import { Container } from '@pixi/display';
import { Text } from '@pixi/text';
import { Graphics } from '@pixi/graphics';
import { Player } from '../objects/Player';

const COST_WOOD = 5;
const COST_STONE = 5;

const toolNames: Record<string, string> = {
  hoe: '괭이',
  axe: '도끼',
  pickaxe: '곡괭이',
  wateringCan: '주전자'
};

export class MarketPopup extends Container {

  private player: Player;
  private onClose: () => void;

  constructor(player: Player, onClose: () => void) {
    super();
    this.position.set(200, 100);
    this.player = player;
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

    const title = new Text('마켓 오픈', { fontSize: 24, fill: 0x000000 });
    title.position.set(250, 10);
    this.addChild(title);

    const exitBtn = new Text('X', { fontSize: 20, fill: 0xff0000 });
    exitBtn.position.set(570, 10); // 오른쪽 상단
    exitBtn.eventMode = 'static';
    exitBtn.cursor = 'pointer';
    exitBtn.on('pointerdown', () => {
      onClose();
    });
    this.addChild(exitBtn);

    const tools = ['hoe', 'axe', 'pickaxe', 'wateringCan'] as const;

    tools.forEach((tool, index) => {
      const y = 80 + index * 60;
      const buttonContainer = new Container();
      buttonContainer.position.set(50, y);
      buttonContainer.eventMode = 'static';
      buttonContainer.cursor = 'pointer';
      buttonContainer.on('pointerdown', () => {
        this.attemptUpgradeTool(player, tool);
      });

      const bg = new Graphics();
      bg.beginFill(0xeeeeee);
      bg.drawRect(0, 0, 500, 40);
      bg.endFill();
      buttonContainer.addChild(bg);

      const level = player.tools[tool];
      const wood = 5 * (level + 1);
      const stone = 5 * (level + 1);
      const gold = 10 * (level + 1);

      const text = new Text(
        `${toolNames[tool]} 업그레이드 Lv.${level} → Lv.${level + 1}  |  나무 ${wood}  돌 ${stone}  골드 ${gold}`,
        { fontSize: 16, fill: 0x000000 }
      );
      text.position.set(10, 10);
      buttonContainer.addChild(text);

      this.addChild(buttonContainer);
    });

    // 나무 판매 버튼
    const sellWoodBtn = new Container();
    sellWoodBtn.position.set(50, 350);
    sellWoodBtn.eventMode = 'static';
    sellWoodBtn.cursor = 'pointer';
    sellWoodBtn.on('pointerdown', () => {
      this.attemptSellItem(player, 'wood');
    });

    const woodBg = new Graphics();
    woodBg.beginFill(0xdddddd);
    woodBg.drawRect(0, 0, 150, 40);
    woodBg.endFill();
    sellWoodBtn.addChild(woodBg);

    const woodText = new Text('🌲 나무 1개 판매', { fontSize: 16, fill: 0x000000 });
    woodText.position.set(10, 10);
    sellWoodBtn.addChild(woodText);

    this.addChild(sellWoodBtn);

    // 돌 판매 버튼
    const sellStoneBtn = new Container();
    sellStoneBtn.position.set(220, 350);
    sellStoneBtn.eventMode = 'static';
    sellStoneBtn.cursor = 'pointer';
    sellStoneBtn.on('pointerdown', () => {
      this.attemptSellItem(player, 'stone');
    });

    const stoneBg = new Graphics();
    stoneBg.beginFill(0xdddddd);
    stoneBg.drawRect(0, 0, 150, 40);
    stoneBg.endFill();
    sellStoneBtn.addChild(stoneBg);

    const stoneText = new Text('🪨 돌 1개 판매', { fontSize: 16, fill: 0x000000 });
    stoneText.position.set(10, 10);
    sellStoneBtn.addChild(stoneText);

    this.addChild(sellStoneBtn);
  }

  private attemptSellItem(player: Player, item: 'wood' | 'stone'): void {
    if (item === 'wood') {
      if (player.inventory.wood > 0) {
        player.inventory.gold += COST_WOOD;
        player.inventory.wood--;
        this.refresh();
      }
    } else if (item === 'stone') {
      if (player.inventory.stone > 0) {
        player.inventory.gold += COST_STONE;
        player.inventory.stone--;
        this.refresh();
      }
    }
  }

  private attemptUpgradeTool(player: Player, tool: 'hoe' | 'axe' | 'pickaxe' | 'wateringCan'): void {
    const level = player.tools[tool];
    const required = 5 * (level + 1);
    if (
      player.inventory.wood >= required &&
      player.inventory.stone >= required &&
      player.inventory.gold >= required * 10
    ) {
      player.inventory.wood -= required;
      player.inventory.stone -= required;
      player.inventory.gold -= required * 10;
      player.tools[tool]++;
      this.refresh();
    }
  }

  private refresh(): void {
    this.removeChildren();
    this.buildUI(this.player, this.onClose);
  }
}