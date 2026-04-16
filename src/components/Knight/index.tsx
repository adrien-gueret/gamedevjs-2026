import { useImperativeHandle, useRef, useCallback } from "react";

import Sprite, { type SpriteHandle } from "@/components/Sprite";

import "./style.css";

const BASE_ANIMATION_IDLE = [0, 1];
const BASE_ANIMATION_WALKING = [1, 2, 0, 3];
const BASE_POSE_DEAD = 4;
const BASE_POSE_ATTACKING = 5;

export type AnimationName = "idle" | "walking" | "attacking" | "dead";

type Point = {
  x: number;
  y: number;
};

export type KnightHandle = {
  moveBy: (
    offset: Partial<Point>,
    durationInMs?: number,
    animationName?: AnimationName,
  ) => Promise<Animation | false>;
  setDead: () => void;
};

type FullAnimationName = `base_${AnimationName}`;

type Props = {
  ref?: React.Ref<KnightHandle>;
};

export default function Knight({ ref }: Props) {
  const localRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<SpriteHandle<string>>(null);
  const currentPosition = useRef({ x: 0, y: 0 });

  const getFullAnimationName = useCallback(
    (animationName: AnimationName): FullAnimationName => {
      const fullAnimationName: FullAnimationName = `base_${animationName}`;

      return fullAnimationName;
    },
    [],
  );

  const setDead: KnightHandle["setDead"] = useCallback(() => {
    spriteRef.current?.setAnimation(getFullAnimationName("dead"));
  }, [getFullAnimationName]);

  const moveBy: KnightHandle["moveBy"] = useCallback(
    async (offset, durationInMs = 1000, animationName = "walking") => {
      if (!localRef.current) return false;

      spriteRef.current?.setAnimation(getFullAnimationName(animationName));

      const newX = currentPosition.current.x + (offset.x ?? 0);
      const newY = currentPosition.current.y + (offset.y ?? 0);

      const animation = localRef.current.animate(
        [
          {
            transform: `translate(${newX}px, ${newY}px)`,
          },
        ],
        {
          duration: durationInMs,
          easing: "linear",
          fill: "forwards",
        },
      );

      const result = await animation.finished;

      currentPosition.current = { x: newX, y: newY };

      return result;
    },
    [getFullAnimationName],
  );

  useImperativeHandle(
    ref,
    () => ({
      moveBy,
      setDead,
    }),
    [moveBy, setDead],
  );

  return (
    <div className="knight" ref={localRef}>
      <Sprite
        ref={spriteRef}
        imgSrc="./images/characters/knight.png"
        tileHeight={32}
        tileWidth={32}
        tileSeparationX={1}
        tileSeparationY={1}
        animations={[
          {
            name: "base_idle",
            tiles: BASE_ANIMATION_IDLE,
            duration: 750,
          },
          {
            name: "base_walking",
            tiles: BASE_ANIMATION_WALKING,
            duration: 750,
          },
          {
            name: "base_attacking",
            tiles: [BASE_POSE_ATTACKING],
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
