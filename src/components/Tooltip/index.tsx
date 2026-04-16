import { type ElementType, type ReactNode } from "react";

import "./style.css";

type Props<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  label: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "children">;

export default function Tooltip<T extends ElementType = "div">({
  as,
  children,
  label,
  ...rest
}: Props<T>) {
  const Wrapper = as ?? "div";

  return (
    <Wrapper {...rest} className="tooltip-wrapper">
      {children}
      <span className="tooltip-label" role="tooltip">
        {label}
      </span>
    </Wrapper>
  );
}
