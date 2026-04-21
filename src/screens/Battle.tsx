import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { ReelSymbol, BetCost } from "@/types/game";

import Blackout from "@/components/Blackout";
import DelayedRender from "@/components/DelayedRender";
import type { EnemyHandle } from "@/components/Enemy";
import type { KnightHandle } from "@/components/Knight";
import SlotMachine from "@/components/SlotMachine";
import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Battle";
import { useGameState } from "@/services/gameStore";
import {
  takeDamage,
  setBetCost,
  addPlayerNextActions,
  makeCharacterAttack,
  setEnemyNextActions,
  resetPlayerNextActions,
  resetEnemyNextActions,
  addGold,
  endBattle,
  healPlayer,
  healEnemy,
  addEnemyNextActions,
  setHasUsedLockedReel,
  addSymbolTooReel,
  setReelSymbol,
  glueSymbol,
} from "@/services/actions";
import { sleep } from "@/services/utils";
import {
  isEnemyDefeated,
  canEnemyAttack,
  canPlayerAttack,
  isPlayerDefeated,
  getRandomNotGluedSymbolIndexes,
} from "@/services/selector";
import { VictoryMessage } from "@/components/VictoryMessage";
import { getRandomMalusSymbol, isMalusSymbol } from "@/services/upgrades";
import { random } from "@/services/maths";

const symboleToDirectAction: Partial<
  Record<ReelSymbol, (multiplier: number) => void>
> = {
  Sword: (multiplier) =>
    addPlayerNextActions({ type: "attack", value: 1 * multiplier }),
  Shield: (multiplier) =>
    addPlayerNextActions({ type: "defend", value: 1 * multiplier }),
  Coin: addGold,
  Heart: healPlayer,
  "Evil-Heart": healEnemy,
  "Evil-Sword": (multiplier) =>
    addEnemyNextActions({ type: "attack", value: 1 * multiplier }),
  "Evil-Shield": (multiplier) =>
    addEnemyNextActions({ type: "defend", value: 1 * multiplier }),
};

type Payline = {
  name: "middle" | "top" | "bottom" | "diagonal-down" | "diagonal-up";
  symbols: ReelSymbol[];
};

type ActiveSymbolPosition = {
  reelIndex: number;
  rowIndex: number;
  celebrationLevel: "normal" | "double" | "triple";
};

export default function Battle() {
  const state = useGameState();
  const health = state.currentRun?.health ?? { value: 0, max: 10 };
  const reels = state.currentRun?.reels ?? [];
  const betCost = state.currentRun?.currentBattle?.betCost ?? 1;

  const navigate = useNavigate();

  const [startIndexes, setStartIndexes] = useState<number[]>(
    () => reels.map(() => 0) ?? [],
  );
  const [spinningReels, setSpinningReels] = useState<boolean[]>(
    () => reels.map(() => false) ?? [],
  );
  const [isSpinning, setIsSpinning] = useState(false);

  const [paylinesToActivate, setPaylinesToActivate] = useState<Payline[]>([]);
  const [activeSymbolPositions, setActiveSymbolPositions] = useState<
    ActiveSymbolPosition[]
  >([]);

  const [shouldShowLostScreen, setShouldShowLostScreen] =
    useState(isPlayerDefeated());

  const [shouldShowWinScreen, setShouldShowWinScreen] =
    useState(isEnemyDefeated());

  const [canSpin, setCanSpin] = useState(
    !shouldShowLostScreen && !shouldShowWinScreen,
  );

  const [isMiddleReelLocked, setIsMiddleReelLocked] = useState(false);

  const timeoutRefs = useRef<Array<number | null>>([]);
  const activationTimeoutRefs = useRef<Array<number | null>>([]);
  const playerCloneRef = useRef<HTMLElement | null>(null);

  const playerRef = useRef<KnightHandle>(null);
  const enemyRef = useRef<EnemyHandle>(null);

  const clearSpinTimers = () => {
    timeoutRefs.current.forEach((timerId) => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    });
    timeoutRefs.current = [];
  };

  const clearActivationTimers = () => {
    activationTimeoutRefs.current.forEach((timerId) => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    });
    activationTimeoutRefs.current = [];
  };

  const onActivate = (symbols: ReelSymbol[]) => {
    const allSame =
      symbols.length > 0 && symbols.every((s) => s === symbols[0]);
    const multiplier = allSame ? 2 : 1;

    symbols.forEach((symbol) => {
      const directAction = symboleToDirectAction[symbol];
      if (directAction) {
        directAction(multiplier);
      }
    });
  };

  const stopBattle = useCallback(() => {
    setCanSpin(false);
    clearSpinTimers();
    clearActivationTimers();
  }, []);

  const battleLost = useCallback(async () => {
    stopBattle();
    const playerDomElement = playerRef.current?.setDead();

    if (playerDomElement && !playerCloneRef.current) {
      await sleep(500);

      const rootEl = document.getElementById("root");
      const rootRect = rootEl?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const rect = playerDomElement.getBoundingClientRect();
      const clone = playerDomElement.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = `${rect.left - rootRect.left - (rootEl?.clientLeft ?? 0) + (rootEl?.scrollLeft ?? 0)}px`;
      clone.style.top = `${rect.top - rootRect.top - (rootEl?.clientTop ?? 0) + (rootEl?.scrollTop ?? 0)}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.zIndex = "15";
      clone.style.pointerEvents = "none";
      playerCloneRef.current = clone;
      rootEl?.appendChild(clone);

      setShouldShowLostScreen(true);
    }
  }, [stopBattle]);

  const battleWon = useCallback(() => {
    stopBattle();
    setShouldShowWinScreen(true);
  }, [stopBattle]);

  useEffect(() => {
    return () => {
      clearSpinTimers();
      clearActivationTimers();
      playerCloneRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (paylinesToActivate.length === 0) {
      setActiveSymbolPositions([]);
      return;
    }

    clearActivationTimers();

    const activationStepDelay = 550;
    const activationDuration = 420;

    paylinesToActivate.forEach((payline, paylineIndex) => {
      activationTimeoutRefs.current.push(
        window.setTimeout(() => {
          setActiveSymbolPositions(getActiveSymbolPositionsForPayline(payline));
          onActivate(payline.symbols);
        }, paylineIndex * activationStepDelay),
      );

      activationTimeoutRefs.current.push(
        window.setTimeout(
          () => {
            setActiveSymbolPositions([]);
          },
          paylineIndex * activationStepDelay + activationDuration,
        ),
      );
    });

    const lastActivationDelay =
      (paylinesToActivate.length - 1) * activationStepDelay +
      activationDuration;
    activationTimeoutRefs.current.push(
      window.setTimeout(async () => {
        if (isPlayerDefeated()) {
          battleLost();
          return;
        }

        if (canPlayerAttack()) {
          await playerRef.current?.attack(() => {
            enemyRef.current?.setAttacked();

            makeCharacterAttack("player");
          });
        }

        if (!isEnemyDefeated()) {
          await sleep(500);

          enemyRef.current?.setIdle();

          await sleep(250);

          if (canEnemyAttack()) {
            await enemyRef.current?.attack(() => {
              playerRef.current?.setAttacked();
              makeCharacterAttack("enemy");
            });
          }

          if (isPlayerDefeated()) {
            battleLost();
          } else {
            resetPlayerNextActions();
            setEnemyNextActions();

            switch (state.currentRun?.currentBattle?.enemy.type) {
              case "blob": {
                const randomSymbolIndexes = getRandomNotGluedSymbolIndexes();

                if (randomSymbolIndexes === null) {
                  break;
                }

                glueSymbol(
                  randomSymbolIndexes.reelIndex,
                  randomSymbolIndexes.symbolIndex,
                );

                break;
              }

              case "skeleton": {
                const middleReel = reels[1];
                const symbolIndex =
                  middleReel.length > 0
                    ? ((startIndexes[1] ?? 0) + 1) % middleReel.length
                    : 0;

                const symbol = middleReel[symbolIndex];

                if (!symbol || isMalusSymbol(symbol)) {
                  break;
                }

                // TODO: make animation
                setReelSymbol(1, symbolIndex, getRandomMalusSymbol());
                break;
              }

              case "wizard": {
                // TODO: make animation
                const malus = getRandomMalusSymbol();
                addSymbolTooReel(random(0, 2), malus);
                break;
              }

              default:
                break;
            }

            setCanSpin(true);
          }
        } else {
          resetPlayerNextActions();
          resetEnemyNextActions();
          enemyRef.current?.setDead();
          battleWon();
        }
      }, lastActivationDelay + 1000),
    );

    return () => {
      clearActivationTimers();
    };
  }, [paylinesToActivate]);

  const getDisplayedSymbolsFromFinalIndexes = (finalIndexes: number[]) => {
    return reels.map((reelSymbols, reelIndex) => {
      if (reelSymbols.length === 0) {
        return [] as ReelSymbol[];
      }

      const finalIndex = finalIndexes[reelIndex] ?? 0;

      return Array.from({ length: 3 }, (_, offset) => {
        const symbolIndex = (finalIndex + offset) % reelSymbols.length;
        return reelSymbols[symbolIndex];
      });
    });
  };

  const getPaylinesFromDisplayedSymbols = (
    displayedSymbols: ReelSymbol[][],
    cost: BetCost,
  ): Payline[] => {
    const paylines: Payline[] = [
      {
        name: "middle",
        symbols: displayedSymbols.map((reel) => reel[1] ?? "Sleep"),
      },
    ];

    if (cost >= 2) {
      paylines.push(
        {
          name: "top",
          symbols: displayedSymbols.map((reel) => reel[0] ?? "Sleep"),
        },
        {
          name: "bottom",
          symbols: displayedSymbols.map((reel) => reel[2] ?? "Sleep"),
        },
      );
    }

    if (cost >= 3) {
      paylines.push(
        {
          name: "diagonal-down",
          symbols: displayedSymbols.map((reel, reelIndex) => {
            const rowIndex = Math.min(reelIndex, 2);
            return reel[rowIndex] ?? "Sleep";
          }),
        },
        {
          name: "diagonal-up",
          symbols: displayedSymbols.map((reel, reelIndex) => {
            const rowIndex = Math.max(2 - reelIndex, 0);
            return reel[rowIndex] ?? "Sleep";
          }),
        },
      );
    }

    return paylines;
  };

  const getActiveSymbolPositionsForPayline = (
    payline: Payline,
  ): ActiveSymbolPosition[] => {
    const nonSleepSymbols = payline.symbols.filter(
      (symbol) => symbol !== "Sleep",
    );

    const occurrences = nonSleepSymbols.reduce<Record<string, number>>(
      (accumulator, symbol) => {
        accumulator[symbol] = (accumulator[symbol] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    const getCelebrationLevelForSymbol = (
      symbol: ReelSymbol,
    ): ActiveSymbolPosition["celebrationLevel"] => {
      if (symbol === "Sleep") {
        return "normal";
      }

      const count = occurrences[symbol] ?? 0;

      if (count >= 3) {
        return "triple";
      }

      if (count >= 2) {
        return "double";
      }

      return "normal";
    };

    switch (payline.name) {
      case "middle":
        return payline.symbols.map((symbol, reelIndex) => ({
          reelIndex,
          rowIndex: 1,
          celebrationLevel: getCelebrationLevelForSymbol(symbol),
        }));
      case "top":
        return payline.symbols.map((symbol, reelIndex) => ({
          reelIndex,
          rowIndex: 0,
          celebrationLevel: getCelebrationLevelForSymbol(symbol),
        }));
      case "bottom":
        return payline.symbols.map((symbol, reelIndex) => ({
          reelIndex,
          rowIndex: 2,
          celebrationLevel: getCelebrationLevelForSymbol(symbol),
        }));
      case "diagonal-down":
        return payline.symbols.map((symbol, reelIndex) => ({
          reelIndex,
          rowIndex: Math.min(reelIndex, 2),
          celebrationLevel: getCelebrationLevelForSymbol(symbol),
        }));
      case "diagonal-up":
        return payline.symbols.map((symbol, reelIndex) => ({
          reelIndex,
          rowIndex: Math.max(2 - reelIndex, 0),
          celebrationLevel: getCelebrationLevelForSymbol(symbol),
        }));
    }
  };

  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    setCanSpin(false);
    takeDamage(betCost);

    if (health.value <= betCost) {
      battleLost();
      return;
    }

    clearSpinTimers();
    clearActivationTimers();
    setPaylinesToActivate([]);
    setActiveSymbolPositions([]);

    const finalIndexes = reels.map((reelSymbols, reelIndex) => {
      if (reelSymbols.length === 0) {
        return 0;
      }
      if (reelIndex === 1 && isMiddleReelLocked) {
        return startIndexes[1] ?? 0;
      }
      return Math.floor(Math.random() * reelSymbols.length);
    });

    const activeReelCount = reels.filter(
      (reelSymbols) => reelSymbols.length > 0,
    ).length;

    if (activeReelCount === 0) {
      return;
    }

    let stoppedReels = 0;

    setIsSpinning(true);
    setSpinningReels(
      reels.map(
        (reelSymbols, reelIndex) =>
          reelSymbols.length > 0 && !(reelIndex === 1 && isMiddleReelLocked),
      ),
    );

    reels.forEach((reelSymbols, reelIndex) => {
      if (reelSymbols.length === 0) {
        return;
      }

      const stopDelay = 900 + reelIndex * 600;

      timeoutRefs.current[reelIndex] = window.setTimeout(() => {
        setStartIndexes((previous) => {
          const nextIndexes = [...previous];
          nextIndexes[reelIndex] = finalIndexes[reelIndex];
          return nextIndexes;
        });

        setSpinningReels((previous) => {
          const nextState = [...previous];
          nextState[reelIndex] = false;
          return nextState;
        });

        stoppedReels += 1;

        if (stoppedReels >= activeReelCount) {
          window.setTimeout(() => {
            setIsSpinning(false);
            if (isMiddleReelLocked) {
              setHasUsedLockedReel();
              setIsMiddleReelLocked(false);
            }
            const displayedSymbols =
              getDisplayedSymbolsFromFinalIndexes(finalIndexes);
            const paylines = getPaylinesFromDisplayedSymbols(
              displayedSymbols,
              betCost,
            );
            setPaylinesToActivate(paylines);
          }, 750);
        }
      }, stopDelay);
    });
  };

  const onHeal = async () => {
    await playerRef.current?.setHealing();
    navigate("/bonus-upgrade");
    endBattle();
  };

  if (!state.currentRun?.currentBattle) {
    return null;
  }

  return (
    <>
      <Screen>
        <Scene
          levelIndex={state.currentRun.levelIndex}
          player={{
            health,
            playerNextActions:
              state.currentRun.currentBattle.playerNextActions || [],
          }}
          enemy={state.currentRun.currentBattle.enemy!}
          playerRef={playerRef}
          enemyRef={enemyRef}
          gold={state.gold}
        />
        <hr className="ui-separator" />
        <div className={shouldShowWinScreen ? "slot-machine-panel-fallen" : ""}>
          <SlotMachine
            symbols={reels}
            startIndexes={startIndexes}
            spinningReels={spinningReels}
            betCost={betCost}
            activeSymbolPositions={activeSymbolPositions}
            isMiddleReelLocked={isMiddleReelLocked}
            hasUsedLockedReel={state.currentRun.currentBattle.hasUsedLockedReel}
            onToggleMiddleReelLock={() => {
              setIsMiddleReelLocked((prev) => !prev);
            }}
            onSpin={handleSpin}
            onBetCostChange={setBetCost}
            isInteractive={canSpin}
          />
        </div>

        {shouldShowWinScreen && (
          <DelayedRender delay={1000}>
            <VictoryMessage onHeal={onHeal} onDevilDeal={endBattle} />
          </DelayedRender>
        )}
      </Screen>
      {shouldShowLostScreen && (
        <Blackout>
          <h2 className="fade-in">Defeat...</h2>

          <Link
            className="fade-in"
            onClick={endBattle}
            style={{ "--animation-delay": "2s" } as React.CSSProperties}
            to="/"
          >
            Try again
          </Link>
        </Blackout>
      )}
    </>
  );
}
