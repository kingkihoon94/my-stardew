import { Graphics } from '@pixi/graphics';
import { Ticker } from '@pixi/core';

import { FarmScene } from '../scenes/FarmScene';
import { SoundManager } from '../core/SoundManager';

import { TileType } from '../types/Tile';
import { CommonSkill, SpecializedSkill } from '../types/Skill';
import { ObjectMap } from '../types/Object';

import { EXP_COMMON, EXP_DIGGING, EXP_STONE, EXP_WATERING, EXP_WOOD, PLAYER_SIZE, STAMINA_DIGGING, STAMINA_STONE, STAMINA_WATER, STAMINA_WATERING, STAMINA_WOOD, TILE_SIZE } from '../constants';

export class Player {
  public sprite: Graphics;
  public hp: number = 100;
  public stamina: number = 100;

  public maxHp: number = 100;
  public maxStamina: number = 100;

  private skillNames: Record<string, string> = {
    common: '캐릭터',
    wood: '벌목',
    stone: '채광',
    farm: '농사'
  };

  public inventory: Record<string, number> = {
    wood: 0,
    stone: 0,
    water: 0,
    gold: 0,

    springSeed: 0,
    summerSeed: 0,
    autumnSeed: 0,
    winterSeed: 0,
  };

  public tools = {
    hoe: 0,
    axe: 0,
    pickaxe: 0,
    wateringCan: 0,
  };

  public skills: {
    common: CommonSkill;
    wood: SpecializedSkill;
    stone: SpecializedSkill;
    farm: SpecializedSkill;
  } = {
      common: {
        level: 1,
        exp: 0,
        expToLevelUp: 100,
        maxHpBonus: 10,
        maxStaminaBonus: 5,
      },
      wood: {
        level: 1,
        exp: 0,
        expToLevelUp: 100,
        staminaReducePerLevel: 1,
      },
      stone: {
        level: 1,
        exp: 0,
        expToLevelUp: 100,
        staminaReducePerLevel: 1,
      },
      farm: {
        level: 1,
        exp: 0,
        expToLevelUp: 100,
        staminaReducePerLevel: 1,
      },
    };

  private tileSize: number = TILE_SIZE;
  private speed: number = PLAYER_SIZE;

  private tileMap: number[][] = [];
  private objectMap: ObjectMap = [];

  private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';

  private exhaustedTicker: Ticker | null = null;
  private isExhausted: boolean = false;

  private isPopupActive: boolean = false;


  constructor(tileMap: number[][], objectMap: ObjectMap, private farmScene: FarmScene) {
    this.tileMap = tileMap;
    this.objectMap = objectMap;
    this.sprite = new Graphics();
    this.resetPosition();
    this.drawPlayerFace(this.lastDirection);

    window.addEventListener('keydown', (e) => {
      this.handleKey(e);
    });
  }

  public gainGold(amount: number): void {
    this.inventory.gold += amount;
  }

  public gainExp(key: 'wood' | 'stone' | 'farm', amount: number): void {
    const skill = this.skills[key];
    skill.exp += amount;

    this.skills.common.exp += EXP_COMMON; // 모든 특정 행위는 공통 경험치를 올린다.
  }

  public sleep(): void {
    this.levelUpCheck();
    this.hp = this.maxHp;
    this.stamina = this.maxStamina;
  }

  private levelUpCheck(): void {
    Object.entries(this.skills).forEach(([key, skill]) => {
      while (skill.exp >= skill.expToLevelUp) {
        const displayName = this.skillNames[key];
        this.farmScene.queueToast(`${displayName} Level Up!`);
        SoundManager.playEffect('levelUp');

        skill.exp -= skill.expToLevelUp;
        skill.level++;
        skill.expToLevelUp += 20;

        if (key === 'common') {
          const commonSkill = skill as CommonSkill;
          this.maxHp += commonSkill.maxHpBonus;
          this.maxStamina += commonSkill.maxStaminaBonus;
        }
      }
    });
  }

  public resetPosition(): void {
    this.sprite.x = TILE_SIZE * 9;
    this.sprite.y = TILE_SIZE * 3;
    this.lastDirection = 'down';
    this.drawPlayerFace(this.lastDirection);

    if (this.isExhausted) {
      this.isExhausted = false;
      this.stopExhaustedEffect();
    }
  }

  public setIsPopupActive(active: boolean): void {
    this.isPopupActive = active;
  }

  private handleKey(e: KeyboardEvent): void {
    if (this.isPopupActive) return;

    if (this.hp <= 0 || this.stamina <= 0) {
      if (!this.isExhausted) {
        this.isExhausted = true;
        SoundManager.playEffect('exhausted');
        this.showExhaustedEffect();
      }
      return;
    } else if (this.isExhausted) {
      this.isExhausted = false;
      this.stopExhaustedEffect();
    }

    const nextX = this.sprite.x;
    const nextY = this.sprite.y;

    if (e.key === 'ArrowUp') {
      this.lastDirection = 'up';
      if (this.canMove(nextX, nextY - this.speed)) {
        this.sprite.y -= this.speed;
      }
    }
    if (e.key === 'ArrowDown') {
      this.lastDirection = 'down';
      if (this.canMove(nextX, nextY + this.speed)) {
        this.sprite.y += this.speed;
      }
    }
    if (e.key === 'ArrowLeft') {
      this.lastDirection = 'left';
      if (this.canMove(nextX - this.speed, nextY)) {
        this.sprite.x -= this.speed;
      }
    }
    if (e.key === 'ArrowRight') {
      this.lastDirection = 'right';
      if (this.canMove(nextX + this.speed, nextY)) {
        this.sprite.x += this.speed;
      }
    }

    if (e.key === ' ') {
      this.performAction();
    }

    if (e.key === '1') {
      this.performSeed();
    }

    this.drawPlayerFace(this.lastDirection);
  }

  private performAction(): void {
    const offsetX = this.lastDirection === 'left' ? -this.speed : this.lastDirection === 'right' ? this.speed : 0;
    const offsetY = this.lastDirection === 'up' ? -this.speed : this.lastDirection === 'down' ? this.speed : 0;

    const targetCol = (this.sprite.x + offsetX) / this.tileSize;
    const targetRow = (this.sprite.y + offsetY) / this.tileSize;

    if (targetRow < 0 || targetRow >= this.tileMap.length || targetCol < 0 || targetCol >= this.tileMap[0].length) return;

    const targetTile = this.tileMap[targetRow][targetCol];
    const targetObject = this.objectMap[targetRow][targetCol];

    // Tree (벌목)
    if (targetObject?.type === 'Tree') {
      const stamina = Math.max(1, STAMINA_WOOD - ((this.skills.wood.level - 1) * this.skills.wood.staminaReducePerLevel));
      if (this.stamina < stamina) {
        SoundManager.playEffect('error');
        return;
      }
      this.stamina -= stamina;
      this.gainExp('wood', EXP_WOOD);
      this.inventory.wood++;
      this.farmScene.updateObject(targetRow, targetCol, null);
      SoundManager.playEffect('chop');
      return;
    }

    // Stone (채광)
    if (targetObject?.type === 'Stone') {
      const stamina = Math.max(1, STAMINA_STONE - ((this.skills.stone.level - 1) * this.skills.stone.staminaReducePerLevel));
      if (this.stamina < stamina) {
        SoundManager.playEffect('error');
        return;
      }
      this.stamina -= stamina;
      this.gainExp('stone', EXP_STONE);
      this.inventory.stone++;
      this.farmScene.updateObject(targetRow, targetCol, null);
      SoundManager.playEffect('mine');
      return;
    }

    // Market (상점)
    if (targetObject?.type === 'Market') {
      this.farmScene.onOpenMarket?.();
      return;
    }

    // Water (물 뜨기)
    if (targetTile === TileType.Water) {
      if (this.stamina < STAMINA_WATER) {
        SoundManager.playEffect('error');
        return;
      }
      this.stamina -= STAMINA_WATER;
      this.inventory.water++;
      SoundManager.playEffect('water');
      return;
    }

    // Soil (경작)
    if (targetTile === TileType.Soil) {
      const reduceStamina = Math.floor((this.skills.farm.level - 1) / 2) * this.skills.farm.staminaReducePerLevel;
      const stamina = Math.max(1, STAMINA_DIGGING - reduceStamina);
      if (this.stamina < stamina) {
        SoundManager.playEffect('error');
        return;
      }
      this.stamina -= stamina;
      this.tileMap[targetRow][targetCol] = TileType.Tilled;
      this.gainExp('farm', EXP_DIGGING);
      this.farmScene.updateTile(targetRow, targetCol);
      SoundManager.playEffect('dig');
      return;
    }

    // Tilled (물 주기)
    if (targetTile === TileType.Tilled) {
      if (this.inventory.water === 0) {
        SoundManager.playEffect('error');
        return;
      }
      const reduceStamina = Math.floor((this.skills.farm.level - 1) / 2) * this.skills.farm.staminaReducePerLevel;
      const stamina = Math.max(1, STAMINA_WATERING - reduceStamina);
      if (this.stamina < stamina) {
        SoundManager.playEffect('error');
        return;
      }
      this.stamina -= stamina;
      this.inventory.water--;
      this.tileMap[targetRow][targetCol] = TileType.Watered;
      this.gainExp('farm', EXP_WATERING);
      this.farmScene.updateTile(targetRow, targetCol);
      SoundManager.playEffect('water');
      return;
    }
  }

  /** 씨앗 뿌리기. */
  private performSeed(): void {
    if (this.inventory.springSeed <= 0) {
      SoundManager.playEffect('error');
      return;
    }

    const offsetX = this.lastDirection === 'left' ? -this.speed :
      this.lastDirection === 'right' ? this.speed : 0;
    const offsetY = this.lastDirection === 'up' ? -this.speed :
      this.lastDirection === 'down' ? this.speed : 0;

    const targetCol = (this.sprite.x + offsetX) / this.tileSize;
    const targetRow = (this.sprite.y + offsetY) / this.tileSize;

    if (targetRow < 0 || targetRow >= this.tileMap.length ||
      targetCol < 0 || targetCol >= this.tileMap[0].length) {
      return;
    }

    if (!!this.objectMap[targetRow][targetCol]) {
      SoundManager.playEffect('error');
      return;
    }

    // 현재 타일이 경작 가능한 상태인지 확인 (예: 2 = 경작됨, 3 = 물 줌 가능)
    if (this.tileMap[targetRow][targetCol] === TileType.Tilled || this.tileMap[targetRow][targetCol] === TileType.Watered) {
      this.inventory.springSeed--;
      this.farmScene.updateObject(targetRow, targetCol, 'SpringSeed');
      SoundManager.playEffect('seed');
    } else {
      SoundManager.playEffect('error');
    }
  }


  public showExhaustedEffect(): void {
    let direction = -1;
    this.exhaustedTicker = new Ticker();
    this.exhaustedTicker.add(() => {
      this.sprite.alpha += 0.05 * direction;
      if (this.sprite.alpha <= 0.5) direction = 1;
      if (this.sprite.alpha >= 1) direction = -1;
    });
    this.exhaustedTicker.start();
  }

  public stopExhaustedEffect(): void {
    if (this.exhaustedTicker) {
      this.exhaustedTicker.stop();
      this.exhaustedTicker.destroy();
      this.exhaustedTicker = null;
      this.sprite.alpha = 1;
    }
  }

  private drawPlayerFace(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.sprite.clear();
    this.sprite.beginFill(0xfbceb1);
    this.sprite.drawRoundedRect(0, 0, this.tileSize, this.tileSize, 20);
    this.sprite.endFill();

    const centerX = this.tileSize / 2;
    const centerY = this.tileSize / 2;
    const offset = 3;
    const eyeGap = 4;

    let leftEyeX = centerX;
    let leftEyeY = centerY;
    let rightEyeX = centerX;
    let rightEyeY = centerY;

    if (direction === 'up') {
      leftEyeX = centerX - eyeGap;
      rightEyeX = centerX + eyeGap;
      leftEyeY = rightEyeY = centerY - offset;
    } else if (direction === 'down') {
      leftEyeX = centerX - eyeGap;
      rightEyeX = centerX + eyeGap;
      leftEyeY = rightEyeY = centerY + offset;
    } else if (direction === 'left') {
      leftEyeX = rightEyeX = centerX - offset;
      leftEyeY = centerY - eyeGap;
      rightEyeY = centerY + eyeGap;
    } else if (direction === 'right') {
      leftEyeX = rightEyeX = centerX + offset;
      leftEyeY = centerY - eyeGap;
      rightEyeY = centerY + eyeGap;
    }

    this.sprite.beginFill(0x000000);
    this.sprite.drawCircle(leftEyeX, leftEyeY, 2);
    this.sprite.drawCircle(rightEyeX, rightEyeY, 2);
    this.sprite.endFill();

    const pacifierOffset = this.tileSize * 0.4;
    let pacifierX = centerX;
    let pacifierY = centerY;

    if (direction === 'up') pacifierY -= pacifierOffset;
    else if (direction === 'down') pacifierY += pacifierOffset;
    else if (direction === 'left') pacifierX -= pacifierOffset;
    else if (direction === 'right') pacifierX += pacifierOffset;

    this.sprite.beginFill(0xffffff);
    this.sprite.drawCircle(pacifierX, pacifierY, 4);
    this.sprite.endFill();
  }

  private canMove(nextX: number, nextY: number): boolean {
    const col = nextX / this.tileSize;
    const row = nextY / this.tileSize;

    if (row < 0 || row >= this.tileMap.length || col < 0 || col >= this.tileMap[0].length) {
      return false;
    }

    const tile = this.tileMap[row][col];
    const object = this.objectMap[row][col];

    // (1) 물이면 못감
    if (tile === TileType.Water) {
      return false;
    }

    // (2) 다른 오브젝트가 있으면 못감
    return !object;
  }
}

