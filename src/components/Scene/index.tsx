import Enemy from "@/components/Enemy";
import Knight from "@/components/Knight";
import HealthBar from "@/components/HealthBar";

import type { Enemy as EnemyType, Health } from "@/types/game";

import "./style.css";

type Props = {
  heroLife: Health;
  enemy: EnemyType;
};

export default function Scene({ heroLife, enemy }: Props) {
  return (
    <div className="scene">
      <HealthBar
        variant="hero"
        value={heroLife.value}
        maxValue={heroLife.max}
      />
      <HealthBar
        variant="enemy"
        value={enemy.health.value}
        maxValue={enemy.health.max}
      />
      <Knight />
      <Enemy type={enemy.type} nextActions={enemy.nextActions} />
    </div>
  );
}
