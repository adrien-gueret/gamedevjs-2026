import type { BetCost, ReelSymbol, Run, GameState } from "@/types/game";

import { getNewBattleEnemy, getEnemyNextActions } from "./enemies";

import { setGameState } from "./gameStore";

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

export function startRun(baseRun: Run): GameState {
  return setGameState({ currentRun: structuredClone(baseRun) });
}

export function endRun(): GameState {
  return setGameState({ currentRun: null });
}

// ---------------------------------------------------------------------------
// Player - Health
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
// Player - Gold
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
// Player - Reels
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
// Battle
// ---------------------------------------------------------------------------

export function startNewBattle(): GameState {
  setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle = {
      reels: structuredClone(prev.currentRun.reels),
      betCost: 1,
      enemy: getNewBattleEnemy(next.currentRun!.levelIndex),
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

// ---------------------------------------------------------------------------
// Enemy
// ---------------------------------------------------------------------------

export function damageEnemy(amount: number): GameState {
  return setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const health = next.currentRun!.currentBattle!.enemy.health;
    health.value = Math.max(0, health.value - amount);
    return next;
  });
}

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
