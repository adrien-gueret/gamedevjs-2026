import MachineSymbol from "@/components/MachineSymbol";
import Tooltip from "@/components/Tooltip";

import type {
  NextAction,
  ReelSymbol,
  EnnemyType,
  PlayerType,
} from "@/types/game";

import "./style.css";

type Props = {
  nextActions: NextAction[];
  type: EnnemyType | PlayerType;
};

export default function NextActions({ nextActions, type }: Props) {
  return (
    <div className={`next-actions next-actions-${type}`}>
      {nextActions.map((action, index) => {
        const actionTypeToSymbolType: Record<NextAction["type"], ReelSymbol> = {
          attack: "Sword",
          defend: "Shield",
          sleep: "Sleep",
        };

        const actionTypeToLabel: Record<NextAction["type"], React.ReactNode> = {
          attack: (
            <>
              Will <b style={{ color: "red" }}>attack</b> for{" "}
              <b style={{ color: "cyan" }}>{action.value}</b> damage
            </>
          ),
          defend: (
            <>
              Will <b style={{ color: "lightgreen" }}>block</b> next{" "}
              <b style={{ color: "cyan" }}>{action.value}</b> damage
            </>
          ),
          sleep: <>Will do nothing</>,
        };

        return (
          <Tooltip key={index} label={actionTypeToLabel[action.type]}>
            <div
              className="next-action"
              style={{ animationDelay: `${index * 0.4}s` }}
            >
              <div className="next-action-type">
                <MachineSymbol symbol={actionTypeToSymbolType[action.type]} />
              </div>
              <div className="next-action-value">{action.value}</div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
