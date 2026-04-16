import Enemy from "@/components/Enemy";
import Knight from "@/components/Knight";
import HealthBar from "@/components/HealthBar";

import "./style.css";

type Life = {
  value: number;
  maxValue: number;
};

type Props = {
  heroLife: Life;
  enemyLife: Life;
};

export default function Scene({ heroLife, enemyLife }: Props) {
  return (
    <div className="scene">
      <HealthBar
        variant="hero"
        value={heroLife.value}
        maxValue={heroLife.maxValue}
      />
      <HealthBar
        variant="enemy"
        value={enemyLife.value}
        maxValue={enemyLife.maxValue}
      />
      <Knight />
      <Enemy />
    </div>
  );
}
