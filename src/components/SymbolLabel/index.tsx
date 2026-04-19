import type { ReelSymbol } from "@/types/game";

export default function SymbolLabel({ symbol }: { symbol: ReelSymbol }) {
  switch (symbol) {
    case "Sword":
      return (
        <>
          Gain <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "red" }}>attack</b>
        </>
      );
    case "Shield":
      return (
        <>
          Gain <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "lightgreen" }}>block</b>
        </>
      );
    case "Coin":
      return (
        <>
          Gain <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "gold" }}>gold</b>
        </>
      );
    case "Heart":
      return (
        <>
          Heal <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "lightcoral" }}>health</b>
        </>
      );
    case "Evil-Heart":
      return (
        <>
          Heal <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "lightcoral" }}>health</b> to{" "}
          <b style={{ color: "orange" }}>the enemy</b>
        </>
      );
    case "Evil-Shield":
      return (
        <>
          Give <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "lightgreen" }}>block</b> to{" "}
          <b style={{ color: "orange" }}>the enemy</b>
        </>
      );
    case "Evil-Sword":
      return (
        <>
          Give <b style={{ color: "cyan" }}>1</b>{" "}
          <b style={{ color: "red" }}>attack</b> to{" "}
          <b style={{ color: "orange" }}>the enemy</b>
        </>
      );
    case "Sleep":
    default:
      return <>Do nothing</>;
  }
}
