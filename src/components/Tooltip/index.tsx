import {
  type ElementType,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
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

  const tooltipRef = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || !coords) return;
      const rootEl = document.getElementById("root");
      if (!rootEl) return;
      const rootRect = rootEl.getBoundingClientRect();
      const rootLeft = rootRect.left + window.scrollX;
      const rootRight = rootRect.right + window.scrollX;
      const halfWidth = node.offsetWidth / 2;
      let adjustedLeft = coords.left;
      if (adjustedLeft - halfWidth < rootLeft) {
        adjustedLeft = rootLeft + halfWidth;
      } else if (adjustedLeft + halfWidth > rootRight) {
        adjustedLeft = rootRight - halfWidth;
      }
      node.style.left = `${adjustedLeft}px`;
    },
    [coords],
  );

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
            ref={tooltipRef}
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
