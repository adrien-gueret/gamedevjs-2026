import type {
  BetCost,
  ReelSymbol,
  Run,
  GameState,
  NextAction,
} from "@/types/game";

import { getNewBattleEnemy, getEnemyNextActions } from "./enemies";

import { setGameState } from "./gameStore";

// ---------------------------------------------------------------------------
// Run - Global
// ---------------------------------------------------------------------------

export function startRun(baseRun: Run): GameState {
  return setGameState({ currentRun: structuredClone(baseRun) });
}

export function endRun(): GameState {
  return setGameState({ currentRun: null });
}

// ---------------------------------------------------------------------------
// Run - Player health
// ---------------------------------------------------------------------------

export function takeDamage(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    const health = next.currentRun!.health;
    health.value = Math.max(0, health.value - amount);
    return next;
  });
}

export function healPlayer(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    const health = next.currentRun!.health;
    health.value = Math.min(health.max, health.value + amount);
    return next;
  });
}

// ---------------------------------------------------------------------------
// Run - Gold
// ---------------------------------------------------------------------------

export function addGold(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.gold += amount;
    return next;
  });
}

export function spendGold(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun || prev.currentRun.gold < amount) return prev;
    const next = structuredClone(prev);
    next.currentRun!.gold -= amount;
    return next;
  });
}

// ---------------------------------------------------------------------------
// Run - Reels
// ---------------------------------------------------------------------------

export function setRunReels(reels: ReelSymbol[][]): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.reels = reels;
    return next;
  });
}

// ---------------------------------------------------------------------------
// Run - Battle
// ---------------------------------------------------------------------------

export function startNewBattle(): GameState {
  setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle = {
      reels: structuredClone(prev.currentRun.reels),
      betCost: 1,
      enemy: getNewBattleEnemy(next.currentRun!.levelIndex),
      playerNextActions: [],
    };
    return next;
  });

  return setEnemyNextActions();
}

export function endBattle(): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle = null;
    next.currentRun!.levelIndex += 1;
    return next;
  });
}

export function setBattleReels(reels: ReelSymbol[][]): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.reels = reels;
    return next;
  });
}

export function setBetCost(betCost: BetCost): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.betCost = betCost;
    return next;
  });
}

export function addPlayerNextActions(nextAction: NextAction): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const battle = next.currentRun!.currentBattle!;
    const existing = battle.playerNextActions.find(
      (action) => action.type === nextAction.type,
    );

    if (!existing) {
      battle.playerNextActions = battle.playerNextActions.concat(nextAction);
    } else if (existing.value !== undefined) {
      existing.value += nextAction.value ?? 0;
    }
    return next;
  });
}

export function resetPlayerNextActions(): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.playerNextActions = [];
    return next;
  });
}

export function resetEnemyNextActions(): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.enemy.nextActions = [];
    return next;
  });
}

export function makeCharacterAttack(attacker: "player" | "enemy"): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const battle = next.currentRun!.currentBattle!;

    const attackerNextActions =
      attacker === "player"
        ? battle.playerNextActions
        : battle.enemy.nextActions;

    const attackAction = attackerNextActions.find(
      (action) => action.type === "attack",
    );
    const attackValue = attackAction?.value ?? 0;

    if (!attackValue) {
      return next;
    }

    const defenderNextActions =
      attacker === "player"
        ? battle.enemy.nextActions
        : battle.playerNextActions;

    const defenseValue = defenderNextActions
      .filter((action) => action.type === "defend")
      .reduce((total, action) => total + (action.value ?? 0), 0);

    const newAttackerNextActions = attackerNextActions.filter(
      (action) => action.type !== "attack",
    );

    // Remove attack action from attacker
    if (attacker === "player") {
      battle.playerNextActions = newAttackerNextActions;
    } else {
      battle.enemy.nextActions = newAttackerNextActions;
    }

    const removeDefenseFromDefender = () => {
      const newDefenderNextActions = defenderNextActions.filter(
        (action) => action.type !== "defend",
      );

      if (attacker === "player") {
        battle.enemy.nextActions = newDefenderNextActions;
      } else {
        battle.playerNextActions = newDefenderNextActions;
      }
    };

    if (attackValue > defenseValue) {
      removeDefenseFromDefender();
      const damage = Math.max(0, attackValue - defenseValue);

      if (attacker === "player") {
        battle.enemy.health.value = Math.max(
          0,
          battle.enemy.health.value - damage,
        );
      } else {
        next.currentRun!.health.value = Math.max(
          0,
          next.currentRun!.health.value - damage,
        );
      }
    } else {
      if (attackValue === defenseValue) {
        removeDefenseFromDefender();
      } else {
        const reduceDefense = (action: NextAction) => {
          if (action.type === "defend") {
            return {
              ...action,
              value: Math.max(0, (action.value ?? 0) - attackValue),
            };
          }
          return action;
        };

        if (attacker === "player") {
          battle.enemy.nextActions =
            battle.enemy.nextActions.map(reduceDefense);
        } else {
          battle.playerNextActions =
            battle.playerNextActions.map(reduceDefense);
        }
      }
    }

    return next;
  });
}

// ---------------------------------------------------------------------------
// Run - Battle Enemy
// ---------------------------------------------------------------------------

export function healEnemy(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const health = next.currentRun!.currentBattle!.enemy.health;
    health.value = Math.min(health.max, health.value + amount);
    return next;
  });
}

export function setEnemyNextActions(): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const enemy = next.currentRun!.currentBattle!.enemy;
    enemy.nextActions = getEnemyNextActions(enemy, next.currentRun!.levelIndex);
    return next;
  });
}
