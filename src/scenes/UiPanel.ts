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
  private commonLevelText: Text;
  private woodLevelText: Text;
  private stoneLevelText: Text;
  private farmLevelText: Text;

  private woodText: Text;
  private stoneText: Text;
  private waterText: Text;

  constructor(player: Player) {
    super();
    this.position.set(800, 0);

    const bg = new Graphics();
    bg.beginFill(0xf0f0f0);
    bg.drawRect(0, 0, 200, 608);
    bg.endFill();
    this.addChild(bg);

    // 캐릭터 관련 그래픽 작업.
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

    this.commonLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.commonLevelText.position.set(20, 115);
    this.characterInfoContainer.addChild(this.commonLevelText);

    this.woodLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.woodLevelText.position.set(20, 500);
    this.characterInfoContainer.addChild(this.woodLevelText);

    this.stoneLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.stoneLevelText.position.set(20, 530);
    this.characterInfoContainer.addChild(this.stoneLevelText);

    this.farmLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.farmLevelText.position.set(20, 560);
    this.characterInfoContainer.addChild(this.farmLevelText);

    this.addChild(this.characterInfoContainer);

    // 인벤토리 관련 그래픽 작업.
    this.inventoryContainer = new Container();

    const invTitle = new Text('인벤토리', { fontSize: 20, fill: 0x000000 });
    invTitle.position.set(20, 20);
    this.inventoryContainer.addChild(invTitle);

    this.woodText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.woodText.position.set(20, 55);
    this.inventoryContainer.addChild(this.woodText);

    this.stoneText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.stoneText.position.set(20, 85);
    this.inventoryContainer.addChild(this.stoneText);

    this.waterText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.waterText.position.set(20, 115);
    this.inventoryContainer.addChild(this.waterText);

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
    const skills = player.skills;
    this.hpText.text = `HP: ${player.hp}`;
    this.staminaText.text = `Stamina: ${player.stamina}`;
    this.commonLevelText.text = `Level: ${skills.common.level} - ${skills.common.exp}/${skills.common.expToLevelUp}`;
    this.woodLevelText.text = `벌목 Level ${skills.wood.level} - ${skills.wood.exp}/${skills.wood.expToLevelUp}`;
    this.stoneLevelText.text = `채광 Level ${skills.stone.level} - ${skills.stone.exp}/${skills.stone.expToLevelUp}`;
    this.farmLevelText.text = `농사 Level ${skills.farm.level} - ${skills.farm.exp}/${skills.farm.expToLevelUp}`;
  }

  public updateInventoryInfo(player: Player): void {
    this.woodText.text = `나무 ${player.inventory.wood}개`;
    this.stoneText.text = `돌 ${player.inventory.stone}개`;
    this.waterText.text = `물 ${player.inventory.water}L`;
  }
}
