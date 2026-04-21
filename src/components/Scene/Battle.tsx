import Scene from ".";

import Enemy, { type Props as EnemyProps } from "@/components/Enemy";
import Player, { type Props as PlayerProps } from "@/components/Player";
import HealthBar from "@/components/HealthBar";
import GoldCounter from "@/components/GoldCounter";

import type { Enemy as EnemyType, Battle, Run, PlayerType } from "@/types/game";

type Props = {
  player: Pick<Run, "health"> &
    Pick<Battle, "playerNextActions"> & { type: PlayerType };
  enemy: EnemyType;
  playerRef: PlayerProps["ref"];
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
      <Player
        ref={playerRef}
        nextActions={player.playerNextActions}
        defaultAnimation={player.health.value === 0 ? "dead" : "idle"}
        type={player.type}
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
