import type { Enemy, NextAction } from "@/types/game";

import { random } from "./maths";

export function getNewBattleEnemy(levelIndex: number): Enemy {
  switch (levelIndex) {
    default:
      const healthValue = 3;
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
        const actionType = attackTypes[random(0, 2) % 2];

        return [
          {
            type: actionType,
            value:
              actionType === "defend"
                ? 1
                : random(1, healthRatio === 1 ? 1 : 2),
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
