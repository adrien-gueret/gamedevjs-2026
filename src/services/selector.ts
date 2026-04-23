import { getGameState } from "@/services/gameStore";
import type { DevilDealType } from "@/types/game";
import { PERMANENT_DEVIL_DEALS } from "@/constants/devilDeals";
import { getRandomElements } from "./utils";

export function canPlayerAttack(): boolean {
  const currentState = getGameState();
  const attackAction =
    currentState.currentRun?.currentBattle?.playerNextActions.find(
      (action) => action.type === "attack",
    );
  const attackValue = attackAction?.value ?? 0;

  return attackValue > 0;
}

export function canEnemyAttack(): boolean {
  const currentState = getGameState();
  const attackAction =
    currentState.currentRun?.currentBattle?.enemy.nextActions.find(
      (action) => action.type === "attack",
    );
  const attackValue = attackAction?.value ?? 0;

  return attackValue > 0;
}

export function isEnemyDefeated(): boolean {
  const currentState = getGameState();
  const enemyHealth =
    currentState.currentRun?.currentBattle?.enemy.health.value ?? 0;
  return enemyHealth <= 0;
}

export function isPlayerDefeated(): boolean {
  const currentState = getGameState();
  const playerHealth = currentState.currentRun?.health.value ?? 0;
  return playerHealth <= 0;
}

export function hasUnlockedPermanentDeal(dealType: DevilDealType): boolean {
  const currentState = getGameState();
  return currentState.unlockedPermanentDeals.includes(dealType);
}

export function canDevilDealBeInShop(dealType: DevilDealType): boolean {
  const deal = PERMANENT_DEVIL_DEALS.find((deal) => deal.type === dealType);

  if (!deal) {
    const currentState = getGameState();
    return dealType === "passiveWantedToDie" ? currentState.gold > 1 : true;
  }

  const hasRequiredDeals = deal.requirements
    ? deal.requirements.every(hasUnlockedPermanentDeal)
    : true;

  return hasRequiredDeals && !hasUnlockedPermanentDeal(dealType);
}

export function isSymbolGlued(reelIndex: number, symbolIndex: number): boolean {
  const currentState = getGameState();

  return (
    currentState.currentRun?.gluedSymbolsIndexes[reelIndex].includes(
      symbolIndex,
    ) ?? false
  );
}

export function areAllSymbolsGlued(): boolean {
  const currentState = getGameState();

  return (
    currentState.currentRun?.gluedSymbolsIndexes.every(
      (gluedIndexes, reelIndex) =>
        gluedIndexes.length ===
        currentState.currentRun?.reels[reelIndex].length,
    ) ?? true
  );
}

export function getRandomNotGluedSymbolIndexes(): {
  reelIndex: number;
  symbolIndex: number;
} | null {
  if (areAllSymbolsGlued()) {
    return null;
  }

  const currentState = getGameState();

  const notGluedSymbols: { reelIndex: number; symbolIndex: number }[] = [];

  currentState.currentRun!.reels.forEach((reel, reelIndex) => {
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
}

export function getCurrentPathname(): string {
  const currentState = getGameState();
  return currentState.currentPathname;
}
