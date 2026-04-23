import Button from "@/components/Button";

import Screen from "@/components/Screen";

import {
  useWavedash,
  useWavedashLeaderboardEntries,
} from "@/services/wavedash";

export default function Leaderboard() {
  const wavedash = useWavedash();
  const leaderboard = useWavedashLeaderboardEntries();

  return (
    <Screen>
      <h1 style={{ fontSize: "48px" }}>Hall of the Damned</h1>

      {leaderboard.length > 0 && (
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th colSpan={2}>Soul</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => {
                const userAvatarUrl = wavedash!.getUserAvatarUrl(
                  entry.userId,
                  0,
                );

                return (
                  <tr key={entry.userId}>
                    <td>#{entry.globalRank}</td>
                    <td>
                      {userAvatarUrl && <img src={userAvatarUrl} alt="" />}
                    </td>
                    <td>{entry.username}</td>
                    <td>{entry.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Button imageName="back" as="link" to="/">
        Back
      </Button>
    </Screen>
  );
}
