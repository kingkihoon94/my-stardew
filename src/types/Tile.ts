export enum TileType {
  Stone = 0,    // 상단 고정 회색 평지
  Soil = 1,     // 일반 흙 땅 (파면 Tilled)
  Tilled = 2,   // 파진 땅 (물 주면 Watered)
  Watered = 3,  // 물 준 땅 (작물 심기 가능)
  Water = 4,    // 물 (고정된 직사각형 영역)
}