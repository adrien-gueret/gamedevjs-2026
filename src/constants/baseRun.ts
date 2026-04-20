import type { ConfigurableBaseRun } from "@/types/game";

export const BASE_RUN_KNIGHT: ConfigurableBaseRun = {
  health: { value: 20, max: 20 },
  type: "knight",
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
};
