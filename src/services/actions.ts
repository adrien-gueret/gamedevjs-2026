import type {
  BetCost,
  Run,
  PersistentGameState,
  NextAction,
  ReelSymbol,
  PassiveEffectType,
  DevilDealType,
} from "@/types/game";

import { getNewBattleEnemy, getEnemyNextActions } from "./enemies";

import { isSymbolGlued } from "./selector";

function getPassiveEffectNextActions(state: PersistentGameState): NextAction[] {
  const passiveEffects = state.currentRun?.passiveEffects ?? [];

  const attackCount = passiveEffects.filter(
    (effect) => effect === "attack",
  ).length;
  const defendCount = passiveEffects.filter(
    (effect) => effect === "defend",
  ).length;

  const nextActions: NextAction[] = [];

  if (attackCount > 0) {
    nextActions.push({ type: "attack", value: attackCount });
  }

  if (defendCount > 0) {
    nextActions.push({ type: "defend", value: defendCount });
  }

  return nextActions;
}

export function startRun(
  state: PersistentGameState,
  baseRun: Run,
): PersistentGameState {
  return {
    ...state,
    currentRun: structuredClone(baseRun),
  };
}

export function endRun(state: PersistentGameState): PersistentGameState {
  return {
    ...state,
    currentRun: null,
  };
}

export function setCurrentPathname(
  state: PersistentGameState,
  pathname: string,
): PersistentGameState {
  return {
    ...state,
    currentPathname: pathname,
  };
}

export function setReelSymbol(
  state: PersistentGameState,
  reelIndex: number,
  symbolIndex: number,
  newSymbol: ReelSymbol,
): PersistentGameState {
  let next = state;
  if (isSymbolGlued(next, reelIndex, symbolIndex)) {
    next = unglueSymbol(next, reelIndex, symbolIndex);
  }

  if (!next.currentRun) return next;
  const newReels = next.currentRun.reels.map((reel, i) => {
    if (i !== reelIndex) return reel;
    const copy = [...reel];
    copy[symbolIndex] = newSymbol;
    return copy;
  });
  return {
    ...next,
    currentRun: { ...next.currentRun, reels: newReels },
  };
}

export function removeReelSymbol(
  state: PersistentGameState,
  reelIndex: number,
  symbolIndex: number,
): PersistentGameState {
  let next = state;
  if (isSymbolGlued(next, reelIndex, symbolIndex)) {
    next = unglueSymbol(next, reelIndex, symbolIndex);
  }

  if (!next.currentRun) return next;
  const newReels = next.currentRun.reels.map((reel, i) =>
    i === reelIndex ? reel.filter((_, j) => j !== symbolIndex) : reel,
  );
  return {
    ...next,
    currentRun: { ...next.currentRun, reels: newReels },
  };
}

export function addSymbolTooReel(
  state: PersistentGameState,
  reelIndex: number,
  newSymbol: ReelSymbol,
): PersistentGameState {
  if (!state.currentRun) return state;
  const newReels = state.currentRun.reels.map((reel, i) =>
    i === reelIndex ? [...reel, newSymbol] : reel,
  );
  return {
    ...state,
    currentRun: { ...state.currentRun, reels: newReels },
  };
}

export function glueSymbol(
  state: PersistentGameState,
  reelIndex: number,
  symbolIndex: number,
): PersistentGameState {
  if (!state.currentRun) return state;
  const newGlued = state.currentRun.gluedSymbolsIndexes.map((indexes, i) =>
    i === reelIndex ? [...indexes, symbolIndex] : indexes,
  );
  return {
    ...state,
    currentRun: { ...state.currentRun, gluedSymbolsIndexes: newGlued },
  };
}

export function unglueSymbol(
  state: PersistentGameState,
  reelIndex: number,
  symbolIndex: number,
): PersistentGameState {
  if (!state.currentRun) return state;
  const newGlued = state.currentRun.gluedSymbolsIndexes.map((indexes, i) =>
    i === reelIndex
      ? indexes.filter((index) => index !== symbolIndex)
      : indexes,
  );
  return {
    ...state,
    currentRun: { ...state.currentRun, gluedSymbolsIndexes: newGlued },
  };
}

export function addPassiveEffect(
  state: PersistentGameState,
  effect: PassiveEffectType,
): PersistentGameState {
  if (!state.currentRun) return state;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      passiveEffects: [...state.currentRun.passiveEffects, effect],
    },
  };
}

export function addPermanentBonus(
  state: PersistentGameState,
  effect: DevilDealType,
): PersistentGameState {
  if (window.Wavedash) {
    (async () => {
      const Wavedash = await window.Wavedash!;

      Wavedash.setAchievement(effect);
      Wavedash.storeStats();
    })();
  }

  if (!state.currentRun) return state;

  const addHealth = ["moreHealth1", "moreHealth2", "moreHealth3"].includes(
    effect,
  );

  return {
    ...state,
    unlockedPermanentDeals: [...state.unlockedPermanentDeals, effect],
    currentRun: {
      ...state.currentRun,
      health: addHealth
        ? {
            value: state.currentRun.health.value + 10,
            max: state.currentRun.health.max + 10,
          }
        : state.currentRun.health,
    },
  };
}

// ---------------------------------------------------------------------------
// Run - Player health
// ---------------------------------------------------------------------------

export function takeDamage(
  state: PersistentGameState,
  amount: number,
): PersistentGameState {
  if (!state.currentRun) return state;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      health: {
        ...state.currentRun.health,
        value: Math.max(0, state.currentRun.health.value - amount),
      },
    },
  };
}

export function healPlayer(
  state: PersistentGameState,
  amount: number,
): PersistentGameState {
  if (!state.currentRun) return state;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      health: {
        ...state.currentRun.health,
        value: Math.min(
          state.currentRun.health.max,
          state.currentRun.health.value + amount,
        ),
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Run - Gold
// ---------------------------------------------------------------------------

export function addGold(
  state: PersistentGameState,
  amount: number = 1,
): PersistentGameState {
  if (!state.currentRun) return state;
  return {
    ...state,
    gold: state.gold + amount,
  };
}

export function spendGold(
  state: PersistentGameState,
  amount: number,
): PersistentGameState {
  if (!state.currentRun) {
    return state;
  }
  return {
    ...state,
    gold: state.gold - amount,
  };
}

export function spendMaxHealth(
  state: PersistentGameState,
  amount: number,
): PersistentGameState {
  if (!state.currentRun) {
    return state;
  }
  const newMax = state.currentRun.health.max - amount;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      health: {
        max: newMax,
        value: Math.min(state.currentRun.health.value, newMax),
      },
    },
  };
}

export function killPlayer(state: PersistentGameState) {
  if (!state.currentRun) {
    return state;
  }
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      health: { ...state.currentRun.health, value: 0 },
    },
  };
}

// ---------------------------------------------------------------------------
// Run - Battle
// ---------------------------------------------------------------------------

export function startNewBattle(
  state: PersistentGameState,
): PersistentGameState {
  if (!state.currentRun) return state;
  const next: PersistentGameState = {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        betCost: state.unlockedPermanentDeals.includes("betterBet2")
          ? 3
          : state.unlockedPermanentDeals.includes("betterBet1")
            ? 2
            : 1,
        enemy: {
          ...getNewBattleEnemy(state.currentRun.levelIndex),
          nextActions: [],
        },
        playerNextActions: getPassiveEffectNextActions(state),
        hasUsedLockedReel: false,
      },
    },
  };
  return setEnemyNextActions(next);
}

export function endBattle(
  state: PersistentGameState,
  hasWon: boolean,
): PersistentGameState {
  if (!state.currentRun) return state;

  const hasAskedToDie = state.currentRun.passiveEffects.includes("wantedToDie");

  return {
    ...state,
    gold: hasWon || hasAskedToDie ? state.gold : Math.ceil(state.gold / 2),
    currentRun: {
      ...state.currentRun,
      currentBattle: null,
      levelIndex: hasWon
        ? state.currentRun.levelIndex + 1
        : state.currentRun.levelIndex,
    },
  };
}

export function setBetCost(
  state: PersistentGameState,
  betCost: BetCost,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: { ...state.currentRun.currentBattle, betCost },
    },
  };
}

export function setHasUsedLockedReel(
  state: PersistentGameState,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        ...state.currentRun.currentBattle,
        hasUsedLockedReel: true,
      },
    },
  };
}

export function addPlayerNextActions(
  state: PersistentGameState,
  nextAction: NextAction,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  const battle = state.currentRun.currentBattle;
  const existing = battle.playerNextActions.find(
    (action) => action.type === nextAction.type,
  );

  const newPlayerNextActions = existing
    ? battle.playerNextActions.map((action) =>
        action.type === nextAction.type && action.value !== undefined
          ? { ...action, value: action.value + (nextAction.value ?? 0) }
          : action,
      )
    : [...battle.playerNextActions, nextAction];

  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        ...battle,
        playerNextActions: newPlayerNextActions,
      },
    },
  };
}

export function resetPlayerNextActions(
  state: PersistentGameState,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        ...state.currentRun.currentBattle,
        playerNextActions: getPassiveEffectNextActions(state),
      },
    },
  };
}

export function resetEnemyNextActions(
  state: PersistentGameState,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        ...state.currentRun.currentBattle,
        enemy: { ...state.currentRun.currentBattle.enemy, nextActions: [] },
      },
    },
  };
}

export function makeCharacterAttack(
  state: PersistentGameState,
  attacker: "player" | "enemy",
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  const battle = state.currentRun.currentBattle;

  const attackerNextActions =
    attacker === "player" ? battle.playerNextActions : battle.enemy.nextActions;

  const attackAction = attackerNextActions.find(
    (action) => action.type === "attack",
  );
  const attackValue = attackAction?.value ?? 0;

  if (!attackValue) {
    return state;
  }

  const defenderNextActions =
    attacker === "player" ? battle.enemy.nextActions : battle.playerNextActions;

  const defenseValue = defenderNextActions
    .filter((action) => action.type === "defend")
    .reduce((total, action) => total + (action.value ?? 0), 0);

  const newAttackerNextActions = attackerNextActions.filter(
    (action) => action.type !== "attack",
  );

  const removeDefenseFromDefender = () =>
    defenderNextActions.filter((action) => action.type !== "defend");

  let newPlayerNextActions: NextAction[];
  let newEnemyNextActions: NextAction[];
  let newPlayerHealth = state.currentRun.health;
  let newEnemyHealth = battle.enemy.health;

  if (attacker === "player") {
    newPlayerNextActions = newAttackerNextActions;
    newEnemyNextActions = battle.enemy.nextActions;
  } else {
    newPlayerNextActions = battle.playerNextActions;
    newEnemyNextActions = newAttackerNextActions;
  }

  if (attackValue > defenseValue) {
    if (attacker === "player") {
      newEnemyNextActions = removeDefenseFromDefender();
    } else {
      newPlayerNextActions = removeDefenseFromDefender();
    }
    const damage = Math.max(0, attackValue - defenseValue);

    if (attacker === "player") {
      newEnemyHealth = {
        ...battle.enemy.health,
        value: Math.max(0, battle.enemy.health.value - damage),
      };
    } else {
      newPlayerHealth = {
        ...state.currentRun.health,
        value: Math.max(0, state.currentRun.health.value - damage),
      };
    }
  } else if (attackValue === defenseValue) {
    if (attacker === "player") {
      newEnemyNextActions = removeDefenseFromDefender();
    } else {
      newPlayerNextActions = removeDefenseFromDefender();
    }
  } else {
    const reduceDefense = (action: NextAction) => {
      if (action.type === "defend") {
        return {
          ...action,
          value: Math.max(0, (action.value ?? 0) - attackValue),
        };
      }
      return action;
    };

    if (attacker === "player") {
      newEnemyNextActions = battle.enemy.nextActions.map(reduceDefense);
    } else {
      newPlayerNextActions = battle.playerNextActions.map(reduceDefense);
    }
  }

  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      health: newPlayerHealth,
      currentBattle: {
        ...battle,
        playerNextActions: newPlayerNextActions,
        enemy: {
          ...battle.enemy,
          health: newEnemyHealth,
          nextActions: newEnemyNextActions,
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Run - Battle Enemy
// ---------------------------------------------------------------------------

export function healEnemy(
  state: PersistentGameState,
  amount: number,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  const enemyHealth = state.currentRun.currentBattle.enemy.health;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        ...state.currentRun.currentBattle,
        enemy: {
          ...state.currentRun.currentBattle.enemy,
          health: {
            ...enemyHealth,
            value: Math.min(enemyHealth.max, enemyHealth.value + amount),
          },
        },
      },
    },
  };
}

export function setEnemyNextActions(
  state: PersistentGameState,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  const enemy = state.currentRun.currentBattle.enemy;
  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        ...state.currentRun.currentBattle,
        enemy: {
          ...enemy,
          nextActions: getEnemyNextActions(enemy, state.currentRun.levelIndex),
        },
      },
    },
  };
}

export function addEnemyNextActions(
  state: PersistentGameState,
  nextAction: NextAction,
): PersistentGameState {
  if (!state.currentRun?.currentBattle) return state;
  const enemy = state.currentRun.currentBattle.enemy;
  const existing = enemy.nextActions.find(
    (action) => action.type === nextAction.type,
  );

  const newNextActions = existing
    ? enemy.nextActions.map((action) =>
        action.type === nextAction.type && action.value !== undefined
          ? { ...action, value: action.value + (nextAction.value ?? 0) }
          : action,
      )
    : [...enemy.nextActions, nextAction];

  return {
    ...state,
    currentRun: {
      ...state.currentRun,
      currentBattle: {
        ...state.currentRun.currentBattle,
        enemy: { ...enemy, nextActions: newNextActions },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Run - Random choices
// ---------------------------------------------------------------------------

export function setRandomChoices(
  state: PersistentGameState,
  randomChoices: any[] = [],
): PersistentGameState {
  return {
    ...state,
    currentRun: state.currentRun
      ? { ...state.currentRun, randomChoices }
      : null,
  };
}
