import type { GameState } from "@/types/game";

const STORAGE_KEY = "THE_DEVILE_MACHINE_STORAGE_KEY";

type Store = {
  gameState?: GameState;
};

function getDefaultStore(): Store {
  return {};
}

function getStore(): Store {
  const store = localStorage.getItem(STORAGE_KEY);

  try {
    return store ? JSON.parse(store) : getDefaultStore();
  } catch (e) {
    console.error("Failed to parse store from localStorage:", e);
    return getDefaultStore();
  }
}

function putStore(store: Store): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function storeKey<K extends keyof Store>(key: K, value: Store[K]): void {
  const store = getStore();

  putStore({
    ...store,
    [key]: value,
  });
}

export function getKey<K extends keyof Store>(key: K): Store[K] {
  const store = getStore();

  return store[key];
}

export function removeKey<K extends keyof Store>(key: K): void {
  const store = getStore();

  delete store[key];

  putStore(store);
}
