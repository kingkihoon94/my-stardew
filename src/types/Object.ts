export type ObjectType =
  | 'House'
  | 'Market'
  | 'Tree'
  | 'Stone'
  | 'SpringSeed'
  | 'SummerSeed'
  | 'AutumnSeed'
  | 'WinterSeed'
  ;

export interface ObjectCell {
  type: ObjectType;
  data?: any;
}

export type ObjectMap = (ObjectCell | null)[][];
