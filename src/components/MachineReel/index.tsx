import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { ReelSymbol } from "@/types/game";

import SymbolLabel from "@/components/SymbolLabel";
import MachineSymbol from "@/components/MachineSymbol";
import Tooltip from "@/components/Tooltip";

import { isMalusSymbol } from "@/services/upgrades";

import "./style.css";

type Props = {
  symbols: ReelSymbol[];
  startIndex?: number;
  isSpinning?: boolean;
  reelIndex?: number;
  activeRows?: Array<{
    rowIndex: number;
    celebrationLevel: "normal" | "double" | "triple";
  }>;
  shouldShowAllSymbols?: boolean;
  onSymbolClick?: (symbolIndex: number, symbol: ReelSymbol) => boolean;
  shouldForbidMalusSelection?: boolean;
};

export default function MachineReel({
  symbols,
  startIndex = 0,
  isSpinning = false,
  reelIndex = 0,
  activeRows = [],
  shouldShowAllSymbols = false,
  onSymbolClick,
  shouldForbidMalusSelection,
}: Props) {
  const reelSize = symbols.length;
  const visibleCount = shouldShowAllSymbols ? reelSize : 3;
  const wasSpinningRef = useRef(isSpinning);
  const stopTimeoutRef = useRef<number | null>(null);
  const [isStopping, setIsStopping] = useState(false);
  const [lastReplacedIndex, setLastReplacedIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (wasSpinningRef.current && !isSpinning) {
      setIsStopping(true);

      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
      }

      stopTimeoutRef.current = window.setTimeout(() => {
        setIsStopping(false);
        stopTimeoutRef.current = null;
      }, 420);
    }

    wasSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
      }
    };
  }, []);

  if (reelSize === 0) {
    return <div className="machine-reel" />;
  }

  const normalizedStartIndex =
    ((Math.trunc(startIndex) % reelSize) + reelSize) % reelSize;

  const spinStrip = Array.from(
    { length: reelSize * 2 + visibleCount },
    (_, offset) => {
      const symbolIndex = (normalizedStartIndex + offset) % reelSize;
      return symbols[symbolIndex];
    },
  );

  const visibleSymbols = Array.from({ length: visibleCount }, (_, offset) => {
    const symbolIndex = (normalizedStartIndex + offset) % reelSize;
    return symbols[symbolIndex];
  });

  const spinDuration = 0.28 + reelIndex * 0.045;
  const reelCycleDistance = reelSize * 66;

  return (
    <div
      className={`machine-reel${isSpinning ? " is-spinning" : ""}${isStopping ? " is-stopping" : ""}${shouldShowAllSymbols ? " is-expanded" : ""}`}
      style={
        {
          "--reel-spin-duration": `${spinDuration}s`,
          "--reel-cycle-distance": `${reelCycleDistance}px`,
          "--visible-symbols": `${visibleCount}`,
        } as CSSProperties
      }
    >
      {isSpinning ? (
        <div className="machine-reel-strip" aria-hidden="true">
          {spinStrip.map((symbol, index) => (
            <div key={`spin-${index}`} className="machine-reel-symbol">
              <MachineSymbol symbol={symbol} />
            </div>
          ))}
        </div>
      ) : (
        <div className="machine-reel-strip is-static">
          {visibleSymbols.map((symbol, index) => {
            const activeRow = activeRows.find((row) => row.rowIndex === index);

            const isSelectionnable =
              Boolean(onSymbolClick) &&
              (!shouldForbidMalusSelection || !isMalusSymbol(symbol));

            return (
              <div
                key={`${normalizedStartIndex}-${index}-${symbol}`}
                className="machine-reel-symbol"
              >
                <Tooltip
                  label={<SymbolLabel symbol={symbol} />}
                  cursor={isSelectionnable ? "pointer" : "help"}
                >
                  {isSelectionnable ? (
                    <button
                      className={`machine-reel-clickable-symbol${lastReplacedIndex === index ? " is-new" : ""}`}
                      onClick={() => {
                        if (onSymbolClick!(index, symbol)) {
                          setLastReplacedIndex(index);
                        }
                      }}
                      onAnimationEnd={() => setLastReplacedIndex(null)}
                    >
                      <MachineSymbol symbol={symbol} />
                    </button>
                  ) : (
                    <MachineSymbol
                      symbol={symbol}
                      isActive={Boolean(activeRow)}
                      celebrationLevel={activeRow?.celebrationLevel ?? "normal"}
                    />
                  )}
                </Tooltip>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
