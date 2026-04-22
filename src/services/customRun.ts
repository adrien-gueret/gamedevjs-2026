import type {
  ConfigurableBaseRun,
  PassiveEffectType,
  PlayerType,
  ReelSymbol,
} from "@/types/game";

function createSeededRng(seed: string) {
  let state = 5381;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 33) ^ seed.charCodeAt(i);
    state = state >>> 0;
  }

  if (state === 0) {
    state = 1;
  }

  return {
    next(): number {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    },

    int(min: number, max: number): number {
      return min + Math.floor(this.next() * (max - min + 1));
    },

    pick<T>(arr: T[]): T {
      return arr[this.int(0, arr.length - 1)];
    },
  };
}

export function generateBaseRunFromString(
  randomString: string,
  forcedPlayerType?: PlayerType,
): ConfigurableBaseRun {
  const rng = createSeededRng(randomString);

  let type: PlayerType = rng.pick(["knight", "skeleton", "wizard"]);
  type = forcedPlayerType ?? type;

  const healthMax = rng.int(20, 40);
  const healthValue = type === "skeleton" ? healthMax - 10 : healthMax;

  const passiveRoll = rng.next();
  const passiveEffects: PassiveEffectType[] =
    passiveRoll < 0.15 ? ["attack"] : passiveRoll < 0.25 ? ["defend"] : [];

  const baseSymbols: ReelSymbol[] = [
    "Sword",
    "Shield",
    "Coin",
    "Heart",
    "Sleep",
  ];
  const evilSymbols: ReelSymbol[] = ["Evil-Sword", "Evil-Shield", "Evil-Heart"];
  const superSymbols: ReelSymbol[] = [
    "Super-Sword",
    "Super-Shield",
    "Super-Coin",
    "Super-Heart",
  ];

  const reels: ReelSymbol[][] = [];
  let totalSwords = 0;

  for (let r = 0; r < 3; r++) {
    const reelSize = rng.int(6, 9);
    const reel: ReelSymbol[] = [];

    for (let s = 0; s < reelSize; s++) {
      const roll = rng.next();
      let symbol: ReelSymbol;

      if (roll < 0.03) {
        symbol = rng.pick(superSymbols);
      } else if (roll < 0.1) {
        symbol = rng.pick(evilSymbols);
      } else {
        symbol = rng.pick(baseSymbols);
      }

      if (symbol === "Sword") totalSwords++;
      reel.push(symbol);
    }

    reels.push(reel);
  }

  while (totalSwords < 3) {
    const r = rng.int(0, 2);
    const s = rng.int(0, reels[r].length - 1);
    if (reels[r][s] !== "Sword") {
      reels[r][s] = "Sword";
      totalSwords++;
    }
  }

  const gluedSymbolsIndexes: number[][] = [[], [], []];

  return {
    health: { value: healthValue, max: healthMax },
    type,
    passiveEffects,
    reels,
    gluedSymbolsIndexes,
  };
}
