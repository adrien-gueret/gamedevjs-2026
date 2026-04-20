import type { Enemy, NextAction } from "@/types/game";

import { random } from "./maths";

export function getNewBattleEnemy(
  levelIndex: number,
): Omit<Enemy, "nextActions"> {
  switch (levelIndex) {
    default: {
      const healthValue = 7 + random(0, 2);
      return {
        type: "wizard",
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
    }

    /*
    default: {
      const healthValue = 7 + random(0, 2);
      return {
        type: "blob",
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
    }
    */

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

    case 2: {
      const healthValue = 7 + random(0, 2);
      return {
        type: "blob",
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
    }

    /*default: {
      const healthValue = 3;
      return {
        type: "rat",
        health: {
          value: healthValue,
          max: healthValue,
        },
      };
    }*/
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
