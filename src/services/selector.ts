import { getGameState } from "@/services/gameStore";
import type { DevilDealType } from "@/types/game";
import { PERMANENT_DEVIL_DEALS } from "@/constants/devilDeals";

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
    return true;
  }

  const hasRequiredDeals = deal.requirements
    ? deal.requirements.every(hasUnlockedPermanentDeal)
    : true;

  return hasRequiredDeals && !hasUnlockedPermanentDeal(dealType);
}
