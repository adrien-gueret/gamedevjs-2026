import Button from "@/components/Button";
import Screen from "@/components/Screen";

import { UserAvatar, useLeaderboardEntries } from "wavedash-react";

export default function Leaderboard() {
  const leaderboard = useLeaderboardEntries(
    "fights-count",
    {
      start: 0,
      count: 20,
    },
    {
      sortOrder: 1,
      displayType: 0,
    },
  );

  return (
    <Screen>
      <h1 style={{ fontSize: "48px" }}>Hall of the Damned</h1>

      {leaderboard.entries.length > 0 && (
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
              {leaderboard.entries.map((entry) => {
                return (
                  <tr key={entry.userId}>
                    <td>#{entry.globalRank}</td>
                    <td>
                      <UserAvatar userId={entry.userId} size={64} />
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
