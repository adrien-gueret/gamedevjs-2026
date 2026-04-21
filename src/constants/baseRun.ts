import type { ConfigurableBaseRun } from "@/types/game";

export const BASE_RUN_KNIGHT: ConfigurableBaseRun = {
  health: { value: 20, max: 20 },
  type: "knight",
  passiveEffects: [],
  reels: [
    [
      "Shield",
      "Sword",
      "Sword",
      "Sleep",
      "Sword",
      "Coin",
      "Shield",
      "Sword",
      "Coin",
    ],
    [
      "Sword",
      "Coin",
      "Sleep",
      "Shield",
      "Sword",
      "Sword",
      "Sleep",
      "Sleep",
      "Sword",
    ],
    [
      "Sword",
      "Shield",
      "Sword",
      "Sleep",
      "Sword",
      "Sleep",
      "Sword",
      "Coin",
      "Shield",
    ],
  ],
  gluedSymbolsIndexes: [[], [], []],
};

export const BASE_RUN_SKELETON: ConfigurableBaseRun = {
  health: { value: 20, max: 30 },
  type: "skeleton",
  passiveEffects: ["defend"],
  reels: [
    ["Evil-Sword", "Sword", "Sword", "Sword", "Coin", "Shield", "Sword"],
    ["Sword", "Coin", "Shield", "Sword", "Shield", "Sword", "Shield"],
    ["Sword", "Shield", "Sword", "Evil-Sword", "Sword", "Coin", "Shield"],
  ],
  gluedSymbolsIndexes: [[], [], []],
};

export const BASE_RUN_WIZARD: ConfigurableBaseRun = {
  health: { value: 25, max: 25 },
  type: "wizard",
  passiveEffects: [],
  reels: [
    [
      "Sword",
      "Shield",
      "Sword",
      "Shield",
      "Sword",
      "Shield",
      "Sword",
      "Heart",
      "Sword",
    ],
    ["Coin", "Coin", "Coin", "Coin", "Coin"],
    [
      "Sword",
      "Shield",
      "Sword",
      "Shield",
      "Sword",
      "Shield",
      "Sword",
      "Heart",
      "Sword",
    ],
  ],
  gluedSymbolsIndexes: [[], [0, 1, 2, 3, 4], []],
};
