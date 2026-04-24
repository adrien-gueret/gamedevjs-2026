import { Link, type LinkProps } from "react-router-dom";
import { type ButtonHTMLAttributes } from "react";
import { playSound } from "@/services/sounds";

import "./style.css";

type ButtonBaseProps = {
  as?: "link" | "button";
  children: React.ReactNode;
  imageName:
    | "start"
    | "spin"
    | "resurrect"
    | "skip"
    | "back"
    | "leave"
    | "leaderboard";
};

type LinkOnlyProps = ButtonBaseProps &
  Omit<LinkProps, "className"> & { as: "link" };

type ButtonOnlyProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    as?: "button";
  };

type Props = LinkOnlyProps | ButtonOnlyProps;

const imageNameToButtonSize: Record<
  ButtonBaseProps["imageName"],
  { width: number; height: number }
> = {
  start: { width: 135, height: 42 },
  spin: { width: 114, height: 42 },
  resurrect: { width: 135, height: 42 },
  skip: { width: 114, height: 42 },
  back: { width: 114, height: 42 },
  leave: { width: 135, height: 42 },
  leaderboard: { width: 222, height: 42 },
};

export default function Button({
  as = "button",
  children,
  imageName,
  ...otherProps
}: Props) {
  const imageStyle = `url(./images/buttons/${imageName}.png)`;
  const { width, height } = imageNameToButtonSize[imageName];

  if (as === "link") {
    const linkProps = otherProps as Omit<LinkProps, "className">;

    return (
      <Link
        className={`button-base`}
        style={{ backgroundImage: imageStyle, width, height }}
        {...linkProps}
        onClick={(event) => {
          linkProps.onClick?.(event);

          if (!event.defaultPrevented) {
            playSound("click");
          }
        }}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = otherProps as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className"
  >;

  return (
    <button
      className={`button-base`}
      style={{ backgroundImage: imageStyle, width, height }}
      type="button"
      {...buttonProps}
      onClick={(event) => {
        buttonProps.onClick?.(event);

        if (!event.defaultPrevented && !buttonProps.disabled) {
          playSound("click");
        }
      }}
    >
      {children}
    </button>
  );
}
