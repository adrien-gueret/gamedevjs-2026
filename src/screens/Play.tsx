import { useEffect, useRef, useState } from "react";

import type { ReelSymbol } from "@/types/game";
import SlotMachine from "@/components/SlotMachine";

const SYMBOLS: ReelSymbol[][] = [
  [
    "Shield",
    "Sword",
    "Sword",
    "Shield",
    "Sword",
    "Shield",
    "Sword",
    "Shield",
    "Sword",
    "Coin",
  ],
  [
    "Sword",
    "Coin",
    "Empty",
    "Shield",
    "Shield",
    "Empty",
    "Sword",
    "Empty",
    "Empty",
    "Sword",
  ],
  [
    "Empty",
    "Shield",
    "Empty",
    "Empty",
    "Sword",
    "Empty",
    "Empty",
    "Sword",
    "Empty",
    "Shield",
  ],
];

type BetCost = 1 | 2 | 3;

type Payline = {
  name: "middle" | "top" | "bottom" | "diagonal-down" | "diagonal-up";
  symbols: ReelSymbol[];
};

type ActiveSymbolPosition = {
  reelIndex: number;
  rowIndex: number;
  celebrationLevel: "normal" | "double" | "triple";
};

export default function Play() {
  const [lifePoints, setLifePoints] = useState(50);
  const [betCost, setBetCost] = useState<BetCost>(1);
  const [startIndexes, setStartIndexes] = useState<number[]>(() =>
    SYMBOLS.map(() => 0),
  );
  const [spinningReels, setSpinningReels] = useState<boolean[]>(() =>
    SYMBOLS.map(() => false),
  );
  const [isSpinning, setIsSpinning] = useState(false);

  const [paylinesToActivate, setPaylinesToActivate] = useState<Payline[]>([]);
  const [activeSymbolPositions, setActiveSymbolPositions] = useState<
    ActiveSymbolPosition[]
  >([]);

  const timeoutRefs = useRef<Array<number | null>>([]);
  const activationTimeoutRefs = useRef<Array<number | null>>([]);

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

  const onActivate = (symbol: ReelSymbol) => {
    console.log("onActivate", symbol);
  };

  useEffect(() => {
    return () => {
      clearSpinTimers();
      clearActivationTimers();
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
          payline.symbols.forEach((symbol) => {
            onActivate(symbol);
          });
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

    return () => {
      clearActivationTimers();
    };
  }, [paylinesToActivate]);

  const getDisplayedSymbolsFromFinalIndexes = (finalIndexes: number[]) => {
    return SYMBOLS.map((reelSymbols, reelIndex) => {
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
        symbols: displayedSymbols.map((reel) => reel[1] ?? "Empty"),
      },
    ];

    if (cost >= 2) {
      paylines.push(
        {
          name: "top",
          symbols: displayedSymbols.map((reel) => reel[0] ?? "Empty"),
        },
        {
          name: "bottom",
          symbols: displayedSymbols.map((reel) => reel[2] ?? "Empty"),
        },
      );
    }

    if (cost >= 3) {
      paylines.push(
        {
          name: "diagonal-down",
          symbols: displayedSymbols.map((reel, reelIndex) => {
            const rowIndex = Math.min(reelIndex, 2);
            return reel[rowIndex] ?? "Empty";
          }),
        },
        {
          name: "diagonal-up",
          symbols: displayedSymbols.map((reel, reelIndex) => {
            const rowIndex = Math.max(2 - reelIndex, 0);
            return reel[rowIndex] ?? "Empty";
          }),
        },
      );
    }

    return paylines;
  };

  const getActiveSymbolPositionsForPayline = (
    payline: Payline,
  ): ActiveSymbolPosition[] => {
    const nonEmptySymbols = payline.symbols.filter(
      (symbol) => symbol !== "Empty",
    );

    const occurrences = nonEmptySymbols.reduce<Record<string, number>>(
      (accumulator, symbol) => {
        accumulator[symbol] = (accumulator[symbol] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    const getCelebrationLevelForSymbol = (
      symbol: ReelSymbol,
    ): ActiveSymbolPosition["celebrationLevel"] => {
      if (symbol === "Empty") {
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

    if (lifePoints < betCost) {
      return;
    }

    setLifePoints((previous) => previous - betCost);

    clearSpinTimers();
    clearActivationTimers();
    setPaylinesToActivate([]);
    setActiveSymbolPositions([]);

    const finalIndexes = SYMBOLS.map((reelSymbols) => {
      if (reelSymbols.length === 0) {
        return 0;
      }
      return Math.floor(Math.random() * reelSymbols.length);
    });

    const activeReelCount = SYMBOLS.filter(
      (reelSymbols) => reelSymbols.length > 0,
    ).length;

    if (activeReelCount === 0) {
      return;
    }

    let stoppedReels = 0;

    setIsSpinning(true);
    setSpinningReels(SYMBOLS.map((reelSymbols) => reelSymbols.length > 0));

    SYMBOLS.forEach((reelSymbols, reelIndex) => {
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

  return (
    <div className="slot-machine-panel">
      <div className="slot-machine-controls">
        <p className="slot-machine-life-points">PV: {lifePoints}</p>
        <div
          className="slot-machine-bet-buttons"
          role="group"
          aria-label="Mise en points de vie"
        >
          {[1, 2, 3].map((cost) => (
            <button
              key={cost}
              type="button"
              className={`slot-machine-bet ${betCost === cost ? "is-selected" : ""}`}
              onClick={() => setBetCost(cost as BetCost)}
              disabled={isSpinning}
            >
              {cost} PV
            </button>
          ))}
        </div>

        <button
          type="button"
          className="slot-machine-go"
          onClick={handleSpin}
          disabled={isSpinning || lifePoints < betCost}
        >
          {isSpinning ? "Rolling..." : `Spin (-${betCost} PV)`}
        </button>
      </div>

      <SlotMachine
        symbols={SYMBOLS}
        startIndexes={startIndexes}
        spinningReels={spinningReels}
        betCost={betCost}
        activeSymbolPositions={activeSymbolPositions}
      />
    </div>
  );
}
