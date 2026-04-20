import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChoiceItem from "@/components/ChoiceItem";
import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Devil";
import SymbolLabel from "@/components/SymbolLabel";
import MachineSymbol from "@/components/MachineSymbol";
import MachineUpdate from "@/components/MachineUpdate";
import Tooltip from "@/components/Tooltip";

import { getRandomBonusSymbols } from "@/services/upgrades";
import { useGameState } from "@/services/gameStore";
import { setRandomChoices, setReelSymbol } from "@/services/actions";
import { random } from "@/services/maths";
import { sleep } from "@/services/utils";
import { startNewBattle } from "@/services/actions";

import type { ReelSymbol } from "@/types/game";

const BONUS_PHRASES = [
  "I'm feeling generous. Here's a gift for you.",
  "Consider this a gift. Choose wisely.",
  "Lucky you! Take your pick and make it count.",
  "The house gives back… just this once.",
  "A little something extra, on the house.",
  "Don't overthink it. They're all good choices.",
  "You've earned this. Enjoy it while it lasts.",
];

export default function BonusUpgrade() {
  const state = useGameState();
  const navigate = useNavigate();
  const [hasMadeChoice, setHasMadeChoice] = useState(false);
  const storedSymbols = state.currentRun?.randomChoices ?? [];
  console.log("Stored symbols:", storedSymbols);
  const [newSymbol, setNewSymbol] = useState<ReelSymbol | null>(null);
  const phrase = useRef(BONUS_PHRASES[random(0, BONUS_PHRASES.length - 1)]);

  useEffect(() => {
    if (!hasMadeChoice && !storedSymbols.length) {
      const newSymbols = getRandomBonusSymbols();
      setRandomChoices(newSymbols);
    }
  }, [hasMadeChoice, storedSymbols]);

  useEffect(() => {
    if (hasMadeChoice) {
      sleep(500).then(() => {
        startNewBattle();
        setRandomChoices();
        navigate("/battle");
      });
    }
  }, [hasMadeChoice]);

  return (
    <Screen>
      <Scene />
      <h1>"{phrase.current}"</h1>
      <hr className="ui-separator" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>
          Pick a symbol to add to your machine — it's{" "}
          <b style={{ color: "gold" }}>free</b>!
        </h2>

        <div>
          {storedSymbols.map((symbol, index) => (
            <Tooltip
              key={symbol}
              cursor="pointer"
              label={<SymbolLabel symbol={symbol} />}
            >
              <ChoiceItem
                delay={1.5 * index}
                onClick={() => setNewSymbol(symbol)}
              >
                <MachineSymbol symbol={symbol} />
              </ChoiceItem>
            </Tooltip>
          ))}
        </div>
      </div>
      {newSymbol && (
        <MachineUpdate
          newSymbol={newSymbol}
          onSymbolSelect={(reelIndex, symbolIndex) => {
            if (hasMadeChoice) {
              return false;
            }
            setReelSymbol(reelIndex, symbolIndex, newSymbol);
            setHasMadeChoice(true);
            return true;
          }}
          onClose={() => setNewSymbol(null)}
        />
      )}
    </Screen>
  );
}
