import type { ReelSymbol } from "@/types/game";

import { shuffleArray } from "./utils";

export function getRandomSymbols(): ReelSymbol[] {
  const symbols: ReelSymbol[] = shuffleArray([
    "Sword",
    "Shield",
    "Coin",
    "Heart",
  ]);
  const randomSymbols: ReelSymbol[] = symbols.slice(0, 3);

  return randomSymbols;
}
