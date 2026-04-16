import { useImperativeHandle, useRef, useCallback } from "react";

import Sprite, { type SpriteHandle } from "@/components/Sprite";

import "./style.css";

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
};

export default function Enemy({ ref }: Props) {
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
      <Sprite
        ref={spriteRef}
        imgSrc="./images/characters/rat.png"
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
