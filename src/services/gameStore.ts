import { useSyncExternalStore } from "react";

import type { GameState } from "@/types/game";

import { getKey, storeKey } from "./store";

const DEFAULT_STATE: GameState = {
  gold: 0,
  audio: false,
  unlockedPermanentDeals: [],
  currentPathname: "/",
  currentRun: null,
};

let state: GameState = getKey("gameState") ?? DEFAULT_STATE;
state.audio = false; // Ensure audio is always off on page load
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

const store = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState(): GameState {
    return state;
  },
};

export function getGameState(): GameState {
  return state;
}

export function setGameState(
  updater: GameState | ((prev: GameState) => GameState),
): GameState {
  state = typeof updater === "function" ? updater(state) : updater;
  storeKey("gameState", state);
  notify();
  return state;
}

export function resetGameState(): GameState {
  return setGameState(DEFAULT_STATE);
}

export function useGameState(): GameState {
  return useSyncExternalStore(store.subscribe, store.getState);
}
