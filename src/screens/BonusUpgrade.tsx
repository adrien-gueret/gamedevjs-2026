import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Devil";
import MachineUpdate from "@/components/MachineUpdate";
import SymbolPicker from "@/components/SymbolPicker";

import { getRandomBonusSymbols } from "@/services/upgrades";
import { useGameState } from "@/services/gameStore";
import { setRandomChoices, setReelSymbol } from "@/services/actions";
import { random } from "@/services/maths";
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
  const storedSymbols = state.currentRun?.randomChoices ?? [];
  const [newSymbol, setNewSymbol] = useState<ReelSymbol | null>(null);
  const phrase = useRef(BONUS_PHRASES[random(0, BONUS_PHRASES.length - 1)]);
  const isLeaving = useRef(false);

  useEffect(() => {
    if (!storedSymbols.length && !isLeaving.current) {
      const newSymbols = getRandomBonusSymbols();
      setRandomChoices(newSymbols);
    }
  }, [storedSymbols]);

  const leave = useCallback(() => {
    if (isLeaving.current) {
      return;
    }
    isLeaving.current = true;
    startNewBattle();
    setRandomChoices();
    navigate("/battle");
  }, []);

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

        <SymbolPicker symbols={storedSymbols} onSelect={setNewSymbol} />
      </div>
      {newSymbol && (
        <MachineUpdate
          newSymbol={newSymbol}
          onSymbolSelect={(reelIndex, symbolIndex) => {
            setReelSymbol(reelIndex, symbolIndex, newSymbol);
          }}
          onComplete={leave}
          onClose={() => setNewSymbol(null)}
        />
      )}
    </Screen>
  );
}
