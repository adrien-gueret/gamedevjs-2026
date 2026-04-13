export type SymbolType =
  | "SWORD"
  | "SHIELD"
  | "HEAL"
  | "CURSE"
  | "JUNK"
  | "TRIGGER"
  | "DISRUPTOR";

type Point = [row: number, col: number];

type LineDefinition = {
  key: string;
  label: string;
  points: [Point, Point, Point];
};

export type CombatResult = {
  linesResolved: Array<{
    line: string;
    summary: string;
  }>;
  enemyDamage: number;
  playerDamage: number;
  playerHealing: number;
  shieldGained: number;
};

export type ProgressionChoice = {
  key: "ADD" | "REMOVE" | "REPLACE";
  label: string;
  description: string;
};

export type Enemy = {
  hp: number;
  attack: number;
  name: string;
};

const BASE_ENEMY_HP = 40;
const MAX_REEL_SIZE = 8;

export const MAX_PLAYER_HP = 50;

export const SYMBOL_LABELS: Record<SymbolType, string> = {
  SWORD: "⚔️",
  SHIELD: "🛡️",
  HEAL: "❤️",
  CURSE: "💀",
  JUNK: "🧱",
  TRIGGER: "⚡",
  DISRUPTOR: "🌀",
};

const LINE_DEFINITIONS: Record<"TOP" | "MIDDLE" | "BOTTOM" | "DIAG_LR" | "DIAG_RL", LineDefinition> = {
  TOP: {
    key: "TOP",
    label: "Top Row",
    points: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
  },
  MIDDLE: {
    key: "MIDDLE",
    label: "Middle Row",
    points: [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },
  BOTTOM: {
    key: "BOTTOM",
    label: "Bottom Row",
    points: [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
  },
  DIAG_LR: {
    key: "DIAG_LR",
    label: "Diagonal ↘",
    points: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
  },
  DIAG_RL: {
    key: "DIAG_RL",
    label: "Diagonal ↙",
    points: [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  },
};

export const PROGRESSION_CHOICES: ProgressionChoice[] = [
  {
    key: "ADD",
    label: "Add symbol",
    description: "Add one positive symbol to a random reel (max 8 symbols per reel)",
  },
  {
    key: "REMOVE",
    label: "Remove symbol",
    description: "Remove one negative symbol if possible",
  },
  {
    key: "REPLACE",
    label: "Replace symbol",
    description: "Replace one random symbol with ⚡ Trigger",
  },
];

const POSITIVE_SYMBOLS: SymbolType[] = ["SWORD", "SHIELD", "HEAL", "TRIGGER"];
const NEGATIVE_SYMBOLS: SymbolType[] = ["CURSE", "JUNK", "DISRUPTOR"];

export const STARTING_REELS: SymbolType[][] = [
  ["SWORD", "SHIELD", "HEAL", "JUNK", "TRIGGER", "CURSE", "SWORD"],
  ["SWORD", "HEAL", "SHIELD", "JUNK", "TRIGGER", "CURSE", "HEAL"],
  ["SHIELD", "SWORD", "HEAL", "JUNK", "TRIGGER", "CURSE", "SWORD"],
];

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function getActiveLines(hpSpent: number): LineDefinition[] {
  if (hpSpent === 1) {
    return [LINE_DEFINITIONS.MIDDLE];
  }

  if (hpSpent === 2) {
    return [
      LINE_DEFINITIONS.TOP,
      LINE_DEFINITIONS.MIDDLE,
      LINE_DEFINITIONS.BOTTOM,
    ];
  }

  return [
    LINE_DEFINITIONS.TOP,
    LINE_DEFINITIONS.MIDDLE,
    LINE_DEFINITIONS.BOTTOM,
    LINE_DEFINITIONS.DIAG_LR,
    LINE_DEFINITIONS.DIAG_RL,
  ];
}

export function spinReels(reels: SymbolType[][]): {
  grid: SymbolType[][];
  stops: number[];
} {
  const stops = reels.map((reel) => randomInt(reel.length));
  const grid: SymbolType[][] = [0, 1, 2].map((row) =>
    reels.map((reel, col) => reel[(stops[col] + row) % reel.length]),
  );

  return { grid, stops };
}

function getLineSymbols(grid: SymbolType[][], line: LineDefinition): SymbolType[] {
  return line.points.map(([row, col]) => grid[row][col]);
}

function resolveLine(lineSymbols: SymbolType[]): {
  summary: string;
  enemyDamage: number;
  playerDamage: number;
  playerHealing: number;
  shieldGained: number;
} {
  const counts = new Map<SymbolType, number>();

  for (const symbol of lineSymbols) {
    counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
  }

  const triggerCount = counts.get("TRIGGER") ?? 0;
  let enemyDamage = 0;
  let playerDamage = 0;
  let playerHealing = 0;
  let shieldGained = 0;
  const summaries: string[] = [];

  for (const [symbol, count] of counts.entries()) {
    if (symbol === "JUNK") {
      summaries.push(`🧱 Junk x${count}: no effect`);
      continue;
    }

    if (symbol === "TRIGGER") {
      summaries.push(`⚡ Trigger x${count}: boosts other symbols on this line`);
      continue;
    }

    let multiplier = count;

    if (count === 3) {
      multiplier *= 2;
    }

    if (triggerCount > 0 && symbol !== "CURSE" && symbol !== "DISRUPTOR") {
      multiplier += triggerCount;
    }

    if (symbol === "SWORD") {
      const value = 4 * multiplier;
      enemyDamage += value;
      summaries.push(`⚔️ Sword x${count}: ${value} damage`);
      continue;
    }

    if (symbol === "SHIELD") {
      const value = 3 * multiplier;
      shieldGained += value;
      summaries.push(`🛡️ Shield x${count}: ${value} block`);
      continue;
    }

    if (symbol === "HEAL") {
      const value = 2 * multiplier;
      playerHealing += value;
      summaries.push(`❤️ Heal x${count}: ${value} healing`);
      continue;
    }

    if (symbol === "CURSE") {
      const value = 2 * multiplier;
      playerDamage += value;
      summaries.push(`💀 Curse x${count}: ${value} self-damage`);
      continue;
    }

    if (symbol === "DISRUPTOR") {
      const value = 2 * multiplier;
      playerDamage += value;
      enemyDamage = Math.max(0, enemyDamage - 3 * count);
      shieldGained = Math.max(0, shieldGained - 2 * count);
      summaries.push(`🌀 Disruptor x${count}: ${value} damage + disrupts positive effects`);
    }
  }

  if (summaries.length === 0) {
    summaries.push("No symbols activated");
  }

  return {
    summary: summaries.join(" • "),
    enemyDamage,
    playerDamage,
    playerHealing,
    shieldGained,
  };
}

export function resolveSpin(grid: SymbolType[][], hpSpent: number): CombatResult {
  const activeLines = getActiveLines(hpSpent);
  let enemyDamage = 0;
  let playerDamage = 0;
  let playerHealing = 0;
  let shieldGained = 0;

  const linesResolved = activeLines.map((line) => {
    const lineSymbols = getLineSymbols(grid, line);
    const resolved = resolveLine(lineSymbols);

    enemyDamage += resolved.enemyDamage;
    playerDamage += resolved.playerDamage;
    playerHealing += resolved.playerHealing;
    shieldGained += resolved.shieldGained;

    return {
      line: line.label,
      summary: resolved.summary,
    };
  });

  return {
    linesResolved,
    enemyDamage,
    playerDamage,
    playerHealing,
    shieldGained,
  };
}

export function createEnemy(turn: number): Enemy {
  const level = Math.max(1, turn);

  return {
    hp: BASE_ENEMY_HP + (level - 1) * 10,
    attack: 6 + (level - 1) * 2,
    name: `Machine Warden ${level}`,
  };
}

export function applyEnemyCorruption(reels: SymbolType[][]): SymbolType[][] {
  const nextReels = reels.map((reel) => [...reel]);
  const reelIndex = randomInt(nextReels.length);
  const negative = NEGATIVE_SYMBOLS[randomInt(NEGATIVE_SYMBOLS.length)];

  if (nextReels[reelIndex].length < MAX_REEL_SIZE) {
    nextReels[reelIndex].push(negative);
    return nextReels;
  }

  const replaceIndex = randomInt(nextReels[reelIndex].length);
  nextReels[reelIndex][replaceIndex] = negative;

  return nextReels;
}

export function applyProgressionChoice(
  reels: SymbolType[][],
  choice: ProgressionChoice["key"],
): SymbolType[][] {
  const nextReels = reels.map((reel) => [...reel]);

  if (choice === "ADD") {
    const reelIndex = randomInt(nextReels.length);

    if (nextReels[reelIndex].length < MAX_REEL_SIZE) {
      const symbol = POSITIVE_SYMBOLS[randomInt(POSITIVE_SYMBOLS.length)];
      nextReels[reelIndex].push(symbol);
      return nextReels;
    }

    const replaceIndex = randomInt(nextReels[reelIndex].length);
    nextReels[reelIndex][replaceIndex] =
      POSITIVE_SYMBOLS[randomInt(POSITIVE_SYMBOLS.length)];
    return nextReels;
  }

  if (choice === "REMOVE") {
    const flattened = nextReels.flatMap((reel, reelIndex) =>
      reel.map((symbol, symbolIndex) => ({ symbol, reelIndex, symbolIndex })),
    );

    const removableNegative = flattened.filter(({ symbol }) =>
      NEGATIVE_SYMBOLS.includes(symbol),
    );
    const pool = removableNegative.length > 0 ? removableNegative : flattened;
    const target = pool[randomInt(pool.length)];

    if (nextReels[target.reelIndex].length > 1) {
      nextReels[target.reelIndex].splice(target.symbolIndex, 1);
    }

    return nextReels;
  }

  const reelIndex = randomInt(nextReels.length);
  const symbolIndex = randomInt(nextReels[reelIndex].length);
  nextReels[reelIndex][symbolIndex] = "TRIGGER";

  return nextReels;
}
