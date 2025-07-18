import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Ticker } from '@pixi/core';
import { Sprite } from '@pixi/sprite';

import { FarmScene } from '../scenes/FarmScene';
import { SoundManager } from '../core/SoundManager';

import { TileType } from '../types/Tile';
import { CommonSkill, SpecializedSkill } from '../types/Skill';
import { ObjectMap } from '../types/Object';

import babyImage from '../assets/texture/baby.png';

import {
  EXP_COMMON, EXP_DIGGING, EXP_STONE, EXP_WATERING, EXP_WOOD,
  PLAYER_SIZE, TILE_SIZE,
  STAMINA_DIGGING, STAMINA_STONE, STAMINA_WATER, STAMINA_WATERING, STAMINA_WOOD
} from '../constants';

import { Tools } from '../types/Tools';

type PlayerDirection = 'up' | 'down' | 'left' | 'right';

export class Player {
  public sprite: Container;
  private babySprite: Sprite;
  private arrow: Graphics;
  private lastDirection: PlayerDirection = 'down';

  public hp: number = 100;
  public stamina: number = 100;
  public water: number = 0;
  public gold: number = 1000;

  public maxHp: number = 100;
  public maxStamina: number = 100;
  public maxWater: number = 10;

  private skillNames: Record<string, string> = {
    common: '캐릭터',
    wood: '벌목',
    stone: '채광',
    farm: '농사'
  };

  public inventory: Record<string, number> = {
    wood: 500,
    stone: 500,

    springSeed: 0,
    summerSeed: 0,
    autumnSeed: 0,
    winterSeed: 0,

    strawberry: 0,
    cherry: 0,
  };

  public tools: Tools = {
    hoe: { level: 0, slots: [] },
    axe: { level: 0, slots: [] },
    pickaxe: { level: 0, slots: [] },
    wateringCan: { level: 0, slots: [] },
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

  private exhaustedTicker: Ticker | null = null;
  private isExhausted: boolean = false;

  private isPopupActive: boolean = false;

  constructor(tileMap: number[][], objectMap: ObjectMap, private farmScene: FarmScene) {
    this.tileMap = tileMap;
    this.objectMap = objectMap;
    this.sprite = new Container();

    this.babySprite = Sprite.from(babyImage);
    this.babySprite.width = TILE_SIZE;
    this.babySprite.height = TILE_SIZE;
    this.sprite.addChild(this.babySprite);

    this.arrow = new Graphics();
    this.sprite.addChild(this.arrow);

    this.resetPosition();

    window.addEventListener('keydown', (e) => {
      this.handleKey(e);
    });
  }


  public gainGold(amount: number): void {
    this.gold += amount;
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

  private updatePlayerFace(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.updateDirectionArrow(direction);
  }

  public resetPosition(): void {
    this.sprite.x = TILE_SIZE * 9;
    this.sprite.y = TILE_SIZE * 3;
    this.lastDirection = 'down';
    this.updateDirectionArrow(this.lastDirection);

    this.isExhausted = false;
    this.stopExhaustedEffect();
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

    this.updatePlayerFace(this.lastDirection);
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
      this.farmScene.onShowInventory?.();
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
      this.farmScene.onShowInventory?.();
      return;
    }

    // StrawBerry (딸기)
    if (targetObject?.type === 'Strawberry') {
      this.inventory.strawberry++;
      this.farmScene.updateObject(targetRow, targetCol, null);
      SoundManager.playEffect('success');
      this.farmScene.onShowInventory?.();
      return;
    }

    // Cherry (체리)
    if (targetObject?.type === 'Cherry') {
      this.inventory.cherry++;
      this.farmScene.updateObject(targetRow, targetCol, null);
      SoundManager.playEffect('success');
      this.farmScene.onShowInventory?.();
      return;
    }

    // Market (마켓)
    if (targetObject?.type === 'Market') {
      this.farmScene.onOpenMarket?.();
      this.farmScene.onShowInventory?.();
      return;
    }

    // BlackSmith (대장간)
    if (targetObject?.type === 'BlackSmith') {
      this.farmScene.onOpenBlackSmith?.();
      this.farmScene.onShowInventory?.();
      return;
    }

    // Water (물 뜨기)
    if (targetTile === TileType.Water) {
      if (this.stamina < STAMINA_WATER) {
        SoundManager.playEffect('error');
        return;
      }
      this.stamina -= STAMINA_WATER;
      this.water++;
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
      this.farmScene.drawTile(targetRow, targetCol);
      SoundManager.playEffect('dig');
      return;
    }

    // Tilled (물 주기)
    if (targetTile === TileType.Tilled) {
      if (this.water === 0) {
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
      this.water--;
      this.tileMap[targetRow][targetCol] = TileType.Watered;
      this.gainExp('farm', EXP_WATERING);
      this.farmScene.drawTile(targetRow, targetCol);
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

  private updateDirectionArrow(direction: PlayerDirection): void {
    this.arrow.clear();
    this.arrow.beginFill(0xce0018, 0.5);

    const centerX = TILE_SIZE / 2;
    const centerY = TILE_SIZE / 2;
    const offset = 24;

    let x = centerX;
    let y = centerY;

    switch (direction) {
      case 'up': y -= offset; break;
      case 'down': y += offset; break;
      case 'left': x -= offset; break;
      case 'right': x += offset; break;
    }

    this.arrow.drawCircle(x, y, 5);
    this.arrow.endFill();
  }

  private canMove(nextX: number, nextY: number): boolean {
    const col = nextX / this.tileSize;
    const row = nextY / this.tileSize;

    if (
      row < 0 || row >= this.tileMap.length ||
      col < 0 || col >= this.tileMap[0].length
    ) return false;

    const tile = this.tileMap[row][col];
    const object = this.objectMap[row][col];

    return tile !== TileType.Water && (!object || object.target === 'lower');
  }
}

