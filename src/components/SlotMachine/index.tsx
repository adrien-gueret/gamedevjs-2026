import type { ReelSymbol, BetCost } from "@/types/game";

import Button from "@/components/Button";
import MachineReel from "@/components/MachineReel";
import MachineHearts from "@/components/MachineHearts";

import "./style.css";

type Props = {
  symbols: ReelSymbol[][];
  startIndexes: number[];
  spinningReels: boolean[];
  betCost: BetCost;
  activeSymbolPositions: Array<{
    reelIndex: number;
    rowIndex: number;
    celebrationLevel: "normal" | "double" | "triple";
  }>;
  onSpin: () => void;
  onBetCostChange: (newBetCost: BetCost) => void;
};

export default function SlotMachine({
  symbols,
  startIndexes,
  spinningReels,
  betCost,
  activeSymbolPositions,
  onSpin,
  onBetCostChange,
}: Props) {
  const isSpinning = spinningReels.some((isReelSpinning) => isReelSpinning);

  return (
    <div className="slot-machine">
      <div className="slot-machine-reels">
        <MachineHearts onClick={onBetCostChange} betCost={betCost} />

        <div className="helper-text text-1">
          1. Bet <b style={{ color: "#238c29" }}>1</b>,{" "}
          <b style={{ color: "#0086f0" }}>2</b> or{" "}
          <b style={{ color: "#a6a000" }}>3</b> Health Points
          <br />
          <img src="./images/arrow_bottom_left.png" alt="" />
        </div>

        {symbols.map((reelSymbols, index) => (
          <MachineReel
            key={index}
            symbols={reelSymbols}
            startIndex={startIndexes[index]}
            isSpinning={spinningReels[index] ?? false}
            reelIndex={index}
            activeRows={activeSymbolPositions
              .filter((position) => position.reelIndex === index)
              .map((position) => ({
                rowIndex: position.rowIndex,
                celebrationLevel: position.celebrationLevel,
              }))}
          />
        ))}
        <MachineHearts onClick={onBetCostChange} betCost={betCost} />
      </div>

      <div className="helper-text text-2">
        2. And spin the reels!
        <br />
        <img src="./images/arrow_bottom_right.png" alt="" />
      </div>

      <div className="spin-button">
        <Button imageName="spin" onClick={onSpin} disabled={isSpinning}>
          Spin
        </Button>
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
