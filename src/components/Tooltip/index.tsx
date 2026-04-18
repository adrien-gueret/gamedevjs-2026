import { type ElementType, type ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";

import "./style.css";

type Props<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  label?: ReactNode | null;
  cursor?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "children">;

export default function Tooltip<T extends ElementType = "div">({
  as,
  children,
  label,
  cursor = "help",
  ...rest
}: Props<T>) {
  const Wrapper = as ?? "div";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapperRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const handleMouseEnter = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  };

  const handleMouseLeave = () => setCoords(null);

  if (!label) {
    return children;
  }

  return (
    <Wrapper
      {...rest}
      ref={wrapperRef}
      className="tooltip-wrapper"
      style={{ cursor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {coords &&
        createPortal(
          <span
            className="tooltip-label"
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
          >
            {label}
          </span>,
          document.body,
        )}
    </Wrapper>
  );
}
