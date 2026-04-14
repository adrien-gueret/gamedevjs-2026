import type { ReelSymbol } from "@/types/game";

import MachineReel from "@/components/MachineReel";
import MachineHearts from "@/components/MachineHearts";

import "./style.css";

type Props = {
  symbols: ReelSymbol[][];
  startIndexes: number[];
  spinningReels: boolean[];
  betCost: number;
  activeSymbolPositions: Array<{
    reelIndex: number;
    rowIndex: number;
  }>;
};

export default function SlotMachine({
  symbols,
  startIndexes,
  spinningReels,
  betCost,
  activeSymbolPositions,
}: Props) {
  return (
    <div className="slot-machine">
      <div className="slot-machine-reels">
        <MachineHearts betCost={betCost} />
        {symbols.map((reelSymbols, index) => (
          <MachineReel
            key={index}
            symbols={reelSymbols}
            startIndex={startIndexes[index]}
            isSpinning={spinningReels[index] ?? false}
            reelIndex={index}
            activeRowIndexes={activeSymbolPositions
              .filter((position) => position.reelIndex === index)
              .map((position) => position.rowIndex)}
          />
        ))}
        <MachineHearts betCost={betCost} />
      </div>

      <div className="slot-machine-lines">
        <div
          className={`slot-machine-line slot-machine-line-3 ${betCost >= 3 ? "is-active" : "disabled"}`}
        />
        <div
          className={`slot-machine-line slot-machine-line-2 ${betCost >= 2 ? "is-active" : "disabled"}`}
        />
        <div
          className={`slot-machine-line slot-machine-line-1 ${betCost >= 1 ? "is-active" : "disabled"}`}
        />
        <div
          className={`slot-machine-line slot-machine-line-2 ${betCost >= 2 ? "is-active" : "disabled"}`}
        />
        <div
          className={`slot-machine-line slot-machine-line-3 ${betCost >= 3 ? "is-active" : "disabled"}`}
        />
      </div>
    </div>
  );
}
