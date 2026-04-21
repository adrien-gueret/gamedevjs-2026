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
  const attackTypes: Array<"attack" | "defend"> = ["attack", "defend"];
  const healthRatio = enemy.health.value / enemy.health.max;

  if (levelIndex === 0) {
    const actionType = attackTypes[random(0, 2) % 2];

    return [
      {
        type: actionType,
        value:
          actionType === "defend" ? 1 : random(1, healthRatio === 1 ? 1 : 2),
      },
    ];
  }

  switch (enemy.type) {
    case "rat":
    default: {
      const actionType = attackTypes[random(0, 1)];

      return [
        {
          type: actionType,
          value: random(1, healthRatio === 1 ? 1 : 2),
        },
      ];
    }
  }
}
