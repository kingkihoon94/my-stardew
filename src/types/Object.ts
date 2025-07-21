import { Sprite } from "@pixi/sprite";

export type SeedType = 'SpringSeed' | 'SummerSeed' | 'AutumnSeed' | 'WinterSeed';
export type SproutType = 'SpringSprout' | 'SummerSprout' | 'AutumnSprout' | 'WinterSprout';
export type FruitType = 'Strawberry' | 'Cherry' | 'Watermelon' | 'Corn' | 'Raspberry' | 'Peach' | 'Kiwi' | 'Orange';
export type BuildingType = 'House' | 'Market' | 'BlackSmith';
export type ResourceType = 'Tree' | 'Stone';

export type LowerObjectType = SeedType | SproutType;
export type UpperObjectType = BuildingType | ResourceType | FruitType;

export type ObjectType = LowerObjectType | UpperObjectType;
export type ObjectTarget = 'upper' | 'lower';

export interface SeedOrSproutData {
  dayCnt: number;
  duration: number;
}

export interface FruitData {
  dayCnt: number;
  duration: number;
  quality: 0 | 1 | 2;
}

export interface BaseObjectCell {
  target: ObjectTarget;
  type: ObjectType;
  sprite: Sprite | null;
}

export interface SeedOrSproutObjectCell extends BaseObjectCell {
  target: 'lower';
  type: SeedType | SproutType;
  data: SeedOrSproutData;
}

export interface FruitObjectCell extends BaseObjectCell {
  target: 'upper';
  type: FruitType;
  data: FruitData;
}

export interface BuildingOrResourceObjectCell extends BaseObjectCell {
  target: 'upper';
  type: BuildingType | ResourceType;
  data?: undefined;
}

export type LowerObjectCell = SeedOrSproutObjectCell;
export type UpperObjectCell = FruitObjectCell | BuildingOrResourceObjectCell;

export type ObjectCell = LowerObjectCell | UpperObjectCell;
export type ObjectMap = (ObjectCell | null)[][];