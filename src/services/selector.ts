import { getGameState } from "@/services/gameStore";

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
