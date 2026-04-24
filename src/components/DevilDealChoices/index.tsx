import { useCallback } from "react";

import Tooltip from "@/components/Tooltip";
import DealLabel from "@/components/DealLabel";
import { useGameState } from "@/services/gameStore";
import type { BuyableDevilDeal } from "@/types/game";

import "./style.css";

type Props = {
  title: string;
  subtitle: string;
  deals: BuyableDevilDeal[];
  canRerollDeals?: boolean;
  onBuyDeal: (deal: BuyableDevilDeal) => void;
};

export default function DevilDealChoices({
  title,
  subtitle,
  deals,
  canRerollDeals,
  onBuyDeal,
}: Props) {
  const state = useGameState();
  const canAffordDeal = useCallback(
    (deal: BuyableDevilDeal): boolean => {
      switch (deal.cost.type) {
        case "gold":
          return state.gold >= deal.cost.value;

        case "maxhealth":
          return (state.currentRun?.health.max ?? 0) > deal.cost.value;

        case "health":
          return (state.currentRun?.health.value ?? 0) > deal.cost.value;

        default:
          return true;
      }
    },
    [state.gold, state.currentRun?.health.max, state.currentRun?.health.value],
  );

  const rerollDeal: BuyableDevilDeal | null = canRerollDeals
    ? {
        type: "rerollDeals",
        cost: {
          type: "gold",
          value: 2,
        },
        permanent: false,
      }
    : null;

  return (
    <div className="devil-deal-choices">
      <h2 className="devil-deal-choices-title">{title}</h2>
      <p className="devil-deal-choices-subtitle">{subtitle}</p>
      <div className="devil-deal-choices-container">
        {deals.length === 0 ? (
          <p className="devil-deal-choices-empty">No deals available</p>
        ) : (
          deals.map((deal, index) => (
            <div
              key={deal.type}
              className="deal-choice floating-choice-item"
              style={{
                animationDelay: `-${index * 1.5}s`,
              }}
            >
              <Tooltip
                content={deal.type}
                label={
                  <DealLabel
                    dealType={deal.type}
                    cost={deal.cost}
                    isAffordable={canAffordDeal(deal)}
                  />
                }
              >
                <button
                  className={`deal-choice-button deal-choice-${deal.type.toLowerCase()}`}
                  onClick={() => onBuyDeal(deal)}
                  disabled={!canAffordDeal(deal)}
                >
                  {deal.type}
                </button>
              </Tooltip>
            </div>
          ))
        )}
      </div>
      {rerollDeal !== null && (
        <div className="deal-reroll-container">
          <Tooltip
            content="Reroll Deals"
            label={
              <DealLabel
                dealType={rerollDeal.type}
                cost={rerollDeal.cost}
                isAffordable={canAffordDeal(rerollDeal)}
              />
            }
          >
            <button
              className={`deal-choice-button deal-choice-reroll-deals`}
              onClick={() => onBuyDeal(rerollDeal)}
              disabled={!canAffordDeal(rerollDeal)}
            >
              {rerollDeal.type}
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
