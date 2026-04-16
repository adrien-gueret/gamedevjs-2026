import type { Enemy } from "@/types/game";

import { random } from "./maths";

export function getNewBattleEnemy(levelIndex: number): Enemy {
  switch (levelIndex) {
    default:
      const healthValue = 10 + random(0, 3);
      return {
        type: "rat",
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
  }
}
