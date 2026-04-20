import type { EnemyType } from "@/types/game";

export default function EnemyLabel({ enemyType }: { enemyType: EnemyType }) {
  switch (enemyType) {
    case "rat":
      return (
        <>
          <b style={{ color: "darkorange" }}>Rat</b> - A basic enemy, not very
          dangerous!
        </>
      );

    case "blob":
      return (
        <>
          <b style={{ color: "darkorange" }}>Blob</b> - At the end of each turn,
          two visible symbols in your machine are{" "}
          <b style={{ color: "#953297" }}>glued</b>.
        </>
      );

    case "skeleton":
      return (
        <>
          <b style={{ color: "darkorange" }}>Skeleton</b> - At the end of each
          turn, the middle symbol of your machine is{" "}
          <b style={{ color: "#953297" }}>cursed</b>.
        </>
      );

    case "wizard":
      return (
        <>
          <b style={{ color: "darkorange" }}>Wizard</b> - At the end of each
          turn, add a random <b style={{ color: "#953297" }}>cursed</b> symbol
          to your machine.
        </>
      );

    default:
      return null;
  }
}
