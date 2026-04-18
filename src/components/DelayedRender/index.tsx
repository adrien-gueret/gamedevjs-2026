import { useEffect, useState } from "react";
import "./style.css";

type Props = {
  children?: React.ReactNode;
  delay?: number;
};

export default function DelayedRender({ children, delay = 0 }: Props) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldRender) return null;

  return <>{children}</>;
}
