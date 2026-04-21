import Scene from ".";

import Enemy, { type Props as EnemyProps } from "@/components/Enemy";
import Knight, { type Props as KnightProps } from "@/components/Knight";
import HealthBar from "@/components/HealthBar";
import GoldCounter from "@/components/GoldCounter";

import type { Enemy as EnemyType, Battle, Run } from "@/types/game";

type Props = {
  player: Pick<Run, "health"> & Pick<Battle, "playerNextActions">;
  enemy: EnemyType;
  playerRef: KnightProps["ref"];
  enemyRef: EnemyProps["ref"];
  gold: number;
  levelIndex: number;
};

export default function BattleScene({
  player,
  enemy,
  playerRef,
  enemyRef,
  gold,
  levelIndex,
}: Props) {
  return (
    <Scene type="battle">
      <div className="level-indicator">Fight n°{levelIndex + 1}</div>
      <HealthBar
        variant="hero"
        value={player.health.value}
        maxValue={player.health.max}
      />
      <GoldCounter value={gold} />
      <HealthBar
        variant="enemy"
        value={enemy.health.value}
        maxValue={enemy.health.max}
      />
      <Knight
        ref={playerRef}
        nextActions={player.playerNextActions}
        defaultAnimation={player.health.value === 0 ? "dead" : "idle"}
      />

      <Enemy
        ref={enemyRef}
        type={enemy.type}
        nextActions={enemy.nextActions}
        defaultAnimation={enemy.health.value === 0 ? "dead" : "idle"}
      />
    </Scene>
  );
}
