import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { ReelSymbol } from "@/types/game";

import MachineSymbol from "@/components/MachineSymbol";

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
};

export default function MachineReel({
  symbols,
  startIndex = 0,
  isSpinning = false,
  reelIndex = 0,
  activeRows = [],
}: Props) {
  const visibleCount = 3;
  const reelSize = symbols.length;
  const wasSpinningRef = useRef(isSpinning);
  const stopTimeoutRef = useRef<number | null>(null);
  const [isStopping, setIsStopping] = useState(false);

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
      className={`machine-reel${isSpinning ? " is-spinning" : ""}${isStopping ? " is-stopping" : ""}`}
      style={
        {
          "--reel-spin-duration": `${spinDuration}s`,
          "--reel-cycle-distance": `${reelCycleDistance}px`,
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

            return (
              <div
                key={`${normalizedStartIndex}-${index}`}
                className="machine-reel-symbol"
              >
                <MachineSymbol
                  symbol={symbol}
                  isActive={Boolean(activeRow)}
                  celebrationLevel={activeRow?.celebrationLevel ?? "normal"}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
