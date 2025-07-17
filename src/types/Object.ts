import { Sprite } from "@pixi/sprite";

export type ObjectType =
  | 'House'
  | 'Market'
  | 'Tree'
  | 'Stone'
  | 'SpringSeed'
  | 'SummerSeed'
  | 'AutumnSeed'
  | 'WinterSeed'
  | 'Sprout'
  | 'Strawberry'
  | 'Cherry'
  ;

export interface ObjectCell {
  type: ObjectType;
  sprite: Sprite | null;
  data?: any;
}

export type ObjectMap = (ObjectCell | null)[][];
