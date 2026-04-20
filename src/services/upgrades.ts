import type { ReelSymbol, BuyableDevilDeal } from "@/types/game";

import {
  PERMANENT_DEVIL_DEALS,
  RUN_ONLY_DEVIL_DEALS,
} from "@/constants/devilDeals";

import { canDevilDealBeInShop } from "./selector";

import { getRandomElements } from "./utils";

export function getRandomBonusSymbols(): ReelSymbol[] {
  return getRandomElements(["Sword", "Shield", "Coin", "Heart"], 3);
}

export const MALUS_SYMBOLS: ReelSymbol[] = [
  "Evil-Heart",
  "Evil-Shield",
  "Evil-Sword",
];

export function isMalusSymbol(symbol: ReelSymbol): boolean {
  return MALUS_SYMBOLS.includes(symbol);
}

export function getRandomMalusBonusSymbol(): ReelSymbol {
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
