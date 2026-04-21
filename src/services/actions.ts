import type {
  BetCost,
  Run,
  GameState,
  NextAction,
  ReelSymbol,
  PassiveEffectType,
  DevilDealType,
} from "@/types/game";

import { getNewBattleEnemy, getEnemyNextActions } from "./enemies";

import { setGameState } from "./gameStore";

function getPassiveEffectNextActions(state: GameState): NextAction[] {
  const passiveEffects = state.currentRun?.passiveEffects ?? [];

  const attackCount = passiveEffects.filter(
    (effect) => effect === "attack",
  ).length;
  const defendCount = passiveEffects.filter(
    (effect) => effect === "defend",
  ).length;

  const nextActions: NextAction[] = [];

  if (attackCount > 0) {
    nextActions.push({ type: "attack", value: attackCount });
  }

  if (defendCount > 0) {
    nextActions.push({ type: "defend", value: defendCount });
  }

  return nextActions;
}

// ---------------------------------------------------------------------------
// Run - Global
// ---------------------------------------------------------------------------

export function startRun(baseRun: Run): GameState {
  return setGameState((prev) => ({
    ...prev,
    currentRun: structuredClone(baseRun),
  }));
}

export function endRun(): GameState {
  return setGameState((prev) => ({
    ...prev,
    currentRun: null,
  }));
}

export function setCurrentPathname(pathname: string): GameState {
  return setGameState((prev) => ({ ...prev, currentPathname: pathname }));
}

export function setReelSymbol(
  reelIndex: number,
  symbolIndex: number,
  newSymbol: ReelSymbol,
): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.reels[reelIndex][symbolIndex] = newSymbol;
    return next;
  });
}

export function removeReelSymbol(
  reelIndex: number,
  symbolIndex: number,
): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.reels[reelIndex].splice(symbolIndex, 1);
    return next;
  });
}

export function addSymbolTooReel(
  reelIndex: number,
  newSymbol: ReelSymbol,
): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.reels[reelIndex].push(newSymbol);
    return next;
  });
}

export function glueSymbol(reelIndex: number, symbolIndex: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.gluedSymbolsIndexes[reelIndex].push(symbolIndex);
    return next;
  });
}

export function unglueSymbol(
  reelIndex: number,
  symbolIndex: number,
): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.gluedSymbolsIndexes[reelIndex] =
      next.currentRun!.gluedSymbolsIndexes[reelIndex].filter(
        (index) => index !== symbolIndex,
      );
    return next;
  });
}

export function addPassiveEffect(effect: PassiveEffectType): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.passiveEffects.push(effect);
    return next;
  });
}

export function addPermanentBonus(effect: DevilDealType): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.unlockedPermanentDeals.push(effect);

    if (["moreHealth1", "moreHealth2", "moreHealth3"].includes(effect)) {
      next.currentRun!.health.max += 10;
    }

    return next;
  });
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

export function addGold(amount: number = 1): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.gold += amount;
    return next;
  });
}

export function spendGold(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) {
      return prev;
    }
    const next = structuredClone(prev);
    next.gold -= amount;
    return next;
  });
}

export function spendMaxHealth(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun) {
      return prev;
    }
    const next = structuredClone(prev);
    next.currentRun!.health.value -= amount;
    next.currentRun!.health.max -= amount;
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
      betCost: next.unlockedPermanentDeals.includes("betterBet2")
        ? 3
        : next.unlockedPermanentDeals.includes("betterBet1")
          ? 2
          : 1,
      enemy: {
        ...getNewBattleEnemy(next.currentRun!.levelIndex),
        nextActions: [],
      },
      playerNextActions: getPassiveEffectNextActions(next),
      hasUsedLockedReel: false,
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

export function setBetCost(betCost: BetCost): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.betCost = betCost;
    return next;
  });
}

export function setHasUsedLockedReel(): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.hasUsedLockedReel = true;
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
    next.currentRun!.currentBattle!.playerNextActions =
      getPassiveEffectNextActions(next);
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

export function addEnemyNextActions(nextAction: NextAction): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const battle = next.currentRun!.currentBattle!;
    const existing = battle.enemy.nextActions.find(
      (action) => action.type === nextAction.type,
    );

    if (!existing) {
      battle.enemy.nextActions = battle.enemy.nextActions.concat(nextAction);
    } else if (existing.value !== undefined) {
      existing.value += nextAction.value ?? 0;
    }
    return next;
  });
}

// ---------------------------------------------------------------------------
// Run - Random choices
// ---------------------------------------------------------------------------

export function setRandomChoices(randomChoices: any[] = []): GameState {
  return setGameState((prev) => ({
    ...prev,
    currentRun: prev.currentRun ? { ...prev.currentRun, randomChoices } : null,
  }));
}
