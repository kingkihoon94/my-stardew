import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { Player } from '../objects/Player';

export class UiPanel extends Container {
  private characterInfoContainer: Container;
  private inventoryContainer: Container;
  private isInventoryVisible: boolean = false;
  private hpText: Text;
  private staminaText: Text;
  private levelText: Text;

  constructor(player: Player) {
    super();
    this.position.set(800, 0);

    const bg = new Graphics();
    bg.beginFill(0xf0f0f0);
    bg.drawRect(0, 0, 200, 608);
    bg.endFill();
    this.addChild(bg);

    this.characterInfoContainer = new Container();

    const infoTitle = new Text('캐릭터 정보', { fontSize: 20, fill: 0x000000 });
    infoTitle.position.set(20, 20);
    this.characterInfoContainer.addChild(infoTitle);

    this.hpText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.hpText.position.set(20, 55);
    this.characterInfoContainer.addChild(this.hpText);

    this.staminaText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.staminaText.position.set(20, 85);
    this.characterInfoContainer.addChild(this.staminaText);

    this.levelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.levelText.position.set(20, 115);
    this.characterInfoContainer.addChild(this.levelText);

    this.addChild(this.characterInfoContainer);

    this.inventoryContainer = new Container();
    const invTitle = new Text('인벤토리', { fontSize: 20, fill: 0x000000 });
    invTitle.position.set(20, 20);
    this.inventoryContainer.addChild(invTitle);
    this.addChild(this.inventoryContainer);

    this.showCharacterInfo();
    this.updatePlayerInfo(player);

    window.addEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Tab') {
      e.preventDefault();
      this.isInventoryVisible = !this.isInventoryVisible;
      if (this.isInventoryVisible) {
        this.showInventory();
      } else {
        this.showCharacterInfo();
      }
    }
  };

  private showCharacterInfo(): void {
    this.characterInfoContainer.visible = true;
    this.inventoryContainer.visible = false;
  }

  private showInventory(): void {
    this.characterInfoContainer.visible = false;
    this.inventoryContainer.visible = true;
  }

  public updatePlayerInfo(player: Player): void {
    this.hpText.text = `HP: ${player.hp}`;
    this.staminaText.text = `Stamina: ${player.stamina}`;
    this.levelText.text = `Level: ${player.level}`;
  }
}
