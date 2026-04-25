import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import "./style.css";

import type { ReelSymbol } from "@/types/game";

type Props = {
  symbol: ReelSymbol;
  isActive?: boolean;
  celebrationLevel?: "normal" | "double" | "triple";
};

const SPARKLE_COUNT = 8;

export default function MachineSymbol({
  symbol,
  isActive = false,
  celebrationLevel = "normal",
}: Props) {
  const symbolRef = useRef<HTMLDivElement>(null);
  const [burstCoords, setBurstCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!isActive || !symbolRef.current) {
      setBurstCoords(null);
      return;
    }

    const rect = symbolRef.current.getBoundingClientRect();
    setBurstCoords({
      top: rect.top + window.scrollY + rect.height / 2,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, [isActive, celebrationLevel, symbol]);

  const symbolClassName = `machine-symbol machine-symbol-${symbol.toLocaleLowerCase()}${isActive ? " is-active" : ""}${isActive ? ` is-${celebrationLevel}` : ""}`;

  return (
    <>
      <div ref={symbolRef} className={symbolClassName} />
      {isActive &&
        burstCoords &&
        createPortal(
          <div
            className={`machine-symbol-burst is-${celebrationLevel}`}
            style={{ top: burstCoords.top, left: burstCoords.left }}
            aria-hidden="true"
          >
            <div className="machine-symbol-burst-glow" />
            <div className="machine-symbol-burst-ring" />
            <div className="machine-symbol-burst-ring is-second" />
            <div className="machine-symbol-burst-rays" />
            <div className="machine-symbol-burst-sparkles">
              {Array.from({ length: SPARKLE_COUNT }).map((_, index) => (
                <span
                  key={index}
                  className="machine-symbol-burst-sparkle"
                  style={{ "--sparkle-index": index } as CSSProperties}
                />
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
