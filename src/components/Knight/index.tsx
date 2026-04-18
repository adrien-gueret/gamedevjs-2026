import { useImperativeHandle, useRef, useCallback } from "react";

import NextActions from "@/components/NextActions";
import Sprite, { type SpriteHandle } from "@/components/Sprite";

import type { NextAction } from "@/types/game";

import "./style.css";

const BASE_ANIMATION_IDLE = [0, 1];
const BASE_ANIMATION_WALKING = [1, 2, 0, 3];
const BASE_POSE_DEAD = 4;
const BASE_POSE_ATTACKING = 5;

export type AnimationName = "idle" | "walking" | "attacking" | "dead";

export type KnightHandle = {
  attack: (onAttackEnd: () => void) => Promise<Animation>;
  setDead: () => HTMLDivElement;
  setAttacked: () => void;
  setIdle: () => void;
};

type FullAnimationName = `base_${AnimationName}`;

export type Props = {
  ref?: React.Ref<KnightHandle>;
  nextActions: NextAction[];
};

export default function Knight({ ref, nextActions }: Props) {
  const localRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<SpriteHandle<string>>(null);

  const getFullAnimationName = useCallback(
    (animationName: AnimationName): FullAnimationName => {
      const fullAnimationName: FullAnimationName = `base_${animationName}`;

      return fullAnimationName;
    },
    [],
  );

  const setDead: KnightHandle["setDead"] = useCallback(() => {
    spriteRef.current?.setAnimation(getFullAnimationName("dead"));
    return localRef.current!;
  }, [getFullAnimationName]);

  const attack: KnightHandle["attack"] = useCallback(
    async (onAttackEnd) => {
      spriteRef.current?.setAnimation(getFullAnimationName("attacking"));

      const attackAnimation = localRef.current!.animate(
        [
          {
            transform: `translate(100px, 0px)`,
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

      spriteRef.current?.setAnimation(getFullAnimationName("walking"));

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

      spriteRef.current?.setAnimation(getFullAnimationName("idle"));

      return results;
    },
    [getFullAnimationName],
  );

  const setIdle: KnightHandle["setIdle"] = useCallback(() => {
    spriteRef.current?.setAnimation(getFullAnimationName("idle"));
  }, [getFullAnimationName]);

  const setAttacked: KnightHandle["setAttacked"] = useCallback(() => {
    const flashAnimation = localRef.current!.animate(
      [
        { transform: "translate(0px, 0px)", filter: "brightness(1)" },
        {
          transform: "translate(-10px, 0px)",
          filter: "brightness(0) invert(1)",
        },
        { transform: "translate(7px, 0px)", filter: "brightness(1)" },
        {
          transform: "translate(-5px, 0px)",
          filter: "brightness(0) invert(1)",
        },
        { transform: "translate(3px, 0px)", filter: "brightness(1)" },
        {
          transform: "translate(-2px, 0px)",
          filter: "brightness(0) invert(1)",
        },
        { transform: "translate(0px, 0px)", filter: "brightness(1)" },
      ],
      {
        duration: 500,
        easing: "ease-out",
        fill: "forwards",
      },
    );

    return flashAnimation.finished;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      attack,
      setDead,
      setIdle,
      setAttacked,
    }),
    [attack, setDead, setIdle, setAttacked],
  );

  return (
    <div className="knight" ref={localRef}>
      <NextActions nextActions={nextActions} type="knight" />
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
