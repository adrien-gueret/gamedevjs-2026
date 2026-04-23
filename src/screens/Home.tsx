import Button from "@/components/Button";
import HomeDevil from "@/components/HomeDevil";
import Screen from "@/components/Screen";

import { useWavedashLeaderboardEntries } from "@/services/wavedash";

export default function Home() {
  const leaderboard = useWavedashLeaderboardEntries();

  return (
    <Screen>
      <HomeDevil>
        <h1 style={{ fontSize: "48px" }}>The Devil's Machine</h1>
        <Button imageName="start" as="link" to="/start">
          Start
        </Button>

        {leaderboard.length > 0 && (
          <div style={{ marginTop: "48px" }}>
            <Button imageName="leaderboard" as="link" to="/leaderboard">
              Hall of the damned
            </Button>
          </div>
        )}
      </HomeDevil>
    </Screen>
  );
}
