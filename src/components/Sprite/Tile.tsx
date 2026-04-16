type Props = {
  ref?: React.Ref<HTMLDivElement>;
  width: number;
  height: number;
  imgSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  sheetPositionX?: number;
  sheetPositionY?: number;
};

export default function Tile({
  ref,
  width,
  height,
  imgSrc,
  imageWidth,
  imageHeight,
  sheetPositionX = 0,
  sheetPositionY = 0,
}: Props) {
  return (
    <div
      className="tile"
      ref={ref}
      style={{
        width,
        height,
        backgroundImage: imgSrc ? `url(${imgSrc})` : undefined,
        backgroundSize:
          imageWidth && imageHeight
            ? `${imageWidth}px ${imageHeight}px`
            : undefined,
        backgroundPosition: `-${sheetPositionX}px -${sheetPositionY}px`,
      }}
    />
  );
}
