import type { ReelSymbol, BuyableDevilDeal } from "@/types/game";

import {
  PERMANENT_DEVIL_DEALS,
  RUN_ONLY_DEVIL_DEALS,
} from "@/constants/devilDeals";

import { canDevilDealBeInShop } from "./selector";

import { getRandomElements } from "./utils";

export function getRandomBonusSymbols(amount: number = 3): ReelSymbol[] {
  return getRandomElements(["Sword", "Shield", "Coin", "Heart"], amount);
}

export const MALUS_SYMBOLS: ReelSymbol[] = [
  "Evil-Heart",
  "Evil-Shield",
  "Evil-Sword",
  "Glued",
];

export function isMalusSymbol(symbol: ReelSymbol): boolean {
  return MALUS_SYMBOLS.includes(symbol);
}

export function getRandomMalusSymbol(): ReelSymbol {
  return getRandomElements<ReelSymbol>(MALUS_SYMBOLS, 1)[0];
}

export function getRandomDevilDeals(): BuyableDevilDeal[] {
  const buyablePermanentDevilDeals = PERMANENT_DEVIL_DEALS.filter((deal) =>
    canDevilDealBeInShop(deal.type),
  );

  const randomPermanentDevilDeals = getRandomElements(
    buyablePermanentDevilDeals,
    2,
  ) as BuyableDevilDeal[];

  const randomRunOnlyDevilDeals = getRandomElements(
    RUN_ONLY_DEVIL_DEALS,
    3,
  ).map((deal) => ({
    ...deal,
    cost: Array.isArray(deal.cost)
      ? getRandomElements(deal.cost, 1)[0]
      : deal.cost,
  }));

  return [...randomPermanentDevilDeals, ...randomRunOnlyDevilDeals];
}

export function getCorrespondingMalusSymbol<T extends boolean>(
  symbol: ReelSymbol,
  randomIfNone?: T,
): T extends true ? ReelSymbol : ReelSymbol | null {
  switch (symbol) {
    case "Sword":
      return "Evil-Sword";

    case "Shield":
      return "Evil-Shield";

    case "Heart":
      return "Evil-Heart";

    default:
      return (randomIfNone ? getRandomMalusSymbol() : null) as T extends true
        ? ReelSymbol
        : ReelSymbol | null;
  }
}
