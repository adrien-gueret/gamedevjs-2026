import type { DevilDealType, DevilDealCost } from "@/types/game";
import type { ReactNode } from "react";

type Props = { dealType: DevilDealType; cost: DevilDealCost };

export default function DealLabel({ dealType, cost }: Props) {
  let costLabel: ReactNode = null;

  switch (cost.type) {
    case "gold":
      costLabel = (
        <>
          <hr />
          Cost: <b style={{ color: "cyan" }}>{cost.value}</b>{" "}
          <b style={{ color: "gold" }}>gold</b>
        </>
      );
      break;

    case "health":
      costLabel = (
        <>
          <hr />
          Cost: <b style={{ color: "cyan" }}>{cost.value}</b>{" "}
          <b style={{ color: "lightcoral" }}>MAX health</b>
        </>
      );
      break;

    case "reel":
      costLabel = (
        <>
          <hr />
          Cost: force to add <b style={{ color: "cyan" }}>{cost.value}</b>{" "}
          <b style={{ color: "orange" }}>malus</b> in your machine
        </>
      );
      break;
  }

  switch (dealType) {
    case "betterBet1":
      return (
        <>
          Allow to bet more health before spinning the reels,
          <br />
          so that <b style={{ color: "gold" }}>all three lines</b> are taken
          into account.
          {costLabel}
        </>
      );
    case "betterBet2":
      return (
        <>
          Allow to bet more health before spinning the reels,
          <br />
          so that <b style={{ color: "gold" }}>diagonals</b> are also taken into
          account.
          {costLabel}
        </>
      );
    case "lockReel":
      return (
        <>
          Allow to lock one reel before spinning, so that it won't spin at all.
          {costLabel}
        </>
      );
    case "moreHealth1":
      return (
        <>
          Increase max <b style={{ color: "lightcoral" }}>health</b> by{" "}
          <b style={{ color: "cyan" }}>10</b>.{costLabel}
        </>
      );
    case "moreHealth2":
      return (
        <>
          Increase max <b style={{ color: "lightcoral" }}>health</b> by{" "}
          <b style={{ color: "cyan" }}>10</b> more.
          {costLabel}
        </>
      );
    case "moreHealth3":
      return (
        <>
          Increase again max <b style={{ color: "lightcoral" }}>health</b> by{" "}
          <b style={{ color: "cyan" }}>10</b> more.
          {costLabel}
        </>
      );
    case "unlockSkeleton":
      return (
        <>
          Unlock a new character: the <b style={{ color: "cyan" }}>Skeleton</b>.
          {costLabel}
        </>
      );
    case "unlockWizard":
      return (
        <>
          Unlock a new character: the <b style={{ color: "cyan" }}>Wizard</b>.
          {costLabel}
        </>
      );
    case "destroyReelSymbol":
      return (
        <>
          <b style={{ color: "gold" }}>Destroy</b> completely one symbol from
          the machine, reducing its reel.
          {costLabel}
        </>
      );
    case "replaceReelSymbol":
      return (
        <>
          <b style={{ color: "gold" }}>Pick</b> a new symbol to add to the
          machine, replacing an existing one.
          {costLabel}
        </>
      );
    case "passiveDefense":
      return (
        <>
          A passive effect that gives you <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "lightgreen" }}>block</b> each turn.
          {costLabel}
        </>
      );
    case "passiveAttack":
      return (
        <>
          A passive effect that gives you <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "red" }}>attack</b> each turn.
          {costLabel}
        </>
      );

    default:
      return <>Do nothing</>;
  }
}
