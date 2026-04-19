export type ReelSymbol = "Sleep" | "Sword" | "Shield" | "Heart" | "Coin";

export type EnnemyType = "rat" | "blob" | "skeleton";

export type PlayerType = "knight" | "wizard";

export type DevilDealType =
  // Permanent upgrades (only with gold cost)
  | "betterBet1"
  | "betterBet2"
  | "lockReel"
  | "moreHealth1"
  | "moreHealth2"
  | "moreHealth3"
  | "unlockSkeleton"
  | "unlockWizard"
  // Run-only upgrades
  | "destroyReelSymbol"
  | "replaceReelSymbol"
  | "passiveDefense"
  | "passiveAttack";

export type DevilDealCostType = "health" | "gold" | "reel";

export type DevilDealCost = {
  type: DevilDealCostType;
  value: number;
};

export type DevilDeal = {
  type: DevilDealType;
  requirements?: DevilDealType[];
  permanent: boolean;
  cost: DevilDealCost | DevilDealCost[];
};

export type BuyableDevilDeal = Omit<DevilDeal, "requirements" | "cost"> & {
  cost: DevilDealCost;
};

export type BetCost = 1 | 2 | 3;

export type Health = {
  value: number;
  max: number;
};

type NextActionWithValue = {
  type: "attack" | "defend";
  value: number;
};

type NextActionWithoutValue = {
  type: "sleep";
  value?: never;
};

export type NextAction = NextActionWithValue | NextActionWithoutValue;

export type Enemy = {
  type: EnnemyType;
  health: Health;
  nextActions: NextAction[];
};

export type Battle = {
  betCost: BetCost;
  enemy: Enemy;
  playerNextActions: NextAction[];
};

export type Run = {
  health: Health;
  type: PlayerType;
  reels: ReelSymbol[][];
  levelIndex: number;
  currentBattle: Battle | null;
  randomChoices: any[];
};

export type ConfigurableBaseRun = Omit<
  Run,
  "levelIndex" | "currentBattle" | "randomChoices"
>;

export type GameState = {
  gold: number;
  unlockedPermanentDeals: DevilDealType[];
  currentPathname: string;
  currentRun: Run | null;
};
