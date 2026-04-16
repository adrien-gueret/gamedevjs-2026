import { useImperativeHandle, useRef, useCallback } from "react";

import MachineSymbol from "@/components/MachineSymbol";
import Sprite, { type SpriteHandle } from "@/components/Sprite";

import type { EnnemyType, EnemyNextAction, ReelSymbol } from "@/types/game";

import "./style.css";
import Tooltip from "../Tooltip";

const BASE_ANIMATION_IDLE = [0, 1];
const BASE_POSE_ATTACKED = 2;
const BASE_POSE_DEAD = 3;

export type AnimationName = "idle" | "attacked" | "dead";

export type EnemyHandle = {
  setDead: () => void;
};

type FullAnimationName = `base_${AnimationName}`;

type Props = {
  ref?: React.Ref<EnemyHandle>;
  type: EnnemyType;
  nextActions: EnemyNextAction[];
};

export default function Enemy({ ref, type, nextActions }: Props) {
  const localRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<SpriteHandle<string>>(null);

  const getFullAnimationName = useCallback(
    (animationName: AnimationName): FullAnimationName => {
      const fullAnimationName: FullAnimationName = `base_${animationName}`;

      return fullAnimationName;
    },
    [],
  );

  const setDead: EnemyHandle["setDead"] = useCallback(() => {
    spriteRef.current?.setAnimation(getFullAnimationName("dead"));
  }, [getFullAnimationName]);

  useImperativeHandle(
    ref,
    () => ({
      setDead,
    }),
    [setDead],
  );

  return (
    <div className="enemy" ref={localRef}>
      <div className={`enemy-next-actions enemy-next-actions-${type}`}>
        {nextActions.map((action, index) => {
          const actionTypeToSymboleType: Record<
            EnemyNextAction["type"],
            ReelSymbol
          > = {
            attack: "Sword",
            defend: "Shield",
            none: "Empty",
          };

          const actionTypeToLabel: Record<
            EnemyNextAction["type"],
            React.ReactNode
          > = {
            attack: (
              <>
                Will <b style={{ color: "red" }}>attack</b> for{" "}
                <b style={{ color: "cyan" }}>{action.value}</b> damage
              </>
            ),
            defend: (
              <>
                Will <b style={{ color: "lightgreen" }}>block</b> next{" "}
                <b style={{ color: "cyan" }}>{action.value}</b> damage
              </>
            ),
            none: <>Will do nothing</>,
          };

          return (
            <Tooltip key={index} label={actionTypeToLabel[action.type]}>
              <div className="enemy-next-action">
                <div className="enemy-next-action-type">
                  <MachineSymbol
                    symbol={actionTypeToSymboleType[action.type]}
                  />
                </div>
                <div className="enemy-next-action-value">{action.value}</div>
              </div>
            </Tooltip>
          );
        })}
      </div>
      <Sprite
        ref={spriteRef}
        imgSrc={`./images/characters/${type}.png`}
        tileHeight={32}
        tileWidth={32}
        tileSeparationX={0}
        tileSeparationY={0}
        animations={[
          {
            name: "base_idle",
            tiles: BASE_ANIMATION_IDLE,
            duration: 750,
          },
          {
            name: "base_dead",
            tiles: [BASE_POSE_DEAD],
          },
        ]}
        defaultAnimation={getFullAnimationName("idle")}
        scale={3}
      />
    </div>
  );
}
