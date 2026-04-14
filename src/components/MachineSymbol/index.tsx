import "./style.css";

import type { ReelSymbol } from "@/types/game";

type Props = {
  symbol: ReelSymbol;
  isActive?: boolean;
  celebrationLevel?: "normal" | "double" | "triple";
};

export default function MachineSymbol({
  symbol,
  isActive = false,
  celebrationLevel = "normal",
}: Props) {
  return (
    <div
      className={`machine-symbol machine-symbol-${symbol.toLocaleLowerCase()}${isActive ? " is-active" : ""}${isActive ? ` is-${celebrationLevel}` : ""}`}
    >
      {symbol}
    </div>
  );
}
