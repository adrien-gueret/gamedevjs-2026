import Screen from "@/components/Screen";
import { Link } from "react-router-dom";

import { setCurrentPathname } from "@/services/actions";

export default function Error() {
  return (
    <Screen>
      <h2>An error occurred</h2>
      <p>Sorry, something went wrong. Try restarting the game!</p>
      <Link onClick={() => setCurrentPathname("/start")} to="/start">
        Play
      </Link>
    </Screen>
  );
}
