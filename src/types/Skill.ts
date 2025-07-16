export type CommonSkill = {
  level: number;
  exp: number;
  expToLevelUp: number;
  maxHpBonus: number;
  maxStaminaBonus: number;
};

export type SpecializedSkill = {
  level: number;
  exp: number;
  expToLevelUp: number;
  staminaReducePerLevel: number;
};