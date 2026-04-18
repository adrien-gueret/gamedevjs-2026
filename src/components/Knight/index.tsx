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
  setHealing: () => Promise<Animation>;
};

type FullAnimationName = `base_${AnimationName}`;

export type Props = {
  ref?: React.Ref<KnightHandle>;
  nextActions: NextAction[];
  defaultAnimation?: AnimationName;
};

export default function Knight({
  ref,
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

  const setHealing: KnightHandle["setHealing"] = useCallback(() => {
    const el = localRef.current!;
    const circleCount = 10;
    const circles: HTMLElement[] = [];
    const promises: Promise<Animation>[] = [];

    for (let i = 0; i < circleCount; i++) {
      const circle = document.createElement("div");
      const size = 8 + Math.random() * 6;
      const xPercent = 5 + Math.random() * 90;
      const delay = i * 90 + Math.random() * 40;
      const rise = 60 + Math.random() * 60;
      const duration = 600 + Math.random() * 500;

      circle.style.cssText = `
        position:absolute;
        bottom:0;
        opacity:0;
        left:${xPercent}%;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:#4ade80;
        box-shadow:0 0 5px #4ade80, 0 0 10px #16a34a;
        pointer-events:none;
      `;
      circles.push(circle);
      el.appendChild(circle);

      const anim = circle.animate(
        [
          { transform: "translateY(0) scale(1)", opacity: 0.9 },
          { transform: `translateY(-${rise}px) scale(0.4)`, opacity: 0 },
        ],
        { duration, delay, easing: "ease-out", fill: "forwards" },
      );

      promises.push(anim.finished);
    }

    return Promise.all(promises).then((results) => {
      circles.forEach((c) => c.remove());
      return results[results.length - 1];
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      attack,
      setDead,
      setIdle,
      setAttacked,
      setHealing,
    }),
    [attack, setDead, setIdle, setAttacked, setHealing],
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
        defaultAnimation={getFullAnimationName(defaultAnimation)}
        scale={3}
      />
    </div>
  );
}
