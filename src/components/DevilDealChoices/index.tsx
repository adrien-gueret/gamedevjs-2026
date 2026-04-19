import Tooltip from "@/components/Tooltip";
import DealLabel from "@/components/DealLabel";
import type { BuyableDevilDeal } from "@/types/game";

import "./style.css";

type Props = {
  title: string;
  subtitle: string;
  deals: BuyableDevilDeal[];
  onBuyDeal: (deal: BuyableDevilDeal) => void;
};

export default function DevilDealChoices({
  title,
  subtitle,
  deals,
  onBuyDeal,
}: Props) {
  return (
    <div className="devil-deal-choices">
      <h2 className="devil-deal-choices-title">{title}</h2>
      <p className="devil-deal-choices-subtitle">{subtitle}</p>
      <div className="devil-deal-choices-container">
        {deals.map((deal, index) => (
          <div
            key={deal.type}
            className="deal-choice floating-choice-item"
            style={{
              animationDelay: `-${index * 1.5}s`,
            }}
          >
            <Tooltip
              content={deal.type}
              label={<DealLabel dealType={deal.type} cost={deal.cost} />}
            >
              <button
                className={`deal-choice-button deal-choice-${deal.type.toLowerCase()}`}
                onClick={() => onBuyDeal(deal)}
              >
                {deal.type}
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
