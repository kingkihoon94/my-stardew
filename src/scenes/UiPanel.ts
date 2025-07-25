import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { Player } from '../objects/Player';

export class UiPanel extends Container {
  private characterInfoContainer: Container;
  private inventoryContainer: Container;
  private settingContainer: Container;

  public visibleTab: 'character' | 'inventory' | 'setting' = 'character';

  // 캐릭터 정보창 관련.
  private hpText: Text;
  private staminaText: Text;
  private waterText: Text;
  private hoeLevelText: Text;
  private pickaxeLevelText: Text;
  private axeLevelText: Text;
  private wateringCanLevelText: Text;
  private commonLevelText: Text;
  private woodLevelText: Text;
  private stoneLevelText: Text;
  private farmLevelText: Text;

  // 인벤토리창 관련.
  private inventoryTexts: Text[] = [];

  // 세팅창 관련.
  private settingText: Text;

  // Tooltip
  private tooltipText: Text;

  constructor(player: Player) {
    super();
    this.position.set(800, 0);

    const bg = new Graphics();
    bg.beginFill(0xf0f0f0);
    bg.drawRect(0, 0, 200, 608);
    bg.endFill();
    this.addChild(bg);

    this.tooltipText = new Text('', {
      fontFamily: 'Galmuri11',
      fontSize: 12,
      fill: 0xff2222,
    });
    this.tooltipText.position.set(15, 250);
    this.tooltipText.visible = false;
    this.addChild(this.tooltipText);

    // ===== 캐릭터 정보 =====
    this.characterInfoContainer = new Container();
    const characterInfoTitle = new Text('캐릭터 정보', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0x000000 });
    characterInfoTitle.position.set(20, 20);
    this.characterInfoContainer.addChild(characterInfoTitle)

    this.commonLevelText = this.addText(20, 55, this.characterInfoContainer);
    this.hpText = this.addText(20, 85, this.characterInfoContainer);
    this.staminaText = this.addText(20, 115, this.characterInfoContainer);
    this.waterText = this.addText(20, 145, this.characterInfoContainer);
    this.hoeLevelText = this.addText(15, 190, this.characterInfoContainer);
    this.pickaxeLevelText = this.addText(110, 190, this.characterInfoContainer);
    this.axeLevelText = this.addText(15, 220, this.characterInfoContainer);
    this.wateringCanLevelText = this.addText(110, 220, this.characterInfoContainer);
    this.woodLevelText = this.addText(20, 500, this.characterInfoContainer);
    this.stoneLevelText = this.addText(20, 530, this.characterInfoContainer);
    this.farmLevelText = this.addText(20, 560, this.characterInfoContainer);

    this.addChild(this.characterInfoContainer);

    // ===== 인벤토리 =====
    this.inventoryContainer = new Container();
    const inventoryInfoTitle = new Text('인벤토리', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0x000000 });
    inventoryInfoTitle.position.set(20, 20);
    this.inventoryContainer.addChild(inventoryInfoTitle)
    this.inventoryContainer.visible = false;
    this.addChild(this.inventoryContainer);

    // ===== 설정 =====
    this.settingContainer = new Container();
    this.settingText = new Text('설정 (추후 구현)', { fontFamily: 'Galmuri11', fontSize: 20, fill: 0x000000 });
    this.settingText.position.set(20, 20);
    this.settingContainer.addChild(this.settingText);
    this.settingContainer.visible = false;
    this.addChild(this.settingContainer);

    this.updateCharacterInfo(player);
  }

  private addText(x: number, y: number, container: Container): Text {
    const text = new Text('', { fontFamily: 'Galmuri11', fontSize: 14, fill: 0x000000 });
    text.position.set(x, y);
    container.addChild(text);
    return text;
  }

  public toggle(tab: 'character' | 'inventory' | 'setting'): void {
    if (this.visibleTab === tab) return;

    this.visibleTab = tab;
    this.characterInfoContainer.visible = tab === 'character';
    this.inventoryContainer.visible = tab === 'inventory';
    this.settingContainer.visible = tab === 'setting';
  }

  public update(player: Player): void {
    if (this.visibleTab === 'character') {
      this.updateCharacterInfo(player);
    } else if (this.visibleTab === 'inventory') {
      this.updateInventoryInfo(player);
    }
  }

  public updateCharacterInfo(player: Player): void {
    const skills = player.skills;
    this.hpText.text = `체력: ${player.hp} / ${player.maxHp}`;
    this.staminaText.text = `기력: ${player.stamina} / ${player.maxStamina}`;
    this.waterText.text = `물의 양: ${player.water} / ${player.maxWater}`;

    this.hoeLevelText.text = `호미 Lv.${player.tools.hoe.level}`;
    this.pickaxeLevelText.text = `곡괭이 Lv.${player.tools.pickaxe.level}`;
    this.axeLevelText.text = `도끼 Lv.${player.tools.axe.level}`;
    this.wateringCanLevelText.text = `주전자 Lv.${player.tools.wateringCan.level}`;

    this.commonLevelText.text = `Level ${skills.common.level} - ${skills.common.exp}/${skills.common.expToLevelUp}`;
    this.woodLevelText.text = `벌목 Level ${skills.wood.level} - ${skills.wood.exp}/${skills.wood.expToLevelUp}`;
    this.stoneLevelText.text = `채광 Level ${skills.stone.level} - ${skills.stone.exp}/${skills.stone.expToLevelUp}`;
    this.farmLevelText.text = `농사 Level ${skills.farm.level} - ${skills.farm.exp}/${skills.farm.expToLevelUp}`;

    this.setHoverEvent(this.hoeLevelText, player.tools.hoe.slots);
    this.setHoverEvent(this.pickaxeLevelText, player.tools.pickaxe.slots);
    this.setHoverEvent(this.axeLevelText, player.tools.axe.slots);
    this.setHoverEvent(this.wateringCanLevelText, player.tools.wateringCan.slots);
  }

  public updateInventoryInfo(player: Player): void {
    this.inventoryTexts.forEach((text) => {
      this.inventoryContainer.removeChild(text);
    });
    this.inventoryTexts = [];

    let y = 60;
    Object.entries(player.inventory)
      .filter(([_, count]) => count > 0)
      .forEach(([name, count]) => {
        const text = new Text(`${name} x ${count}`, {
          fontFamily: 'Galmuri11',
          fontSize: 14,
          fill: 0x000000,
        });
        text.position.set(20, y);
        y += 30;
        this.inventoryContainer.addChild(text);
        this.inventoryTexts.push(text);
      });
  }

  private setHoverEvent(textObj: Text, slots: (any | null)[]): void {
    textObj.eventMode = 'static';
    textObj.cursor = 'pointer';

    textObj.on('pointerover', () => {
      const content = slots
        .filter((s) => s)
        .map((s) => `${s.type} +${s.value}`)
        .join('\n\n') || '옵션 없음';
      this.tooltipText.text = content;
      this.tooltipText.visible = true;
    });

    textObj.on('pointerout', () => {
      this.tooltipText.visible = false;
    });
  }
}
