import { Link } from "react-router-dom";

import Screen from "@/components/Screen";

export default function Home() {
  return (
    <Screen>
      <h1>The Devil's Machine</h1>
      <Link to="/start">Start</Link>
    </Screen>
  );
}
