export type WordType = "G" | "N" | "B";

export type Clue = `${string}:${number}`;

export type GameEndState =
  | "IN_PROGRESS"
  | "WON"
  | "LOST-BAD-WORD"
  | "LOST-TIMEOUT";

export type GameStateForPlayer = {
  words: Array<{
    text: string;
    typeForThisPlayer: WordType;
    typeForOtherPlayer: WordType | null;
    hasBeenRevealedByPlayer1: boolean;
    hasBeenRevealedByPlayer2: boolean;
    canBeHidden: boolean;
  }>;
  cluesFromPlayer1: Clue[];
  cluesFromPlayer2: Clue[];
  clocksCount: number;
  clocksSpent: number;
  greenWordsStats: {
    totalGreenWordsFound: number;
    totalGreenWordsOfPlayer1Found: number;
    totalGreenWordsOfPlayer2Found: number;
    totalCommonGreenWordsFound: number;
  };
};

export type GameApiResponse = {
  publicId: string;
  state: GameStateForPlayer;
  endState: GameEndState;
};

export type AskClueApiResponse = GameApiResponse & {
  partnerClue: Clue;
};

export type SubmitClueApiResponse = GameApiResponse & {
  partnerGuessedWords: Array<{
    text: string;
    type: WordType;
  }>;
};

export type SuggestWordApiResponse = GameApiResponse & {
  wordType: WordType;
};

export type HistoryActivityType =
  | "AI_SENT_CLUE"
  | "USER_SENT_CLUE"
  | "USER_SELECTED_WORD";

type GameHistoryEntryBase = {
  id: number;
  activityType: HistoryActivityType;
  createdAt: string;
};

type GameHistoryUserSelectedWordEntry = GameHistoryEntryBase & {
  activityType: "USER_SELECTED_WORD";
  logs: {
    word: string;
    wordType: WordType;
  };
};

type GameHistoryUserSentClueEntry = GameHistoryEntryBase & {
  activityType: "USER_SENT_CLUE";
  logs: {
    clue: Clue;
    words: Array<{
      text: string;
      type: WordType;
    }>;
    thinking: string;
  };
};

type GameHistoryAiSentClueEntry = GameHistoryEntryBase & {
  activityType: "AI_SENT_CLUE";
  logs: {
    clue: Clue;
    thinking: string;
  };
};

export type GameHistoryEntry =
  | GameHistoryUserSelectedWordEntry
  | GameHistoryUserSentClueEntry
  | GameHistoryAiSentClueEntry;

declare global {
  interface WindowEventMap {
    CardRevealed: CustomEvent<{
      wordType: WordType;
      player: 1 | 2;
    }>;
  }
}

export type GameDifficulty = "easy" | "medium" | "hard";
