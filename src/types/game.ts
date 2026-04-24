export type ReelSymbol =
  | "Sleep"
  | "Sword"
  | "Super-Sword"
  | "Shield"
  | "Super-Shield"
  | "Heart"
  | "Super-Heart"
  | "Coin"
  | "Super-Coin"
  | "Evil-Heart"
  | "Evil-Shield"
  | "Evil-Sword"
  | "Glued";

export type EnemyType = "rat" | "blob" | "skeleton" | "wizard";

export type PlayerType = "knight" | "skeleton" | "wizard" | "random";

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
  | "unlockRandom"
  | "superHeart"
  | "superCoin"
  | "superSword"
  | "superShield"
  // Run-only upgrades
  | "destroyReelSymbol"
  | "replaceReelSymbol"
  | "passiveDefense"
  | "passiveAttack"
  | "passiveWantedToDie"
  | "rerollDeals";

export type PassiveEffectType = "attack" | "defend" | "wantedToDie";

export type DevilDealCostType = "maxhealth" | "gold" | "reel" | "health";

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
  type: EnemyType;
  health: Health;
  nextActions: NextAction[];
};

export type Battle = {
  betCost: BetCost;
  enemy: Enemy;
  playerNextActions: NextAction[];
  hasUsedLockedReel: boolean;
};

export type Run = {
  health: Health;
  type: PlayerType;
  reels: ReelSymbol[][];
  gluedSymbolsIndexes: number[][];
  levelIndex: number;
  passiveEffects: PassiveEffectType[];
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
  audio: boolean;
  currentPathname: string;
  currentRun: Run | null;
};
