import { useRef } from "react";
import { Link } from "react-router-dom";

import Tooltip from "@/components/Tooltip";

import { useGameState } from "@/services/gameStore";

import { healPlayer } from "@/services/actions";

import "./style.css";
import DelayedRender from "../DelayedRender";

const healAmountPercentage = 0.25;

type Props = {
  onHeal: () => void;
};

export function VictoryMessage({ onHeal }: Props) {
  const hasClickedHealRef = useRef(false);
  const state = useGameState();

  const maxHealth = state.currentRun?.health.max ?? 0;
  const healAmount = Math.ceil(maxHealth * healAmountPercentage);

  const heal = () => {
    if (hasClickedHealRef.current) {
      return;
    }
    hasClickedHealRef.current = true;
    healPlayer(healAmount);
    onHeal();
  };

  return (
    <div
      className="victory-message"
      style={{
        pointerEvents: hasClickedHealRef.current ? "none" : "auto",
      }}
    >
      <h2>Victory!</h2>
      <p
        className="fade-in"
        style={{ "--animation-delay": "1s" } as React.CSSProperties}
      >
        Now, choose your destiny...
      </p>

      <DelayedRender delay={2000} heigth={120}>
        <div
          className="victory-nav fade-in"
          style={{ "--animation-delay": "0s" } as React.CSSProperties}
        >
          <Tooltip
            label={
              <>
                Restore{" "}
                <b style={{ color: "cyan" }}>{healAmountPercentage * 100}%</b>{" "}
                of your max <b style={{ color: "lightcoral" }}>health</b> points
                (<b style={{ color: "cyan" }}>{healAmount}</b>)
              </>
            }
          >
            <button
              className="victory-nav-choice victory-nav-choice-heal floating-choice-item"
              onClick={heal}
            >
              Heal
            </button>
          </Tooltip>

          <Tooltip
            label={
              <>
                Upgrade your machine by offering{" "}
                <b style={{ color: "gold" }}>gold</b> or{" "}
                <b style={{ color: "lightcoral" }}>health</b> to the Devil.
              </>
            }
          >
            <Link
              className="victory-nav-choice victory-nav-choice-devil floating-choice-item"
              to="/devil"
            >
              Devil Deal
            </Link>
          </Tooltip>
        </div>
      </DelayedRender>
    </div>
  );
}
