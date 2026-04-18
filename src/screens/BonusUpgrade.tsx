import { useMemo } from "react";

import ChoiceItem from "@/components/ChoiceItem";
import Screen from "@/components/Screen";
import SymbolLabel from "@/components/SymbolLabel";
import MachineSymbol from "@/components/MachineSymbol";
import Tooltip from "@/components/Tooltip";

import { getRandomSymbols } from "@/services/upgrades";

export default function BonusUpgrade() {
  const symbols = useMemo(() => getRandomSymbols(), []);

  return (
    <Screen>
      <h2>Pick a symbol to add to your machine</h2>
      <div>
        {symbols.map((symbol, index) => (
          <Tooltip
            key={symbol}
            cursor="pointer"
            label={<SymbolLabel symbol={symbol} />}
          >
            <ChoiceItem delay={1.5 * index}>
              <MachineSymbol symbol={symbol} />
            </ChoiceItem>
          </Tooltip>
        ))}
      </div>
    </Screen>
  );
}
