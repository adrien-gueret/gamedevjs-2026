import "./style.css";

type Props = {
  variant: "hero" | "enemy";
  value: number;
  maxValue: number;
};

export default function HealthBar({ variant, value, maxValue }: Props) {
  return (
    <div className={`health-bar health-bar-${variant}`}>
      <div className="health-bar-container">
        <div
          className="health-bar-fill"
          style={{ width: `${(value / maxValue) * 100}%` }}
        />
        <div className="health-bar-label">{`${value}/${maxValue}`}</div>
      </div>
    </div>
  );
}
