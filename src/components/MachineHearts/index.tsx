import type { BetCost } from "@/types/game";

import "./style.css";

type Props = {
  betCost: number;
  onClick: (newBetCost: BetCost) => void;
};

export default function MachineHearts({ betCost, onClick }: Props) {
  return (
    <div className="machine-hearts">
      <button
        type="button"
        className={`machine-heart machine-heart-3 ${betCost >= 3 ? "active" : "inactive"}`}
        onClick={() => onClick(betCost === 3 ? 2 : 3)}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-2 ${betCost >= 2 ? "active" : "inactive"}`}
        onClick={() => onClick(betCost === 2 ? 1 : 2)}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-1 active ${betCost === 1 ? "disabled" : ""}`}
        onClick={() => onClick(1)}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-2 ${betCost >= 2 ? "active" : "inactive"}`}
        onClick={() => onClick(betCost === 2 ? 1 : 2)}
      />
      <button
        type="button"
        className={`machine-heart machine-heart-3 ${betCost >= 3 ? "active" : "inactive"}`}
        onClick={() => onClick(betCost === 3 ? 2 : 3)}
      />
    </div>
  );
}
