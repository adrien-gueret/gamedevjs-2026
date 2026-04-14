import "./style.css";

type Props = {
  betCost: number;
};

export default function MachineHearts({ betCost }: Props) {
  return (
    <div className="machine-hearts">
      <div
        className={`machine-heart machine-heart-3 ${betCost >= 3 ? "is-active" : "disabled"}`}
      />
      <div
        className={`machine-heart machine-heart-2 ${betCost >= 2 ? "is-active" : "disabled"}`}
      />
      <div
        className={`machine-heart machine-heart-1 ${betCost >= 1 ? "is-active" : "disabled"}`}
      />
      <div
        className={`machine-heart machine-heart-2 ${betCost >= 2 ? "is-active" : "disabled"}`}
      />
      <div
        className={`machine-heart machine-heart-3 ${betCost >= 3 ? "is-active" : "disabled"}`}
      />
    </div>
  );
}
