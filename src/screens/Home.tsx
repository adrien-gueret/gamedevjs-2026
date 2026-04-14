import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <h1>The Wizard's Machine</h1>
      <Link to="/play">Play</Link>
    </>
  );
}
