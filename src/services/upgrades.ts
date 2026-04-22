import type { ReelSymbol, BuyableDevilDeal, DevilDealType } from "@/types/game";

import {
  PERMANENT_DEVIL_DEALS,
  RUN_ONLY_DEVIL_DEALS,
} from "@/constants/devilDeals";

import { canDevilDealBeInShop, hasUnlockedPermanentDeal } from "./selector";

import { random } from "./maths";
import { getRandomElements } from "./utils";

export function getCorrespondingSuperSymbol(
  symbol: ReelSymbol,
): ReelSymbol | null {
  switch (symbol) {
    case "Sword":
      return "Super-Sword";
    case "Shield":
      return "Super-Shield";
    case "Coin":
      return "Super-Coin";
    case "Heart":
      return "Super-Heart";
    default:
      return null;
  }
}

export function getRandomBonusSymbols(amount: number): ReelSymbol[] {
  const elements = getRandomElements<ReelSymbol>(
    ["Sword", "Shield", "Coin", "Heart"],
    amount,
  );

  const superDeals: [DevilDealType, ReelSymbol][] = [
    ["superShield", "Shield"],
    ["superSword", "Sword"],
    ["superCoin", "Coin"],
    ["superHeart", "Heart"],
  ];

  const unlockedSupers = superDeals
    .filter(([deal]) => hasUnlockedPermanentDeal(deal))
    .map(([, symbol]) => symbol);

  if (unlockedSupers.length > 0) {
    let atLeastOneImproved = false;

    for (let i = 0; i < elements.length; i++) {
      if (unlockedSupers.includes(elements[i])) {
        const improved = random(0, 1) === 1;
        if (improved) {
          elements[i] = getCorrespondingSuperSymbol(elements[i]) ?? elements[i];
          atLeastOneImproved = true;
        }
      }
    }

    if (!atLeastOneImproved) {
      const candidates = elements
        .map((symbol, index) => ({ symbol, index }))
        .filter(({ symbol }) => unlockedSupers.includes(symbol));

      if (candidates.length > 0) {
        const pick = getRandomElements(candidates, 1)[0];
        elements[pick.index] =
          getCorrespondingSuperSymbol(pick.symbol) ?? pick.symbol;
      }
    }
  }

  return elements;
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
  return getRandomElements<ReelSymbol>(
    ["Evil-Heart", "Evil-Shield", "Evil-Sword"],
    1,
  )[0];
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
