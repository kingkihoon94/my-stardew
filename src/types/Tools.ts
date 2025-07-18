// ----------------------- 도구 모음 -----------------------
export interface Tools {
  hoe: Hoe;
  axe: Axe;
  pickaxe: Pickaxe;
  wateringCan: WateringCan;
}

// ----------------------- 공통 타입 -----------------------
export interface ToolOption<T extends string> {
  type: T;
  min: number;
  max: number;
}

export interface ToolSlot<T extends string> {
  type: T;
  value: number;
}

export interface BaseTool<T extends string> {
  level: number;
  slots: (ToolSlot<T> | null)[];
}

export function getRandomToolOptions<T extends string>(
  options: ToolOption<T>[],
  count: number = 3
): ToolSlot<T>[] {
  const result: ToolSlot<T>[] = [];
  for (let i = 0; i < count; i++) {
    result.push(getRandomToolOption(options));
  }
  return result;
}

export function getRandomToolOption<T extends string>(
  options: ToolOption<T>[]
): ToolSlot<T> {
  const randomIdx = Math.floor(Math.random() * options.length);
  const option = options[randomIdx];
  const value = Math.floor(Math.random() * (option.max - option.min + 1)) + option.min;
  return { type: option.type, value };
}

export function levelUpTool<T extends string>(
  tool: BaseTool<T>,
  options: ToolOption<T>[],
  onOptionSelect: (candidates: ToolSlot<T>[], onSelect: (selected: ToolSlot<T>) => void) => void
) {
  const prevLevel = tool.level;
  tool.level = Math.min(tool.level + 1, 5); // 방어 코드.
  const availableSlots = tool.level;
  const newSlots: (ToolSlot<T> | null)[] = tool.slots.slice(0, availableSlots);

  if (prevLevel < availableSlots) {
    const candidates = [
      getRandomToolOption(options),
      getRandomToolOption(options),
      getRandomToolOption(options),
    ];

    onOptionSelect(candidates, (selectedOption) => {
      newSlots[availableSlots - 1] = selectedOption;
      tool.slots = newSlots;
    });
  } else {
    tool.slots = newSlots;
  }
}


export function rerollToolSlot<T extends string>(
  tool: BaseTool<T>,
  slotIdx: number,
  options: ToolOption<T>[]
) {
  tool.slots[slotIdx] = getRandomToolOption(options);
}

// ----------------------- 각 도구 타입 -----------------------

export type HoeOptionType =
  | '경작 스태미나 감소'
  | '경작 스태미나 무소모 (%)'
  | '땅파다 돈을 획득 (%)';

export type AxeOptionType =
  | '나무 추가 획득 (%)'
  | '벌목 스태미나 무소모 (%)'
  | '나무 파괴 무효 (%)';

export type PickaxeOptionType =
  | '돌 추가 획득 (%)'
  | '채광 스태미나 무소모 (%)'
  | '돌 파괴 무효 (%)';

export type WateringCanOptionType =
  | '물주기 스태미나 소모 감소'
  | '물주기 스태미나 무소모 (%)'
  | '물퍼기 스태미나 소모 감소'
  | '물퍼기 시 추가 획득 (%)';

export type Hoe = BaseTool<HoeOptionType>;
export type Axe = BaseTool<AxeOptionType>;
export type Pickaxe = BaseTool<PickaxeOptionType>;
export type WateringCan = BaseTool<WateringCanOptionType>;

// ----------------------- 옵션 데이터 -----------------------

export const HOE_OPTIONS: ToolOption<HoeOptionType>[] = [
  { type: '경작 스태미나 감소', min: 1, max: 1 },
  { type: '경작 스태미나 무소모 (%)', min: 10, max: 15 },
  { type: '땅파다 돈을 획득 (%)', min: 15, max: 20 },
];

export const AXE_OPTIONS: ToolOption<AxeOptionType>[] = [
  { type: '나무 추가 획득 (%)', min: 10, max: 15 },
  { type: '벌목 스태미나 무소모 (%)', min: 10, max: 15 },
  { type: '나무 파괴 무효 (%)', min: 10, max: 15 },
];

export const PICKAXE_OPTIONS: ToolOption<PickaxeOptionType>[] = [
  { type: '돌 추가 획득 (%)', min: 10, max: 15 },
  { type: '채광 스태미나 무소모 (%)', min: 10, max: 15 },
  { type: '돌 파괴 무효 (%)', min: 10, max: 15 },
];

export const WATERINGCAN_OPTIONS: ToolOption<WateringCanOptionType>[] = [
  { type: '물주기 스태미나 소모 감소', min: 1, max: 1 },
  { type: '물주기 스태미나 무소모 (%)', min: 10, max: 15 },
  { type: '물퍼기 스태미나 소모 감소', min: 1, max: 1 },
  { type: '물퍼기 시 추가 획득 (%)', min: 15, max: 20 },
];