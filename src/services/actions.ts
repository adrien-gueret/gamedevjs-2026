import { setGameState } from "./gameStore";
import type { BetCost, Battle, ReelSymbol, Run } from "../types/game";

const DEFAULT_RUN: Run = {
  health: { value: 10, max: 10 },
  gold: 0,
  reels: [],
  wonGameCount: 0,
  currentBattle: null,
};

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

export function startRun(): void {
  setGameState({ currentRun: structuredClone(DEFAULT_RUN) });
}

export function endRun(): void {
  setGameState({ currentRun: null });
}

// ---------------------------------------------------------------------------
// Player - Health
// ---------------------------------------------------------------------------

export function takeDamage(amount: number): void {
  setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    const health = next.currentRun!.health;
    health.value = Math.max(0, health.value - amount);
    return next;
  });
}

export function healPlayer(amount: number): void {
  setGameState((prev) => {
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

export function addGold(amount: number): void {
  setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.gold += amount;
    return next;
  });
}

export function spendGold(amount: number): boolean {
  let canAfford = false;
  setGameState((prev) => {
    if (!prev.currentRun || prev.currentRun.gold < amount) return prev;
    canAfford = true;
    const next = structuredClone(prev);
    next.currentRun!.gold -= amount;
    return next;
  });
  return canAfford;
}

// ---------------------------------------------------------------------------
// Player - Reels
// ---------------------------------------------------------------------------

export function setRunReels(reels: ReelSymbol[][]): void {
  setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.reels = reels;
    return next;
  });
}

// ---------------------------------------------------------------------------
// Battle
// ---------------------------------------------------------------------------

export function startBattle(battle: Battle): void {
  setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle = battle;
    return next;
  });
}

export function endBattle(won: boolean): void {
  setGameState((prev) => {
    if (!prev.currentRun) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle = null;
    if (won) next.currentRun!.wonGameCount += 1;
    return next;
  });
}

export function setBattleReels(reels: ReelSymbol[][]): void {
  setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.reels = reels;
    return next;
  });
}

export function setBetCost(betCost: BetCost): void {
  setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    next.currentRun!.currentBattle!.betCost = betCost;
    return next;
  });
}

// ---------------------------------------------------------------------------
// Enemy
// ---------------------------------------------------------------------------

export function damageEnemy(amount: number): void {
  setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const health = next.currentRun!.currentBattle!.enemy.health;
    health.value = Math.max(0, health.value - amount);
    return next;
  });
}

export function healEnemy(amount: number): void {
  setGameState((prev) => {
    if (!prev.currentRun?.currentBattle) return prev;
    const next = structuredClone(prev);
    const health = next.currentRun!.currentBattle!.enemy.health;
    health.value = Math.min(health.max, health.value + amount);
    return next;
  });
}
