import type { ReelSymbol, BetCost } from "@/types/game";

import Button from "@/components/Button";
import MachineReel from "@/components/MachineReel";
import MachineHearts from "@/components/MachineHearts";

import { hasUnlockedPermanentDeal } from "@/services/selector";

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
  isInteractive?: boolean;
};

export default function SlotMachine({
  symbols,
  startIndexes,
  spinningReels,
  betCost,
  activeSymbolPositions,
  onSpin,
  onBetCostChange,
  isInteractive,
}: Props) {
  const isSpinning = spinningReels.some((isReelSpinning) => isReelSpinning);
  const maxBetCost = hasUnlockedPermanentDeal("betterBet2")
    ? 3
    : hasUnlockedPermanentDeal("betterBet1")
      ? 2
      : 1;

  return (
    <div className="slot-machine">
      <div className="slot-machine-reels">
        <MachineHearts
          onClick={isInteractive ? onBetCostChange : undefined}
          betCost={betCost}
          maxBetCost={maxBetCost}
        />

        <div className="helper-text text-1">
          {maxBetCost === 1 && <br />}
          1. Bet <b style={{ color: "#238c29" }}>1</b>
          {maxBetCost > 1 && (
            <>
              {maxBetCost === 3 && ","} {maxBetCost === 2 && " or "}
              <b style={{ color: "#0086f0" }}>2</b>
              {maxBetCost === 3 && (
                <>
                  {" "}
                  or <b style={{ color: "#a6a000" }}>3</b>
                </>
              )}
            </>
          )}{" "}
          Health Point{maxBetCost > 1 ? "s" : ""}
          {maxBetCost > 1 && (
            <>
              <br />
              <img src="./images/arrow_bottom_left.png" alt="" />
            </>
          )}
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
        <MachineHearts
          onClick={isInteractive ? onBetCostChange : undefined}
          betCost={betCost}
          maxBetCost={maxBetCost}
        />
      </div>

      <div className="helper-text text-2">
        2. And spin the reels!
        <br />
        <img src="./images/arrow_bottom_right.png" alt="" />
      </div>

      <div className="spin-button">
        <Button
          imageName="spin"
          onClick={onSpin}
          disabled={isSpinning || !isInteractive}
        >
          Spin
        </Button>
      </div>

      <div className="slot-machine-lines">
        {maxBetCost >= 3 && (
          <div
            className={`slot-machine-line slot-machine-line-3 ${betCost >= 3 ? "is-active" : "disabled"}`}
          />
        )}

        {maxBetCost >= 2 && (
          <div
            className={`slot-machine-line slot-machine-line-2 ${betCost >= 2 ? "is-active" : "disabled"}`}
          />
        )}

        <div
          className={`slot-machine-line slot-machine-line-1 ${betCost >= 1 ? "is-active" : "disabled"}`}
        />

        {maxBetCost >= 2 && (
          <div
            className={`slot-machine-line slot-machine-line-2 ${betCost >= 2 ? "is-active" : "disabled"}`}
          />
        )}

        {maxBetCost >= 3 && (
          <div
            className={`slot-machine-line slot-machine-line-3 ${betCost >= 3 ? "is-active" : "disabled"}`}
          />
        )}
      </div>
    </div>
  );
}
