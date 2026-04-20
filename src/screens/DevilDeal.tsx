import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Devil";
import DevilDealChoices from "@/components/DevilDealChoices";
import MachineUpdate from "@/components/MachineUpdate";

import {
  getRandomDevilDeals,
  getRandomMalusBonusSymbol,
} from "@/services/upgrades";
import { useGameState } from "@/services/gameStore";
import {
  addPermanentBonus,
  addPassiveEffect,
  setRandomChoices,
  spendGold,
  spendMaxHealth,
  setReelSymbol,
} from "@/services/actions";
import { random } from "@/services/maths";

import type { BuyableDevilDeal, ReelSymbol } from "@/types/game";
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

const MALUS_DIALOGS = [
  "Before you can claim your prize, you have to sacrifice something...",
  "Good... Another sacrifice is required...",
  "Perfect... I'm afraid you need a last sacrifice...",
];

export default function DevilDeal() {
  const state = useGameState();
  const navigate = useNavigate();
  const isLeaving = useRef(false);
  const concludeDeal = useRef<() => void | null>(null);
  const forcedMalusTotalRef = useRef(0);
  const [forcedMalusCount, setForcedMalusCount] = useState(0);
  const [currentForcedMalusSymbol, setCurrentForcedMalusSymbol] =
    useState<ReelSymbol | null>(null);

  const storedDeals = (state.currentRun?.randomChoices ??
    []) as BuyableDevilDeal[];

  const phrase = useRef(DEAL_PHRASES[random(0, DEAL_PHRASES.length - 1)]);

  useEffect(() => {
    if (!storedDeals.length && !isLeaving.current) {
      const newDeals = getRandomDevilDeals();
      setRandomChoices(newDeals);
    }
  }, [storedDeals]);

  const leave = useCallback(() => {
    if (isLeaving.current) {
      return;
    }
    isLeaving.current = true;

    setRandomChoices();
    navigate("/bonus-upgrade");
  }, []);

  const permanentDeals = storedDeals.filter((deal) => deal.permanent);
  const runOnlyDeals = storedDeals.filter((deal) => !deal.permanent);

  const onBuyDeal = useCallback(
    (deal: BuyableDevilDeal) => {
      setRandomChoices(storedDeals.filter((d) => d.type !== deal.type));

      concludeDeal.current = () => {
        concludeDeal.current = null;

        if (deal.permanent) {
          addPermanentBonus(deal.type);
        } else {
          switch (deal.type) {
            case "passiveAttack":
              addPassiveEffect("attack");
              break;

            case "passiveDefense":
              addPassiveEffect("defend");
              break;

            case "destroyReelSymbol":
              // TODO
              alert('TODO: "destroyReelSymbol" effect');
              break;

            case "replaceReelSymbol":
              // TODO
              alert('TODO: "replaceReelSymbol" effect');
              break;
          }
        }
      };

      switch (deal.cost.type) {
        case "gold":
          spendGold(deal.cost.value);
          break;

        case "health":
          spendMaxHealth(deal.cost.value);
          break;

        case "reel":
          forcedMalusTotalRef.current = deal.cost.value;
          setForcedMalusCount(deal.cost.value);
          setCurrentForcedMalusSymbol(getRandomMalusBonusSymbol());
          return;
      }

      concludeDeal.current();
    },
    [storedDeals],
  );

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
            onBuyDeal={onBuyDeal}
          />
        )}

        <DevilDealChoices
          title="Temporary Deals"
          subtitle="Benefits from these deals won't follow you after this life."
          deals={runOnlyDeals}
          onBuyDeal={onBuyDeal}
        />
      </div>

      <div>
        <button type="button" onClick={leave}>
          Leave
        </button>
      </div>

      <HealthBar
        variant="hero"
        value={state.currentRun?.health.value ?? 0}
        maxValue={state.currentRun?.health.max ?? 0}
      />

      <GoldCounter value={state.gold} />

      {currentForcedMalusSymbol && (
        <MachineUpdate
          key={currentForcedMalusSymbol}
          devilDialog={
            forcedMalusCount === 1
              ? MALUS_DIALOGS[MALUS_DIALOGS.length - 1]
              : MALUS_DIALOGS[forcedMalusTotalRef.current - forcedMalusCount]
          }
          newSymbol={currentForcedMalusSymbol}
          onSymbolSelect={(reelIndex, symbolIndex) => {
            setReelSymbol(reelIndex, symbolIndex, currentForcedMalusSymbol);
          }}
          shouldForbidMalusSelection
          onComplete={() => {
            if (forcedMalusCount - 1 === 0) {
              setCurrentForcedMalusSymbol(null);
              setForcedMalusCount(0);

              concludeDeal.current?.();
            } else {
              setForcedMalusCount((count) => count - 1);

              let newRandomSymbol = getRandomMalusBonusSymbol();

              while (newRandomSymbol === currentForcedMalusSymbol) {
                newRandomSymbol = getRandomMalusBonusSymbol();
              }

              setCurrentForcedMalusSymbol(newRandomSymbol);
            }
          }}
        />
      )}
    </Screen>
  );
}
