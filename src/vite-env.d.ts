/// <reference types="vite/client" />

interface WavedashLeaderboard {
  id: string;
  name: string;
  sortOrder: "ascending" | "descending";
  totalEntries: number;
}

type WavedashResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      message: string;
    };

interface WavedashLeaderboardEntry {
  userId: string;
  username?: string;
  score: number;
  globalRank: number;
}

interface WavedashApi {
  updateLoadProgressZeroToOne(progress: number): void;
  init(options: { debug?: boolean }): void;
  getUserId(): string;
  getUserAvatarUrl(userId: string, size: number): string | null;
  getUsername(): string;
  setAchievement(achievementId: string): void;
  storeStats(): void;
  getOrCreateLeaderboard(
    name: string,
    sortOrder: number,
    displayType: number,
  ): Promise<WavedashResponse<WavedashLeaderboard>>;
  uploadLeaderboardScore(
    leaderboardId: WavedashLeaderboard["id"],
    score: number,
    keepBest: true,
  ): Promise<WavedashResponse<{ globalRank: number }>>;
  listLeaderboardEntries(
    leaderboardId: WavedashLeaderboard["id"],
    start: number,
    count: number,
    friendsOnly?: boolean,
  ): Promise<WavedashResponse<WavedashLeaderboardEntry[]>>;
}

interface Window {
  Wavedash?: WavedashApi | Promise<WavedashApi>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ethereum?: any;
}
