import "./style.css";

import type { ReelSymbol } from "@/types/game";

type Props = {
  symbol: ReelSymbol;
  isActive?: boolean;
};

export default function MachineSymbol({ symbol, isActive = false }: Props) {
  return (
    <div
      className={`machine-symbol machine-symbol-${symbol.toLocaleLowerCase()}${isActive ? " is-active" : ""}`}
    >
      {symbol}
    </div>
  );
}
