import { useImperativeHandle, useRef, useCallback } from "react";

import NextActions from "@/components/NextActions";
import Sprite, { type SpriteHandle } from "@/components/Sprite";

import type { EnnemyType, NextAction } from "@/types/game";

import "./style.css";

const BASE_ANIMATION_IDLE = [0, 1];
const BASE_POSE_ATTACKED = 2;
const BASE_POSE_DEAD = 3;

export type AnimationName = "idle" | "attacked" | "dead";

export type EnemyHandle = {
  attack: (onAttackEnd: () => void) => Promise<Animation>;
  setDead: () => void;
  setAttacked: () => void;
  setIdle: () => void;
};

type FullAnimationName = `base_${AnimationName}`;

export type Props = {
  ref?: React.Ref<EnemyHandle>;
  type: EnnemyType;
  nextActions: NextAction[];
  defaultAnimation?: AnimationName;
};

export default function Enemy({
  ref,
  type,
  nextActions,
  defaultAnimation = "idle",
}: Props) {
  const localRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<SpriteHandle<string>>(null);

  const getFullAnimationName = useCallback(
    (animationName: AnimationName): FullAnimationName => {
      const fullAnimationName: FullAnimationName = `base_${animationName}`;

      return fullAnimationName;
    },
    [],
  );

  const attack: EnemyHandle["attack"] = useCallback(
    async (onAttackEnd) => {
      spriteRef.current?.setAnimation(getFullAnimationName("idle"));

      const attackAnimation = localRef.current!.animate(
        [
          {
            transform: `translate(-100px, 0px)`,
          },
        ],
        {
          duration: 300,
          easing: "ease-in",
          fill: "forwards",
        },
      );

      await attackAnimation.finished;

      onAttackEnd();

      const goBackAnimation = localRef.current!.animate(
        [
          {
            transform: `translate(0px, 0px)`,
          },
        ],
        {
          duration: 500,
          easing: "ease-in",
          fill: "forwards",
        },
      );

      const results = await goBackAnimation.finished;

      return results;
    },
    [getFullAnimationName],
  );

  const setDead: EnemyHandle["setDead"] = useCallback(() => {
    spriteRef.current?.setAnimation(getFullAnimationName("dead"));
  }, [getFullAnimationName]);

  const setAttacked: EnemyHandle["setAttacked"] = useCallback(() => {
    spriteRef.current?.setAnimation(getFullAnimationName("attacked"));
  }, [getFullAnimationName]);

  const setIdle: EnemyHandle["setIdle"] = useCallback(() => {
    spriteRef.current?.setAnimation(getFullAnimationName("idle"));
  }, [getFullAnimationName]);

  useImperativeHandle(
    ref,
    () => ({
      attack,
      setDead,
      setAttacked,
      setIdle,
    }),
    [attack, setDead, setAttacked, setIdle],
  );

  return (
    <div className="enemy" ref={localRef}>
      <NextActions nextActions={nextActions} type={type} />
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
            name: "base_attacked",
            tiles: [BASE_POSE_ATTACKED],
          },
          {
            name: "base_dead",
            tiles: [BASE_POSE_DEAD],
          },
        ]}
        defaultAnimation={getFullAnimationName(defaultAnimation)}
        scale={3}
      />
    </div>
  );
}
