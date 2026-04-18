import { Link } from "react-router-dom";

import Tooltip from "@/components/Tooltip";

import { useGameState } from "@/services/gameStore";

import "./style.css";

export function VictoryMessage() {
  const state = useGameState();

  const maxHealth = state.currentRun?.health.max ?? 0;
  const healAmount = Math.ceil(maxHealth * 0.3);

  return (
    <div className="victory-message">
      <h2>Victory!</h2>
      <p
        className="fade-in"
        style={{ "--animation-delay": "1s" } as React.CSSProperties}
      >
        Now, choose your destiny...
      </p>

      <div
        className="victory-nav fade-in"
        style={{ "--animation-delay": "2s" } as React.CSSProperties}
      >
        <Tooltip
          label={
            <>
              Restore <b style={{ color: "cyan" }}>30%</b> of your max{" "}
              <b style={{ color: "lightcoral" }}>health</b> points (
              <b style={{ color: "cyan" }}>{healAmount}</b>)
            </>
          }
        >
          <Link
            className="victory-nav-choice victory-nav-choice-heal"
            to="/battle"
          >
            Heal
          </Link>
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
            className="victory-nav-choice victory-nav-choice-devil"
            to="/devil"
          >
            Devil Deal
          </Link>
        </Tooltip>
      </div>
    </div>
  );
}
