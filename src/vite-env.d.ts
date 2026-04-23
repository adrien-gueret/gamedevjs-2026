/// <reference types="vite/client" />

interface WavedashApi {
  updateLoadProgressZeroToOne(progress: number): void;
  init(options: { debug?: boolean }): void;
  getUserId(): string;
  getUserAvatarUrl(userId: string, size: number): string | null;
  getUsername(): string;

  setAchievement(achievementId: string): void;
  storeStats(): void;
}

interface Window {
  Wavedash?: WavedashApi | Promise<WavedashApi>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ethereum?: any;
}
