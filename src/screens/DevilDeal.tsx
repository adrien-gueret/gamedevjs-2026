import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Devil";
import DevilDealChoices from "@/components/DevilDealChoices";
import MachineSymbol from "@/components/MachineSymbol";
import MachineUpdate from "@/components/MachineUpdate";
import Tooltip from "@/components/Tooltip";

import { getRandomDevilDeals } from "@/services/upgrades";
import { useGameState } from "@/services/gameStore";
import { setRandomChoices } from "@/services/actions";
import { random } from "@/services/maths";
import { sleep } from "@/services/utils";
import { startNewBattle } from "@/services/actions";

import type { BuyableDevilDeal } from "@/types/game";
import HealthBar from "@/components/HealthBar";
import GoldCounter from "@/components/GoldCounter";

const DEAL_PHRASES = [
  "I have some offers you can't refuse...",
  "Every soul has a price. What's yours?",
  "It would be a shame to let you die cheaply...",
  "Power comes at a cost...",
  "I've been expecting you. I always do.",
  "Choose wisely. Or don't - I profit either way.",
];

export default function DevilDeal() {
  const state = useGameState();
  const navigate = useNavigate();

  const storedDeals = (state.currentRun?.randomChoices ??
    []) as BuyableDevilDeal[];

  const phrase = useRef(DEAL_PHRASES[random(0, DEAL_PHRASES.length - 1)]);

  useEffect(() => {
    if (!storedDeals.length) {
      const newDeals = getRandomDevilDeals();
      setRandomChoices(newDeals);
    }
  }, [storedDeals]);

  /*
    startNewBattle();
      setRandomChoices();
    navigate("/battle");
  */

  console.log("storedDeals", storedDeals);

  const permanentDeals = storedDeals.filter((deal) => deal.permanent);
  const runOnlyDeals = storedDeals.filter((deal) => !deal.permanent);

  return (
    <Screen>
      <Scene />
      <h1>"{phrase.current}"</h1>
      <hr className="ui-separator" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {permanentDeals.length > 0 && (
          <DevilDealChoices
            title="Permanent Deals"
            subtitle="Benefits from these deals will last even in the afterlife!"
            deals={permanentDeals}
            onBuyDeal={(deal) => console.log("Buy", deal)}
          />
        )}

        <DevilDealChoices
          title="Temporary Deals"
          subtitle="Benefits from these deals won't follow you after this life."
          deals={runOnlyDeals}
          onBuyDeal={(deal) => console.log("Buy", deal)}
        />
      </div>

      <HealthBar
        variant="hero"
        value={state.currentRun?.health.value ?? 0}
        maxValue={state.currentRun?.health.max ?? 0}
      />

      <GoldCounter value={state.gold} />

      {/*newSymbol && (
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
      )*/}
    </Screen>
  );
}
