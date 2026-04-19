import { useGameState } from "@/services/gameStore";
import MachineReel from "@/components/MachineReel";
import MachineSymbol from "@/components/MachineSymbol";
import Tooltip from "@/components/Tooltip";
import SymbolLabel from "@/components/SymbolLabel";

import type { ReelSymbol } from "@/types/game";

import "./style.css";

type Props = {
  newSymbol: ReelSymbol;
  onSymbolSelect?: (reelIndex: number, symbolIndex: number) => boolean;
  onClose: () => void;
};

export default function MachineUpdate({
  newSymbol,
  onSymbolSelect,
  onClose,
}: Props) {
  const state = useGameState();

  return (
    <div className="machine-update">
      <div className="slot-machine">
        <div className="machine-update-question">
          Which symbol would you like to replace with{" "}
          <Tooltip label={<SymbolLabel symbol={newSymbol} />}>
            <MachineSymbol symbol={newSymbol} />
          </Tooltip>
          ?
        </div>
        <div className="machine-update-reels">
          {state.currentRun?.reels.map((reelSymbols, index) => (
            <MachineReel
              key={index}
              symbols={reelSymbols}
              reelIndex={index}
              shouldShowAllSymbols
              onSymbolClick={
                onSymbolSelect
                  ? (symbolIndex) => onSymbolSelect(index, symbolIndex)
                  : undefined
              }
            />
          ))}
        </div>
        <button className="machine-update-back-button" onClick={onClose}>
          Back
        </button>
      </div>
    </div>
  );
}
