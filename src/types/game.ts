export type ReelSymbol = "Sleep" | "Sword" | "Shield" | "Heart" | "Coin";

export type EnnemyType = "rat" | "blob" | "skeleton";

export type PlayerType = "knight" | "wizard";

export type BetCost = 1 | 2 | 3;

export type Health = {
  value: number;
  max: number;
};

export type EnemyNextAction = {
  type: "attack" | "defend" | "sleep";
  value: number;
};

export type Enemy = {
  type: EnnemyType;
  health: Health;
  nextActions: EnemyNextAction[];
};

export type Battle = {
  reels: ReelSymbol[][];
  betCost: BetCost;
  enemy: Enemy;
};

export type Run = {
  health: Health;
  gold: number;
  type: PlayerType;
  reels: ReelSymbol[][];
  levelIndex: number;
  currentBattle: Battle | null;
};

export type ConfigurableBaseRun = Omit<Run, "levelIndex" | "currentBattle">;

export type GameState = {
  currentRun: Run | null;
};
