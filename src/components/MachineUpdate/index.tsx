import { useState } from "react";

import { useGameState } from "@/services/gameStore";
import MachineReel from "@/components/MachineReel";
import MachineSymbol from "@/components/MachineSymbol";
import Tooltip from "@/components/Tooltip";
import SymbolLabel from "@/components/SymbolLabel";

import { sleep } from "@/services/utils";
import type { ReelSymbol } from "@/types/game";

import "./style.css";

type Props = {
  newSymbol: ReelSymbol;
  onSymbolSelect?: (reelIndex: number, symbolIndex: number) => void;
  onComplete?: () => void;
  onClose?: () => void;
  devilDialog?: string;
  shouldForbidMalusSelection?: boolean;
};

export default function MachineUpdate({
  newSymbol,
  onSymbolSelect,
  onComplete,
  onClose,
  devilDialog,
  shouldForbidMalusSelection,
}: Props) {
  const state = useGameState();
  const [hasMadeChoice, setHasMadeChoice] = useState(false);

  return (
    <div className="machine-update">
      <div className="slot-machine">
        <div className="machine-update-question">
          {Boolean(devilDialog) && (
            <>
              "{devilDialog}"
              <hr />
            </>
          )}
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
              shouldForbidMalusSelection={shouldForbidMalusSelection}
              onSymbolClick={
                onSymbolSelect
                  ? (symbolIndex) => {
                      if (hasMadeChoice) {
                        return false;
                      }
                      setHasMadeChoice(true);
                      onSymbolSelect?.(index, symbolIndex);
                      sleep(500).then(() => onComplete?.());
                      return true;
                    }
                  : undefined
              }
            />
          ))}
        </div>
        {onClose && (
          <button
            disabled={hasMadeChoice}
            className="machine-update-back-button"
            onClick={onClose}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
