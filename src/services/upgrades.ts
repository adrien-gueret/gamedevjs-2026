import type { ReelSymbol, BuyableDevilDeal } from "@/types/game";

import {
  PERMANENT_DEVIL_DEALS,
  RUN_ONLY_DEVIL_DEALS,
} from "@/constants/devilDeals";

import { canBuyDevilDeal } from "./selector";

import { getRandomElements } from "./utils";

export function getRandomBonusSymbols(): ReelSymbol[] {
  return getRandomElements(["Sword", "Shield", "Coin", "Heart"], 3);
}

export function getMalusBonusSymbol(): ReelSymbol {
  return getRandomElements<ReelSymbol>(
    ["Evil-Heart", "Evil-Shield", "Evil-Sword"],
    1,
  )[0];
}

export function getRandomDevilDeals(): BuyableDevilDeal[] {
  const buyablePermanentDevilDeals = PERMANENT_DEVIL_DEALS.filter((deal) =>
    canBuyDevilDeal(deal.type),
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
