import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { Player } from '../objects/Player';

export class UiPanel extends Container {
  private characterInfoContainer: Container;

  private hpText: Text;
  private staminaText: Text;

  private seedText: Text;

  private hoeLevelText: Text;
  private axeLevelText: Text;
  private pickaxeLevelText: Text;
  private wateringCanLevelText: Text;

  private commonLevelText: Text;
  private woodLevelText: Text;
  private stoneLevelText: Text;
  private farmLevelText: Text;

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

    this.commonLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.commonLevelText.position.set(20, 55);
    this.characterInfoContainer.addChild(this.commonLevelText);

    this.hpText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.hpText.position.set(20, 85);
    this.characterInfoContainer.addChild(this.hpText);

    this.staminaText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.staminaText.position.set(20, 115);
    this.characterInfoContainer.addChild(this.staminaText);

    this.seedText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.seedText.position.set(20, 145);
    this.characterInfoContainer.addChild(this.seedText);

    this.hoeLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.hoeLevelText.position.set(20, 360);
    this.characterInfoContainer.addChild(this.hoeLevelText);

    this.axeLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.axeLevelText.position.set(20, 390);
    this.characterInfoContainer.addChild(this.axeLevelText);

    this.pickaxeLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.pickaxeLevelText.position.set(20, 420);
    this.characterInfoContainer.addChild(this.pickaxeLevelText);

    this.wateringCanLevelText = new Text('', { fontSize: 14, fill: 0x000000 });
    this.wateringCanLevelText.position.set(20, 450);
    this.characterInfoContainer.addChild(this.wateringCanLevelText);

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

    this.updatePlayerInfo(player);
  }

  /** 플레이어 상황 업데이트 */
  public updatePlayerInfo(player: Player): void {
    const skills = player.skills;
    this.hpText.text = `체력: ${player.hp}`;
    this.staminaText.text = `기력: ${player.stamina}`;

    this.seedText.text = `🌱 씨앗 갯수: ${player.inventory.springSeed}`;

    this.hoeLevelText.text = `괭이 Lv.${player.tools.hoe}`;
    this.axeLevelText.text = `도끼 Lv.${player.tools.axe}`;
    this.pickaxeLevelText.text = `곡괭이 Lv.${player.tools.pickaxe}`;
    this.wateringCanLevelText.text = `물뿌리개 Lv.${player.tools.wateringCan}`;

    this.commonLevelText.text = `Level ${skills.common.level} - ${skills.common.exp}/${skills.common.expToLevelUp}`;
    this.woodLevelText.text = `벌목 Level ${skills.wood.level} - ${skills.wood.exp}/${skills.wood.expToLevelUp}`;
    this.stoneLevelText.text = `채광 Level ${skills.stone.level} - ${skills.stone.exp}/${skills.stone.expToLevelUp}`;
    this.farmLevelText.text = `농사 Level ${skills.farm.level} - ${skills.farm.exp}/${skills.farm.expToLevelUp}`;
  }
}
