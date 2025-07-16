export enum TileType {
  Stone = 0,          // 상단 고정 회색 평지
  Soil = 1,           // 일반 흙 땅 (파면 Tilled)
  Tilled = 2,         // 파진 땅 (물 주면 Watered)
  Watered = 3,        // 물 준 땅 (작물 심기 가능)
  Tree = 4,           // 나무
  Water = 5,          // 물 (고정된 직사각형 영역)
  SoilWithStone = 6,  // 일반 흙 땅에 돌 있는거
  House = 7,          // 집
  Market = 8          // 마켓
}