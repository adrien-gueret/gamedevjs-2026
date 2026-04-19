import type { BetCost } from "@/types/game";

import "./style.css";

type Props = {
  betCost: BetCost;
  maxBetCost: BetCost;
  onClick?: (newBetCost: BetCost) => void;
};

export default function MachineHearts({ betCost, maxBetCost, onClick }: Props) {
  return (
    <div className="machine-hearts">
      <button
        type="button"
        className={`machine-heart machine-heart-3 ${betCost >= 3 ? "active" : "inactive"} ${maxBetCost < 3 ? "hidden" : ""}`}
        onClick={onClick ? () => onClick(betCost === 3 ? 2 : 3) : undefined}
        disabled={!onClick || maxBetCost < 3}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-2 ${betCost >= 2 ? "active" : "inactive"} ${maxBetCost < 2 ? "hidden" : ""}`}
        onClick={onClick ? () => onClick(betCost === 2 ? 1 : 2) : undefined}
        disabled={!onClick || maxBetCost < 2}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-1 active ${betCost === 1 ? "disabled" : ""}`}
        onClick={onClick ? () => onClick(1) : undefined}
        disabled={!onClick}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-2 ${betCost >= 2 ? "active" : "inactive"} ${maxBetCost < 2 ? "hidden" : ""}`}
        onClick={onClick ? () => onClick(betCost === 2 ? 1 : 2) : undefined}
        disabled={!onClick || maxBetCost < 2}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-3 ${betCost >= 3 ? "active" : "inactive"} ${maxBetCost < 3 ? "hidden" : ""}`}
        onClick={onClick ? () => onClick(betCost === 3 ? 2 : 3) : undefined}
        disabled={!onClick || maxBetCost < 3}
      />
    </div>
  );
}
