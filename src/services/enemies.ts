import type { Enemy, NextAction } from "@/types/game";

import { random } from "./maths";

export function getNewBattleEnemy(
  levelIndex: number,
): Omit<Enemy, "nextActions"> {
  switch (levelIndex) {
    case 0: {
      const healthValue = 3;
      return {
        type: "rat",
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
    }

    case 1: {
      const healthValue = 5 + random(0, 1);
      return {
        type: "rat",
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
    }

    default: {
      const roll = random(1, 100);
      let type: "rat" | "blob" | "skeleton" | "wizard";

      switch (levelIndex) {
        case 2:
          type = "blob";
          break;
        case 3:
          type = roll <= 50 ? "rat" : "blob";
          break;
        case 4:
          type = roll <= 33 ? "rat" : "blob";
          break;
        case 5:
          type = "skeleton";
          break;
        case 6:
          type = roll <= 67 ? "rat" : "skeleton";
          break;
        case 7:
          type = roll <= 50 ? "blob" : "skeleton";
          break;
        case 8:
          type = roll <= 40 ? "rat" : roll <= 70 ? "blob" : "skeleton";
          break;
        case 9:
          type = "wizard";
          break;
        case 10:
          type = roll <= 67 ? "rat" : "wizard";
          break;
        case 11:
          type = roll <= 50 ? "blob" : "wizard";
          break;
        case 12:
          type = roll <= 34 ? "rat" : roll <= 67 ? "skeleton" : "wizard";
          break;
        default:
          type =
            roll <= 25
              ? "rat"
              : roll <= 50
                ? "blob"
                : roll <= 75
                  ? "skeleton"
                  : "wizard";
      }

      const healthMin =
        type === "rat" ? 6 : type === "blob" ? 7 : type === "skeleton" ? 9 : 11;
      const healthMax =
        type === "rat"
          ? 8
          : type === "blob"
            ? 10
            : type === "skeleton"
              ? 12
              : 14;
      const healthValue = Math.ceil(
        random(healthMin, healthMax) * Math.max(levelIndex / 5, 1),
      );

      return {
        type,
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
    }
  }
}

export function getEnemyNextActions(
  enemy: Enemy,
  levelIndex: number,
): NextAction[] {
  const healthRatio = enemy.health.value / enemy.health.max;

  switch (levelIndex) {
    case 0:
    case 1: {
      const attackTypes: Array<"attack" | "defend"> = ["attack", "defend"];
      const actionType = attackTypes[random(0, 2) % 2];

      return [
        {
          type: actionType,
          value:
            actionType === "defend" ? 1 : random(1, healthRatio === 1 ? 1 : 2),
        },
      ];
    }

    default: {
      const roll = random(1, 100);

      let actionType: "attack" | "defend";
      let value: number;

      switch (enemy.type) {
        case "rat": {
          actionType = roll <= 80 ? "attack" : "defend";
          const base =
            actionType === "attack"
              ? Math.max(
                  Math.ceil(levelIndex / 8),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 2 + 1))) *
                      levelIndex) /
                      10,
                  ),
                )
              : Math.max(
                  1,
                  Math.ceil(levelIndex / 14),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 3 + 1))) *
                      levelIndex) /
                      24,
                  ),
                );
          value =
            actionType === "attack"
              ? Math.max(1, Math.round(base * (1 + (1 - healthRatio) * 0.2)))
              : base;
          break;
        }

        case "blob":
          actionType =
            healthRatio <= 0.5
              ? roll <= 80
                ? "defend"
                : "attack"
              : roll <= 80
                ? "attack"
                : "defend";
          value =
            actionType === "attack"
              ? Math.max(
                  Math.ceil(levelIndex / 9),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 2.5 + 1))) *
                      levelIndex) /
                      11,
                  ),
                )
              : Math.max(
                  1,
                  Math.ceil(levelIndex / 10),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 2.8 + 1))) *
                      levelIndex) /
                      20,
                  ),
                );
          break;

        case "skeleton":
          actionType =
            healthRatio <= 0.5
              ? roll <= 80
                ? "attack"
                : "defend"
              : roll <= 80
                ? "defend"
                : "attack";
          value =
            actionType === "attack"
              ? Math.max(
                  Math.ceil(levelIndex / 8),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 2.3 + 1))) *
                      levelIndex) /
                      10.5,
                  ),
                )
              : Math.max(
                  1,
                  Math.ceil(levelIndex / 8),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 2.6 + 1))) *
                      levelIndex) /
                      19,
                  ),
                );
          break;

        case "wizard":
        default: {
          actionType = roll <= 50 ? "attack" : "defend";
          const base =
            actionType === "attack"
              ? Math.max(
                  Math.ceil(levelIndex / 8.5),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 2.4 + 1))) *
                      levelIndex) /
                      10.8,
                  ),
                )
              : Math.max(
                  1,
                  Math.ceil(levelIndex / 10),
                  Math.ceil(
                    (random(1, random(2, Math.ceil(levelIndex / 2.9 + 1))) *
                      levelIndex) /
                      21,
                  ),
                );
          value =
            healthRatio <= 0.33 ? Math.max(1, Math.round(base * 1.1)) : base;
          break;
        }
      }

      return [{ type: actionType, value }];
    }
  }
}
