import type { Enemy, NextAction } from "@/types/game";

import { random } from "./maths";

export function getNewBattleEnemy(levelIndex: number): Enemy {
  switch (levelIndex) {
    default:
      const healthValue = 1; //6 + random(0, 3);
      return {
        type: "rat",
        health: {
          value: healthValue,
          max: healthValue,
        },
        nextActions: [],
      };
  }
}

export function getEnemyNextActions(
  enemy: Enemy,
  levelIndex: number,
): NextAction[] {
  const attackTypes: Array<"attack" | "defend"> = ["attack", "defend"];
  const healthRatio = enemy.health.value / enemy.health.max;

  switch (enemy.type) {
    case "rat":
    default: {
      if (levelIndex === 0) {
        return [
          {
            type: attackTypes[random(0, 1)],
            value:
              healthRatio === 1
                ? 1
                : random(healthRatio < 0.25 ? 2 : 1, healthRatio < 0.5 ? 3 : 2),
          },
        ];
      }

      return [
        {
          type: "attack",
          value: 2,
        },
      ];
    }
  }
}
