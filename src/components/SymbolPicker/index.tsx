import ChoiceItem from "@/components/ChoiceItem";
import MachineSymbol from "@/components/MachineSymbol";
import SymbolLabel from "@/components/SymbolLabel";
import Tooltip from "@/components/Tooltip";

import type { ReelSymbol } from "@/types/game";

type Props = {
  symbols: ReelSymbol[];
  onSelect: (symbol: ReelSymbol) => void;
};

export default function SymbolPicker({ symbols, onSelect }: Props) {
  return (
    <div>
      {symbols.map((symbol, index) => (
        <Tooltip
          key={symbol}
          cursor="pointer"
          label={<SymbolLabel symbol={symbol} />}
        >
          <ChoiceItem delay={1.5 * index} onClick={() => onSelect(symbol)}>
            <MachineSymbol symbol={symbol} />
          </ChoiceItem>
        </Tooltip>
      ))}
    </div>
  );
}
