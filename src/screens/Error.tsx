import Screen from "@/components/Screen";
import { Link } from "react-router-dom";

import { usePersistentActions } from "@/services/state";

export default function Error() {
  const { setCurrentPathname } = usePersistentActions();
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
