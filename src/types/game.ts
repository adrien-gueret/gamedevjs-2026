export type ReelSymbol = "Empty" | "Sword" | "Shield" | "Heart" | "Coin";

export type EnnemyType = "rat" | "blob" | "skeleton" | "wizard";

export type BetCost = 1 | 2 | 3;

export type Health = {
  value: number;
  max: number;
};

export type Battle = {
  reels: ReelSymbol[][];
  betCost: BetCost;
  enemy: {
    type: EnnemyType;
    health: Health;
  };
};

export type Run = {
  health: Health;
  gold: number;
  reels: ReelSymbol[][];
  wonGameCount: number;
  currentBattle: Battle | null;
};

export type GameState = {
  currentRun: Run | null;
};
