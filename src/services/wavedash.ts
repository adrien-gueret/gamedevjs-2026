import { useEffect, useState } from "react";

async function getWavedashApi(): Promise<WavedashApi | null> {
  if (!window.Wavedash) {
    return null;
  }

  return await window.Wavedash;
}

export function useWavedash() {
  const [wavedash, setWavedash] = useState<WavedashApi | null>(null);

  useEffect(() => {
    if (window.Wavedash) {
      getWavedashApi().then((api) => {
        setWavedash(api);
      });
    }
  }, []);

  return wavedash;
}

export function useWavedashLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<WavedashLeaderboard | null>(
    null,
  );
  const wavedash = useWavedash();

  useEffect(() => {
    if (!wavedash) {
      return;
    }

    wavedash.getOrCreateLeaderboard("fights-count", 0, 0).then((result) => {
      if (result.success) {
        setLeaderboard(result.data);
      }
    });
  }, [wavedash]);

  return {
    leaderboard,
    async setScore(score: number): Promise<number | null> {
      if (!wavedash || !leaderboard) {
        return null;
      }

      const response = await wavedash.uploadLeaderboardScore(
        leaderboard.id,
        score,
        true,
      );

      return response.success ? response.data.globalRank : null;
    },
  };
}

export function useWavedashLeaderboardEntries() {
  const [entries, setEntries] = useState<WavedashLeaderboardEntry[]>([]);
  const wavedash = useWavedash();
  const { leaderboard } = useWavedashLeaderboard();

  useEffect(() => {
    if (!wavedash || !leaderboard) {
      return;
    }

    wavedash.listLeaderboardEntries(leaderboard.id, 0, 20).then((result) => {
      if (result.success) {
        setEntries(result.data);
      }
    });
  }, [wavedash, leaderboard]);

  return entries;
}
