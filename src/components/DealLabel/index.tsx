import type { DevilDealType, DevilDealCost } from "@/types/game";
import type { ReactNode } from "react";

type Props = {
  dealType: DevilDealType;
  cost: DevilDealCost;
  isAffordable: boolean;
};

export default function DealLabel({ dealType, cost, isAffordable }: Props) {
  let costLabel: ReactNode = null;

  const notAffordable = isAffordable ? null : (
    <>
      {" "}
      <b style={{ color: "red" }}>(Not affordable)</b>
    </>
  );

  switch (cost.type) {
    case "gold":
      costLabel = (
        <>
          <hr />
          Cost: <b style={{ color: "cyan" }}>{cost.value}</b>{" "}
          <b style={{ color: "gold" }}>gold</b>
          {notAffordable}
        </>
      );
      break;

    case "health":
      costLabel = (
        <>
          <hr />
          Cost: <b style={{ color: "cyan" }}>{cost.value}</b>{" "}
          <b style={{ color: "lightcoral" }}>MAX health</b>
          {notAffordable}
        </>
      );
      break;

    case "reel":
      costLabel = (
        <>
          <hr />
          Cost: replace <b style={{ color: "cyan" }}>{cost.value}</b> bonus
          symbol
          {cost.value > 1 ? "s" : ""} with{" "}
          <b style={{ color: "#953297" }}>curse{cost.value > 1 ? "s" : ""}</b>{" "}
          symbol
          {notAffordable}
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
          Allow to lock the middle reel before spinning, so that it won't spin
          at all.
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
    case "superHeart":
      return (
        <>
          Unlock the <b style={{ color: "lightcoral" }}>improved heart</b>{" "}
          symbol, which heals <b style={{ color: "cyan" }}>2</b>{" "}
          <b style={{ color: "lightcoral" }}>health</b>.{costLabel}
        </>
      );
    case "superCoin":
      return (
        <>
          Unlock the <b style={{ color: "gold" }}>banknote</b> symbol, which
          gives <b style={{ color: "cyan" }}>2</b>{" "}
          <b style={{ color: "gold" }}>gold</b>.{costLabel}
        </>
      );
    case "superSword":
      return (
        <>
          Unlock the <b style={{ color: "red" }}>improved sword</b> symbol,
          which gives <b style={{ color: "cyan" }}>2</b>{" "}
          <b style={{ color: "red" }}>attack</b>.{costLabel}
        </>
      );
    case "superShield":
      return (
        <>
          Unlock the <b style={{ color: "lightgreen" }}>improved shield</b>{" "}
          symbol, which gives <b style={{ color: "cyan" }}>2</b>{" "}
          <b style={{ color: "lightgreen" }}>block</b>.{costLabel}
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
          <b style={{ color: "gold" }}>Replace</b> any symbol from your machine
          with a new one.
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
    case "passiveWantedToDie":
      return (
        <>
          Instantly die. Don't worry...
          <br />I promise to resurrect you, and I won't even charge you for that
          this time!
          {costLabel}
        </>
      );

    default:
      return <>Do nothing</>;
  }
}
