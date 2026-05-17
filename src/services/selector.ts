import { useCallback } from "react";
import type { DevilDealType, PersistentGameState } from "@/types/game";
import { PERMANENT_DEVIL_DEALS } from "@/constants/devilDeals";
import {
  usePersistentSelector,
  usePersistentSelectorShallow,
} from "@/services/state";

import { getRandomElements } from "./utils";

export function useCanPlayerAttack(): boolean {
  const playerNextActions = usePersistentSelectorShallow(
    (state) => state.currentRun?.currentBattle?.playerNextActions ?? [],
  );

  const attackAction = playerNextActions.find(
    (action) => action.type === "attack",
  );
  const attackValue = attackAction?.value ?? 0;

  return attackValue > 0;
}

export function useCanEnemyAttack(): boolean {
  const enemyNextActions = usePersistentSelectorShallow(
    (state) => state.currentRun?.currentBattle?.enemy.nextActions ?? [],
  );

  const attackAction = enemyNextActions.find(
    (action) => action.type === "attack",
  );
  const attackValue = attackAction?.value ?? 0;

  return attackValue > 0;
}

export function useIsEnemyDefeated(): boolean {
  const enemyHealth = usePersistentSelectorShallow(
    (state) => state.currentRun?.currentBattle?.enemy.health.value ?? 0,
  );

  return enemyHealth <= 0;
}

export function useIsPlayerDefeated(): boolean {
  const health = useHealth();
  return health.value <= 0;
}

export function useHasUnlockedPermanentDeal() {
  const unlockedPermanentDeals = usePersistentSelectorShallow(
    (state) => state.unlockedPermanentDeals,
  );

  return useCallback(
    (dealType: DevilDealType) => {
      return unlockedPermanentDeals.includes(dealType);
    },
    [unlockedPermanentDeals],
  );
}

export function useGold() {
  return usePersistentSelector((state) => state.gold);
}

export function useHealth() {
  return usePersistentSelectorShallow((state) => ({
    value: state.currentRun?.health.value ?? 0,
    max: state.currentRun?.health.max ?? 0,
  }));
}

export function useRandomChoices() {
  return usePersistentSelectorShallow(
    (state) => state.currentRun?.randomChoices ?? [],
  );
}

export function useCanDevilDealBeInShop() {
  const hasUnlockedPermanentDeal = useHasUnlockedPermanentDeal();
  const gold = useGold();

  return useCallback(
    (dealType: DevilDealType) => {
      const deal = PERMANENT_DEVIL_DEALS.find((deal) => deal.type === dealType);

      if (!deal) {
        return dealType === "passiveWantedToDie" ? gold > 1 : true;
      }

      const hasRequiredDeals = deal.requirements
        ? deal.requirements.every((req) => hasUnlockedPermanentDeal(req))
        : true;

      return hasRequiredDeals && !hasUnlockedPermanentDeal(dealType);
    },
    [hasUnlockedPermanentDeal, gold],
  );
}

export function useGlueSymbolsIndexes() {
  return usePersistentSelectorShallow(
    (state) => state.currentRun?.gluedSymbolsIndexes,
  );
}

export function isSymbolGlued(
  currentState: PersistentGameState,
  reelIndex: number,
  symbolIndex: number,
): boolean {
  return (
    currentState.currentRun?.gluedSymbolsIndexes?.[reelIndex]?.includes(
      symbolIndex,
    ) ?? false
  );
}

export function useIsSymbolGlued() {
  const gluedSymbolsIndexes = useGlueSymbolsIndexes();

  return useCallback(
    (reelIndex: number, symbolIndex: number) => {
      return gluedSymbolsIndexes?.[reelIndex]?.includes(symbolIndex) ?? false;
    },
    [gluedSymbolsIndexes],
  );
}

export function useCurrentRunReels() {
  return usePersistentSelectorShallow((state) => state.currentRun?.reels ?? []);
}

export function useGetRandomNotGluedSymbolIndexes(): () => {
  reelIndex: number;
  symbolIndex: number;
} | null {
  const isSymbolGlued = useIsSymbolGlued();
  const areAllSymbolsGlued = usePersistentSelectorShallow(
    (currentState) =>
      currentState.currentRun?.gluedSymbolsIndexes.every(
        (gluedIndexes, reelIndex) =>
          gluedIndexes.length ===
          currentState.currentRun?.reels[reelIndex].length,
      ) ?? true,
  );
  const reels = useCurrentRunReels();

  return useCallback(() => {
    if (areAllSymbolsGlued) {
      return null;
    }

    const notGluedSymbols: { reelIndex: number; symbolIndex: number }[] = [];

    reels.forEach((reel, reelIndex) => {
      reel.forEach((_, symbolIndex) => {
        if (!isSymbolGlued(reelIndex, symbolIndex)) {
          notGluedSymbols.push({ reelIndex, symbolIndex });
        }
      });
    });

    if (notGluedSymbols.length === 0) {
      return null;
    }

    return getRandomElements(notGluedSymbols, 1)[0];
  }, [areAllSymbolsGlued, isSymbolGlued, reels]);
}

export function useCurrentPathname(): string {
  return usePersistentSelector((state) => state.currentPathname);
}
