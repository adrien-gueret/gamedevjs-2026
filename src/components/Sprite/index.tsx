import {
  useRef,
  useMemo,
  useCallback,
  useState,
  useImperativeHandle,
  use,
  Suspense,
  useLayoutEffect,
} from "react";

import Tile from "./Tile";

import "./style.css";

type AnimationBase<AnimationName extends string> = {
  name: AnimationName;
  tiles: number[];
  duration?: number;
};

type AnimationWithMultipleFrames<AnimationName extends string> =
  AnimationBase<AnimationName> & {
    tiles: number[];
    duration: number;
  };

type AnimationWithSingleFrame<AnimationName extends string> =
  AnimationBase<AnimationName> & {
    tiles: [number];
    duration?: never;
  };

type AnimationDefinition<AnimationName extends string> =
  | AnimationWithMultipleFrames<AnimationName>
  | AnimationWithSingleFrame<AnimationName>;

export type SpriteHandle<AnimationName extends string = string> = {
  setAnimation: (
    animationName: AnimationName,
    iterations?: number,
  ) => Animation | false;
  stopAnimation: () => void;
  setTile: (tileIndex: number) => void;
};

export type Props<AnimationName extends string = string> = {
  tileWidth: number;
  tileHeight: number;
  tileSeparationX?: number;
  tileSeparationY?: number;
  imgSrc: string;
  scale?: number;
  defaultTile?: number;
  defaultAnimation?: AnimationName;
  animations?: AnimationDefinition<AnimationName>[];
  ref?: React.Ref<SpriteHandle<AnimationName>>;
};

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(imageSrc: string): Promise<HTMLImageElement> {
  if (imageCache.has(imageSrc)) {
    return imageCache.get(imageSrc)!;
  }

  const image = new Image();
  image.src = imageSrc;

  if (image.complete) {
    const resolvedPromise = Promise.resolve(image);
    imageCache.set(imageSrc, resolvedPromise);
    return resolvedPromise;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener(
      "error",
      (error) => {
        imageCache.delete(imageSrc);
        reject(error);
      },
      { once: true },
    );
  });

  imageCache.set(imageSrc, promise);
  return promise;
}

function Sprite<AnimationName extends string>({
  tileWidth,
  tileHeight,
  tileSeparationX = 0,
  tileSeparationY = 0,
  imgSrc,
  scale = 1,
  defaultTile = 0,
  animations = [],
  defaultAnimation,
  ref,
}: Props<AnimationName>) {
  const imagePromise = useMemo(() => loadImage(imgSrc), [imgSrc]);

  const spriteImage: HTMLImageElement = use(imagePromise);

  const localRef = useRef<HTMLDivElement | null>(null);
  const runningAnimation = useRef<Animation | null>(null);

  const getTileRect = useCallback(
    (
      tileIndex: number,
    ): {
      x: number;
      y: number;
      width: number;
      height: number;
    } => {
      const { naturalWidth } = spriteImage;
      const totalTilesOnRow = Math.ceil(
        naturalWidth / (tileWidth + tileSeparationX),
      );

      const row = Math.floor(tileIndex / totalTilesOnRow);
      const column = tileIndex % totalTilesOnRow;

      return {
        x: column * tileWidth * scale + column * tileSeparationX * scale,
        y: row * tileHeight * scale + row * tileSeparationY * scale,
        width: tileWidth * scale,
        height: tileHeight * scale,
      };
    },
    [
      spriteImage,
      tileWidth,
      tileHeight,
      tileSeparationX,
      tileSeparationY,
      scale,
    ],
  );

  const [tileRect, setTileRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>(() => getTileRect(defaultTile));

  const stopAnimation = useCallback(() => {
    if (runningAnimation.current) {
      runningAnimation.current.cancel();
    }
  }, []);

  const setAnimation = useCallback(
    (
      animationName: AnimationName,
      iterations: number = Infinity,
    ): Animation | false => {
      let animation = animations.find((a) => a.name === animationName);

      if (!animation) {
        console.warn(`Animation "${animationName}" not found.`);
        return false;
      }

      stopAnimation();

      const element = localRef.current;
      if (!element) {
        return false;
      }

      const tileCount = animation.tiles.length;

      if (tileCount === 1) {
        setTile(animation.tiles[0]);
        return false;
      }

      const keyFrames = animation.tiles
        .map((tileIndex, i) => {
          const tileRect = getTileRect(tileIndex);
          const start = i / tileCount;
          const end = (i + 1) / tileCount;

          return [
            {
              backgroundPosition: `-${tileRect.x}px -${tileRect.y}px`,
              offset: start,
            },
            {
              backgroundPosition: `-${tileRect.x}px -${tileRect.y}px`,
              offset: end - 0.0001,
            },
          ];
        })
        .flat();

      runningAnimation.current = element.animate(keyFrames, {
        duration: animation.duration,
        iterations,
        easing: `steps(${animation.tiles.length}, end)`,
      });

      return runningAnimation.current;
    },
    [animations, stopAnimation, getTileRect],
  );

  const setTile = useCallback(
    (tileIndex: number) => {
      stopAnimation();
      setTileRect(getTileRect(tileIndex));
    },
    [stopAnimation, getTileRect],
  );

  useLayoutEffect(() => {
    if (runningAnimation.current === null && defaultAnimation) {
      setAnimation(defaultAnimation);
    }
  }, [defaultAnimation, setAnimation]);

  useImperativeHandle(ref, () => ({
    setAnimation,
    stopAnimation,
    setTile,
  }));

  return (
    <Tile
      ref={localRef}
      width={tileRect.width}
      height={tileRect.height}
      imgSrc={imgSrc}
      imageWidth={spriteImage.naturalWidth * scale}
      imageHeight={spriteImage.naturalHeight * scale}
      sheetPositionX={tileRect.x}
      sheetPositionY={tileRect.y}
    />
  );
}

export default function SpriteContainer<AnimationName extends string>(
  props: Props<AnimationName>,
) {
  const { tileWidth, tileHeight, scale = 1 } = props;

  return (
    <Suspense
      fallback={<Tile width={tileWidth * scale} height={tileHeight * scale} />}
    >
      <Sprite {...props} />
    </Suspense>
  );
}
