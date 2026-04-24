import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Screen from "@/components/Screen";
import Scene from "@/components/Scene/Devil";
import DevilDealChoices from "@/components/DevilDealChoices";
import MachineUpdate from "@/components/MachineUpdate";
import SymbolPicker from "@/components/SymbolPicker";

import {
  getRandomDevilDeals,
  getRandomMalusSymbol,
  getRandomBonusSymbols,
  isMalusSymbol,
} from "@/services/upgrades";
import { useGameState } from "@/services/gameStore";
import {
  addPermanentBonus,
  addPassiveEffect,
  setRandomChoices,
  spendGold,
  spendMaxHealth,
  setReelSymbol,
  removeReelSymbol,
  killPlayer,
  takeDamage,
} from "@/services/actions";
import { random } from "@/services/maths";
import { playSound } from "@/services/sounds";

import type { BuyableDevilDeal, ReelSymbol } from "@/types/game";
import HealthBar from "@/components/HealthBar";
import GoldCounter from "@/components/GoldCounter";
import ReplacementBonusModal from "@/components/ReplacementBonusModal";
import Button from "@/components/Button";

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
  const isShopInitialized = useRef(false);

  const forcedMalusTotalRef = useRef(0);
  const [forcedMalusCount, setForcedMalusCount] = useState(0);
  const [currentForcedMalusSymbol, setCurrentForcedMalusSymbol] =
    useState<ReelSymbol | null>(null);

  const [showRemoveSymbolBonus, setShowRemoveSymbolBonus] = useState(false);
  const [symbolsForReplacementBonus, setSymbolsForReplacementBonus] = useState<
    ReelSymbol[]
  >([]);
  const [
    selectedSymbolForReplacementBonus,
    setSelectedSymbolForReplacementBonus,
  ] = useState<ReelSymbol | null>(null);

  const storedDeals = (state.currentRun?.randomChoices ??
    []) as BuyableDevilDeal[];

  const phrase = useRef(DEAL_PHRASES[random(0, DEAL_PHRASES.length - 1)]);

  useEffect(() => {
    if (isShopInitialized.current) {
      return;
    }
    isShopInitialized.current = true;
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
      playSound("acceptDeal");

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

            case "passiveWantedToDie": {
              killPlayer();
              addPassiveEffect("wantedToDie");
              leave();
              break;
            }

            case "destroyReelSymbol":
              setShowRemoveSymbolBonus(true);
              break;

            case "replaceReelSymbol":
              setSymbolsForReplacementBonus(getRandomBonusSymbols(4));
              break;

            case "rerollDeals":
              const currentPermanentDeals = storedDeals.filter(
                (d) => d.permanent,
              );
              const newNonPermanentDeals = getRandomDevilDeals().filter(
                (d) => !d.permanent,
              );
              const newDeals = [
                ...currentPermanentDeals,
                ...newNonPermanentDeals,
              ];
              setRandomChoices(newDeals);
              break;
          }
        }
      };

      switch (deal.cost.type) {
        case "gold":
          spendGold(deal.cost.value);
          break;

        case "maxhealth":
          spendMaxHealth(deal.cost.value);
          break;

        case "health":
          takeDamage(deal.cost.value);
          break;

        case "reel": {
          const allSymbols = (state.currentRun?.reels ?? []).flat();
          const allAreMalus =
            allSymbols.length === 0 || allSymbols.every(isMalusSymbol);

          if (allAreMalus) {
            break;
          }

          forcedMalusTotalRef.current = deal.cost.value;
          setForcedMalusCount(deal.cost.value);
          setCurrentForcedMalusSymbol(getRandomMalusSymbol());
          return;
        }
      }

      concludeDeal.current();
    },
    [storedDeals, leave],
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
          canRerollDeals={state.unlockedPermanentDeals.includes(
            "unlockRerollDeals",
          )}
          onBuyDeal={onBuyDeal}
        />
      </div>

      <div>
        <Button imageName="leave" type="button" onClick={leave}>
          Leave
        </Button>
      </div>

      <HealthBar
        variant="hero"
        value={state.currentRun?.health.value ?? 0}
        maxValue={state.currentRun?.health.max ?? 0}
      />

      <GoldCounter value={state.gold} />

      {currentForcedMalusSymbol && (
        <MachineUpdate
          variant="replace"
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

              let newRandomSymbol = getRandomMalusSymbol();

              while (newRandomSymbol === currentForcedMalusSymbol) {
                newRandomSymbol = getRandomMalusSymbol();
              }

              setCurrentForcedMalusSymbol(newRandomSymbol);
            }
          }}
        />
      )}

      {showRemoveSymbolBonus && (
        <MachineUpdate
          variant="remove"
          onSymbolSelect={(reelIndex, symbolIndex) => {
            removeReelSymbol(reelIndex, symbolIndex);
          }}
          onComplete={() => {
            setShowRemoveSymbolBonus(false);
          }}
        />
      )}

      {symbolsForReplacementBonus.length > 0 && (
        <>
          <ReplacementBonusModal>
            <p>Pick the symbol you want to add in your machine</p>
            <hr />
            <SymbolPicker
              symbols={symbolsForReplacementBonus}
              onSelect={setSelectedSymbolForReplacementBonus}
            />
          </ReplacementBonusModal>
          {selectedSymbolForReplacementBonus && (
            <MachineUpdate
              newSymbol={selectedSymbolForReplacementBonus}
              variant="replace"
              onSymbolSelect={(reelIndex, symbolIndex) => {
                setReelSymbol(
                  reelIndex,
                  symbolIndex,
                  selectedSymbolForReplacementBonus,
                );
              }}
              onComplete={() => {
                setSymbolsForReplacementBonus([]);
              }}
              onClose={() => setSelectedSymbolForReplacementBonus(null)}
            />
          )}
        </>
      )}
    </Screen>
  );
}
