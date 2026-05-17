import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeaderboard, useSounds, useMusic } from "wavedash-react";

import type { ReelSymbol, BetCost } from "@/types/game";

import Blackout from "@/components/Blackout";
import DelayedRender from "@/components/DelayedRender";
import type { EnemyHandle } from "@/components/Enemy";
import type { PlayerHandle } from "@/components/Player";
import SlotMachine from "@/components/SlotMachine";
import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Battle";
import { sleep } from "@/services/utils";
import {
  useIsEnemyDefeated,
  useCanEnemyAttack,
  useCanPlayerAttack,
  useIsPlayerDefeated,
  useGetRandomNotGluedSymbolIndexes,
  useIsSymbolGlued,
  useHealth,
  useCurrentRunReels,
  useGold,
} from "@/services/selector";
import {
  usePersistentActions,
  usePersistentSelector,
  usePersistentSelectorShallow,
} from "@/services/state";
import { VictoryMessage } from "@/components/VictoryMessage";
import { getRandomMalusSymbol, isMalusSymbol } from "@/services/upgrades";
import { random } from "@/services/maths";
import GoldCounter from "@/components/GoldCounter";
import Button from "@/components/Button";

const ACTIVATION_DURATION = 420;
const MIN_SPIN_SPEED_MULTIPLIER = 0.55;
const SPIN_SPEED_DECAY_LEVELS = 8;

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
  const {
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
    unglueSymbol,
  } = usePersistentActions();

  const symboleToDirectAction: Partial<
    Record<
      ReelSymbol,
      (multiplier: number, reelIndex: number, symbolIndex: number) => void
    >
  > = {
    Sword: (multiplier) =>
      addPlayerNextActions({ type: "attack", value: 1 * multiplier }),
    "Super-Sword": (multiplier) =>
      addPlayerNextActions({ type: "attack", value: 2 * multiplier }),
    Shield: (multiplier) =>
      addPlayerNextActions({ type: "defend", value: 1 * multiplier }),
    "Super-Shield": (multiplier) =>
      addPlayerNextActions({ type: "defend", value: 2 * multiplier }),
    Coin: addGold,
    "Super-Coin": (multiplier) => addGold(2 * multiplier),
    Heart: healPlayer,
    "Super-Heart": (multiplier) => healPlayer(2 * multiplier),
    "Evil-Heart": healEnemy,
    "Evil-Sword": (multiplier) =>
      addEnemyNextActions({ type: "attack", value: 1 * multiplier }),
    "Evil-Shield": (multiplier) =>
      addEnemyNextActions({ type: "defend", value: 1 * multiplier }),
  };

  const health = useHealth();
  const reels = useCurrentRunReels();
  const betCost = usePersistentSelector(
    (state) => state.currentRun?.currentBattle?.betCost ?? 1,
  );

  const { playSound, stopSound } = useSounds();
  const { playMusic } = useMusic();

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

  const isPlayerDefeated = useIsPlayerDefeated();

  const levelIndex = usePersistentSelector(
    (state) => state.currentRun?.levelIndex ?? 0,
  );

  const [shouldShowLostScreen, setShouldShowLostScreen] =
    useState(isPlayerDefeated);

  const wavedashLeaderboard = useLeaderboard("fights-count", {
    sortOrder: 1,
    displayType: 0,
  });
  const [wavedashRank, setWavedashRank] = useState<number | null>(null);

  const levelRenderedIndex = levelIndex + 1;
  const spinSpeedMultiplier =
    MIN_SPIN_SPEED_MULTIPLIER +
    (1 - MIN_SPIN_SPEED_MULTIPLIER) *
      Math.exp(-(levelRenderedIndex - 1) / SPIN_SPEED_DECAY_LEVELS);

  useEffect(() => {
    if (!shouldShowLostScreen || !wavedashLeaderboard.leaderboard) {
      return;
    }

    wavedashLeaderboard
      .submitScore(levelRenderedIndex, true)
      .then((response) => {
        if (response) {
          setWavedashRank(response.globalRank);
        }
      });
  }, [shouldShowLostScreen, wavedashLeaderboard, levelRenderedIndex]);

  const isEnemyDefeated = useIsEnemyDefeated();
  const [shouldShowWinScreen, setShouldShowWinScreen] =
    useState(isEnemyDefeated);

  const [canSpin, setCanSpin] = useState(
    !shouldShowLostScreen && !shouldShowWinScreen,
  );

  useEffect(() => {
    if (shouldShowLostScreen) {
      playMusic("gameover");
    }
  }, [shouldShowLostScreen, playMusic]);

  const [isMiddleReelLocked, setIsMiddleReelLocked] = useState(false);

  const timeoutRefs = useRef<Array<number | null>>([]);
  const activationTimeoutRefs = useRef<Array<number | null>>([]);
  const DEFEAT_QUOTES = [
    "Oh, you die. That's unfortunate.",
    "You lost. Truly, a surprise to no one.",
    "Well, that happened. Try not to do it again.",
    "Death. A classic outcome, really.",
    "You had potential. Emphasis on 'had'.",
  ];
  const defeatQuoteRef = useRef(
    DEFEAT_QUOTES[random(0, DEFEAT_QUOTES.length - 1)],
  );

  const playerCloneRef = useRef<HTMLElement | null>(null);

  const playerRef = useRef<PlayerHandle>(null);
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

  const onActivate = (
    symbols: ReelSymbol[],
    positions: ActiveSymbolPosition[],
  ) => {
    const hasActiveNonSleepSymbols = symbols.some(
      (symbol) => symbol !== "Sleep",
    );
    const hasActiveMalusSymbols = symbols.some(
      (symbol) => symbol !== "Sleep" && isMalusSymbol(symbol),
    );

    if (hasActiveNonSleepSymbols) {
      playSound(hasActiveMalusSymbols ? "activeCursedSymbol" : "activeSymbol");
    }

    const allSame =
      symbols.length > 0 && symbols.every((s) => s === symbols[0]);
    const multiplier = allSame ? 2 : 1;

    symbols.forEach((symbol, i) => {
      const pos = positions[i];
      if (!pos) return;
      const reel = reels[pos.reelIndex];
      const symbolIndex = reel
        ? ((startIndexes[pos.reelIndex] ?? 0) + pos.rowIndex) % reel.length
        : 0;

      if (symbol === "Glued") {
        // Delay unglue until after the animation, so the real symbol
        // is revealed without animating.
        window.setTimeout(() => {
          unglueSymbol(pos.reelIndex, symbolIndex);
        }, ACTIVATION_DURATION + 50);
        return;
      }

      const directAction = symboleToDirectAction[symbol];
      if (directAction) {
        directAction(multiplier, pos.reelIndex, symbolIndex);
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

  const hasRunAutoLoose = useRef(false);
  useEffect(() => {
    if (isPlayerDefeated && !hasRunAutoLoose.current) {
      hasRunAutoLoose.current = true;
      battleLost();
    }
  }, [isPlayerDefeated, battleLost]);

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

  const canPlayerAttack = useCanPlayerAttack();
  const canEnemyAttack = useCanEnemyAttack();
  const getRandomNotGluedSymbolIndexes = useGetRandomNotGluedSymbolIndexes();
  const enemyType = usePersistentSelector(
    (state) => state.currentRun?.currentBattle?.enemy.type,
  );

  const canPlayerAttackRef = useRef(canPlayerAttack);
  const canEnemyAttackRef = useRef(canEnemyAttack);
  const isEnemyDefeatedRef = useRef(isEnemyDefeated);
  const isPlayerDefeatedRef = useRef(isPlayerDefeated);
  const getRandomNotGluedSymbolIndexesRef = useRef(
    getRandomNotGluedSymbolIndexes,
  );
  const enemyTypeRef = useRef(enemyType);
  canPlayerAttackRef.current = canPlayerAttack;
  canEnemyAttackRef.current = canEnemyAttack;
  isEnemyDefeatedRef.current = isEnemyDefeated;
  isPlayerDefeatedRef.current = isPlayerDefeated;
  getRandomNotGluedSymbolIndexesRef.current = getRandomNotGluedSymbolIndexes;
  enemyTypeRef.current = enemyType;

  useEffect(() => {
    if (paylinesToActivate.length === 0) {
      setActiveSymbolPositions([]);
      return;
    }

    clearActivationTimers();

    const activationStepDelay = 550;

    paylinesToActivate.forEach((payline, paylineIndex) => {
      activationTimeoutRefs.current.push(
        window.setTimeout(() => {
          const positions = getActiveSymbolPositionsForPayline(payline);
          setActiveSymbolPositions(positions);
          onActivate(payline.symbols, positions);
        }, paylineIndex * activationStepDelay),
      );

      activationTimeoutRefs.current.push(
        window.setTimeout(
          () => {
            setActiveSymbolPositions([]);
          },
          paylineIndex * activationStepDelay + ACTIVATION_DURATION,
        ),
      );
    });

    const lastActivationDelay =
      (paylinesToActivate.length - 1) * activationStepDelay +
      ACTIVATION_DURATION;
    activationTimeoutRefs.current.push(
      window.setTimeout(async () => {
        if (isPlayerDefeatedRef.current) {
          battleLost();
          return;
        }

        if (canPlayerAttackRef.current) {
          await playerRef.current?.attack(() => {
            enemyRef.current?.setAttacked();
            playSound("hit");
            makeCharacterAttack("player");
          });
        }

        if (!isEnemyDefeatedRef.current) {
          await sleep(500);

          enemyRef.current?.setIdle();

          await sleep(250);

          if (canEnemyAttackRef.current) {
            await enemyRef.current?.attack(() => {
              playerRef.current?.setAttacked();
              playSound("hit");
              makeCharacterAttack("enemy");
            });
          }

          if (isPlayerDefeatedRef.current) {
            battleLost();
          } else {
            resetPlayerNextActions();
            setEnemyNextActions();

            switch (enemyTypeRef.current) {
              case "blob": {
                const randomSymbolIndexes =
                  getRandomNotGluedSymbolIndexesRef.current();

                if (randomSymbolIndexes === null) {
                  break;
                }

                enemyRef.current?.setSpecialAttack();
                await sleep(2000);
                enemyRef.current?.setIdle();

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

                if (!symbol || symbol === "Evil-Heart") {
                  break;
                }

                enemyRef.current?.setSpecialAttack();
                await sleep(2000);
                enemyRef.current?.setIdle();

                playSound("curseSymbol");
                setReelSymbol(1, symbolIndex, "Evil-Heart");
                break;
              }

              case "wizard": {
                enemyRef.current?.setSpecialAttack();
                await sleep(2000);
                enemyRef.current?.setIdle();
                const malus = getRandomMalusSymbol();
                playSound("curseSymbol");
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

  const isSymbolGlued = useIsSymbolGlued();

  const getDisplayedSymbolsFromFinalIndexes = (finalIndexes: number[]) => {
    return reels.map((reelSymbols, reelIndex) => {
      if (reelSymbols.length === 0) {
        return [] as ReelSymbol[];
      }

      const finalIndex = finalIndexes[reelIndex] ?? 0;

      return Array.from({ length: 3 }, (_, offset) => {
        const symbolIndex = (finalIndex + offset) % reelSymbols.length;
        return isSymbolGlued(reelIndex, symbolIndex)
          ? "Glued"
          : reelSymbols[symbolIndex];
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

    playSound("startSpin");

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
      return random(0, reelSymbols.length - 1);
    });

    const activeReelCount = reels.filter(
      (reelSymbols) => reelSymbols.length > 0,
    ).length;

    if (activeReelCount === 0) {
      return;
    }

    let stoppedReels = 0;

    setIsSpinning(true);
    playSound("spin");
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

        playSound("stopSpin");

        stoppedReels += 1;

        if (stoppedReels >= activeReelCount) {
          window.setTimeout(() => {
            setIsSpinning(false);
            stopSound("spin");

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
    endBattle(true);
  };

  const currentBattle = usePersistentSelectorShallow(
    (state) => state.currentRun?.currentBattle,
  );
  const passiveEffects = usePersistentSelectorShallow(
    (state) => state.currentRun?.passiveEffects ?? [],
  );
  const gold = useGold();
  const currentRunType = usePersistentSelector(
    (state) => state.currentRun?.type,
  );

  if (!currentBattle) {
    return null;
  }

  const hasAskedToDie = passiveEffects.includes("wantedToDie") ?? false;

  return (
    <>
      <Screen>
        <Scene
          levelIndex={levelIndex}
          player={{
            health,
            playerNextActions: currentBattle.playerNextActions || [],
            type: currentRunType!,
          }}
          enemy={currentBattle.enemy!}
          playerRef={playerRef}
          enemyRef={enemyRef}
          gold={gold}
        />
        <hr className="ui-separator" />
        <div
          className={shouldShowWinScreen ? "slot-machine-panel-fallen" : ""}
          onAnimationEnd={(e) => {
            if (e.animationName === "fall")
              e.currentTarget.style.display = "none";
          }}
        >
          <SlotMachine
            symbols={reels}
            startIndexes={startIndexes}
            spinningReels={spinningReels}
            betCost={betCost}
            activeSymbolPositions={activeSymbolPositions}
            spinSpeedMultiplier={spinSpeedMultiplier}
            isMiddleReelLocked={isMiddleReelLocked}
            hasUsedLockedReel={currentBattle.hasUsedLockedReel}
            onToggleMiddleReelLock={() => {
              playSound("lock");
              setIsMiddleReelLocked((prev) => !prev);
            }}
            onSpin={handleSpin}
            onBetCostChange={(newBetCost) => {
              playSound("click");
              setBetCost(newBetCost);
            }}
            isInteractive={canSpin}
          />
        </div>

        {shouldShowWinScreen && (
          <DelayedRender delay={1000}>
            <VictoryMessage
              onHeal={onHeal}
              onDevilDeal={() => endBattle(true)}
            />
          </DelayedRender>
        )}
      </Screen>
      {shouldShowLostScreen && (
        <Blackout>
          <h2 className="fade-in">
            Defeat...
            <br />
            <span>On fight n°{levelRenderedIndex}</span>
            {wavedashRank !== null && (
              <span>
                {" "}
                - Your Rank: <b style={{ color: "cyan" }}>{wavedashRank}</b>
              </span>
            )}
          </h2>

          <p
            className="fade-in"
            style={{ "--animation-delay": "2.5s" } as React.CSSProperties}
          >
            "{defeatQuoteRef.current}"
          </p>

          <hr
            className="ui-separator fade-in"
            style={
              {
                marginBottom: "24px",
                "--animation-delay": "2.5s",
              } as React.CSSProperties
            }
          />

          <p
            className="fade-in"
            style={{ "--animation-delay": "4s" } as React.CSSProperties}
          >
            "Don't worry, I'll resurrect you soon.{" "}
            {gold > 0
              ? `You can even keep your gold!${hasAskedToDie ? "" : " Just give me half."}`
              : null}
            "
          </p>

          {gold > 0 && (
            <div
              className="game-over-gold-container fade-in"
              style={{ "--animation-delay": "4s" } as React.CSSProperties}
            >
              <GoldCounter value={gold} />
              {!hasAskedToDie && (
                <>
                  <img src="./images/right-arrow.png" alt="" />
                  <GoldCounter value={Math.ceil(gold / 2)} />
                </>
              )}
            </div>
          )}

          <div
            className="fade-in"
            style={{ "--animation-delay": "4.5s" } as React.CSSProperties}
          >
            <Button
              imageName="resurrect"
              as="link"
              onClick={() => {
                playerCloneRef.current?.remove();
                playerCloneRef.current = null;
                endBattle(false);
              }}
              to="/"
            >
              Resurrect
            </Button>
          </div>
        </Blackout>
      )}
    </>
  );
}
