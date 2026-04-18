import "./style.css";

type Props = {
  value: number;
};

export default function GoldCounter({ value }: Props) {
  return (
    <div className="gold-counter">
      <div className="gold-counter-label">{value}</div>
    </div>
  );
}
