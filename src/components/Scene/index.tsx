import Enemy, { type Props as EnemyProps } from "@/components/Enemy";
import Knight, { type Props as KnightProps } from "@/components/Knight";
import HealthBar from "@/components/HealthBar";

import type { Enemy as EnemyType, Battle, Run } from "@/types/game";

import "./style.css";

type Props = {
  player: Pick<Run, "health"> & Pick<Battle, "playerNextActions">;
  enemy: EnemyType;
  playerRef: KnightProps["ref"];
  enemyRef: EnemyProps["ref"];
};

export default function Scene({ player, enemy, playerRef, enemyRef }: Props) {
  return (
    <div className="scene">
      <HealthBar
        variant="hero"
        value={player.health.value}
        maxValue={player.health.max}
      />
      <HealthBar
        variant="enemy"
        value={enemy.health.value}
        maxValue={enemy.health.max}
      />
      <Knight ref={playerRef} nextActions={player.playerNextActions} />
      <Enemy ref={enemyRef} type={enemy.type} nextActions={enemy.nextActions} />
    </div>
  );
}
