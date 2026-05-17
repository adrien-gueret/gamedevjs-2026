import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSounds } from "wavedash-react";

import Button from "@/components/Button";
import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Devil";
import MachineUpdate from "@/components/MachineUpdate";
import SymbolPicker from "@/components/SymbolPicker";

import { useGetRandomBonusSymbols } from "@/services/upgrades";
import { random } from "@/services/maths";
import { useRandomChoices } from "@/services/selector";
import { usePersistentActions, usePersistentSelector } from "@/services/state";

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
  const navigate = useNavigate();
  const { playSound } = useSounds();
  const storedSymbols = useRandomChoices();
  const [newSymbol, setNewSymbol] = useState<ReelSymbol | null>(null);
  const phrase = useRef(BONUS_PHRASES[random(0, BONUS_PHRASES.length - 1)]);
  const isLeaving = useRef(false);
  const { setRandomChoices, startNewBattle, addSymbolTooReel } =
    usePersistentActions();

  const getRandomBonusSymbols = useGetRandomBonusSymbols();

  useEffect(() => {
    if (!storedSymbols.length && !isLeaving.current) {
      const newSymbols = getRandomBonusSymbols(2);
      setRandomChoices(newSymbols);
    }
  }, [storedSymbols, getRandomBonusSymbols, setRandomChoices]);

  const currentLevelIndex = usePersistentSelector(
    (state) => state.currentRun?.levelIndex ?? -1,
  );

  const hasWantedToDie = usePersistentSelector(
    (state) =>
      state.currentRun?.passiveEffects.includes("wantedToDie") ?? false,
  );

  const leave = useCallback(() => {
    if (isLeaving.current) {
      return;
    }
    isLeaving.current = true;
    startNewBattle();
    setRandomChoices();
    navigate("/battle");
  }, [navigate, startNewBattle, setRandomChoices]);

  useEffect(() => {
    if (hasWantedToDie || (currentLevelIndex ?? 0) % 2 === 0) {
      leave();
    }
  }, [hasWantedToDie, currentLevelIndex, leave]);

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
          variant="add"
          onReelSelect={(reelIndex) => {
            playSound("insertSymbol");
            addSymbolTooReel(reelIndex, newSymbol);
          }}
          onComplete={leave}
          onClose={() => setNewSymbol(null)}
        />
      )}

      <Button imageName="skip" onClick={leave}>
        Skip
      </Button>
    </Screen>
  );
}
