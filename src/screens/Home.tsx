import { useState } from "react";

type SymbolType =
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

type CombatResult = {
  linesResolved: Array<{
    line: string;
    summary: string;
  }>;
  enemyDamage: number;
  playerDamage: number;
  playerHealing: number;
  shieldGained: number;
};

type ProgressionChoice = {
  key: "ADD" | "REMOVE" | "REPLACE";
  label: string;
  description: string;
};

const MAX_PLAYER_HP = 50;
const BASE_ENEMY_HP = 40;
const MAX_REEL_SIZE = 8;

const SYMBOL_LABELS: Record<SymbolType, string> = {
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

const PROGRESSION_CHOICES: ProgressionChoice[] = [
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

const STARTING_REELS: SymbolType[][] = [
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

function spinReels(reels: SymbolType[][]): {
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

function resolveSpin(grid: SymbolType[][], hpSpent: number): CombatResult {
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

function createEnemy(turn: number): { hp: number; attack: number; name: string } {
  const level = Math.max(1, turn);

  return {
    hp: BASE_ENEMY_HP + (level - 1) * 10,
    attack: 6 + (level - 1) * 2,
    name: `Machine Warden ${level}`,
  };
}

function applyEnemyCorruption(reels: SymbolType[][]): SymbolType[][] {
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

function applyProgressionChoice(
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

export default function Home() {
  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HP);
  const [playerShield, setPlayerShield] = useState(0);
  const [combatIndex, setCombatIndex] = useState(1);
  const [enemy, setEnemy] = useState(() => createEnemy(1));
  const [reels, setReels] = useState<SymbolType[][]>(STARTING_REELS);
  const [grid, setGrid] = useState<SymbolType[][]>(() => spinReels(STARTING_REELS).grid);
  const [battleLogState, setBattleLogState] = useState<{
    nextId: number;
    entries: Array<{ id: number; text: string }>;
  }>({
    nextId: 2,
    entries: [
      {
        id: 1,
        text: "Spin to resolve the middle row only, all rows, or all rows + diagonals.",
      },
    ],
  });
  const [phase, setPhase] = useState<"BATTLE" | "PROGRESSION" | "DEFEAT">("BATTLE");

  const canSpin = phase === "BATTLE" && playerHp > 0 && enemy.hp > 0;

  function pushLog(entries: string[]): void {
    setBattleLogState((previous) => {
      let nextId = previous.nextId;
      const nextEntries = entries.map((text) => {
        const entry = { id: nextId, text };
        nextId += 1;
        return entry;
      });

      return {
        nextId,
        entries: [...nextEntries, ...previous.entries].slice(0, 14),
      };
    });
  }

  function startNextCombat(updatedReels: SymbolType[][]): void {
    const nextCombat = combatIndex + 1;
    setCombatIndex(nextCombat);
    setEnemy(createEnemy(nextCombat));
    setReels(updatedReels);
    setGrid(spinReels(updatedReels).grid);
    setPlayerShield(0);
    setPhase("BATTLE");
    pushLog([`New combat started: Machine Warden ${nextCombat} appears.`]);
  }

  function restartRun(): void {
    const resetGrid = spinReels(STARTING_REELS).grid;
    setPlayerHp(MAX_PLAYER_HP);
    setPlayerShield(0);
    setCombatIndex(1);
    setEnemy(createEnemy(1));
    setReels(STARTING_REELS);
    setGrid(resetGrid);
    setPhase("BATTLE");
    setBattleLogState((previous) => ({
      nextId: previous.nextId + 1,
      entries: [
        {
          id: previous.nextId,
          text: "Run restarted. Spend HP to spin, resolve effects line by line, survive the machine.",
        },
      ],
    }));
  }

  function handleSpin(hpSpent: number): void {
    if (!canSpin || playerHp < hpSpent) {
      return;
    }

    const { grid: spunGrid } = spinReels(reels);
    setGrid(spunGrid);

    const resolved = resolveSpin(spunGrid, hpSpent);
    const hpAfterSpin = playerHp - hpSpent;
    const hpAfterEffects = Math.min(
      MAX_PLAYER_HP,
      hpAfterSpin - resolved.playerDamage + resolved.playerHealing,
    );

    const enemyHpAfterEffects = Math.max(0, enemy.hp - resolved.enemyDamage);
    const shieldAfterEffects = playerShield + resolved.shieldGained;

    const lineLogs = resolved.linesResolved.map(
      ({ line, summary }) => `${line}: ${summary}`,
    );

    if (enemyHpAfterEffects <= 0) {
      setPlayerHp(hpAfterEffects);
      setPlayerShield(shieldAfterEffects);
      setEnemy({ ...enemy, hp: 0 });
      setPhase("PROGRESSION");
      pushLog([
        `You spent ${hpSpent} HP and defeated ${enemy.name}.`,
        ...lineLogs,
      ]);
      return;
    }

    const enemyAttack = enemy.attack;
    const mitigated = Math.min(shieldAfterEffects, enemyAttack);
    const damageTaken = enemyAttack - mitigated;
    const hpAfterEnemyTurn = hpAfterEffects - damageTaken;
    const shieldAfterEnemy = Math.max(0, shieldAfterEffects - enemyAttack);

    setReels(applyEnemyCorruption(reels));

    setEnemy({ ...enemy, hp: enemyHpAfterEffects });
    setPlayerShield(shieldAfterEnemy);

    if (hpAfterEnemyTurn <= 0) {
      setPlayerHp(0);
      setPhase("DEFEAT");
      pushLog([
        `You spent ${hpSpent} HP. ${enemy.name} retaliated for ${damageTaken}.`,
        ...lineLogs,
      ]);
      return;
    }

    setPlayerHp(hpAfterEnemyTurn);
    pushLog([
      `You spent ${hpSpent} HP. ${enemy.name} dealt ${damageTaken} damage after block.`,
      `${enemy.name} corrupted one reel with a negative symbol.`,
      ...lineLogs,
    ]);
  }

  function chooseProgression(choice: ProgressionChoice["key"]): void {
    if (phase !== "PROGRESSION") {
      return;
    }

    const upgradedReels = applyProgressionChoice(reels, choice);
    startNextCombat(upgradedReels);
  }

  return (
    <main className="game-shell">
      <header className="panel status">
        <h1>Machinebound Slots</h1>
        <p>Turn-based roguelike where every spin costs HP.</p>
        <div className="status-grid">
          <p>Player HP: {playerHp}</p>
          <p>Block: {playerShield}</p>
          <p>Enemy: {enemy.name}</p>
          <p>Enemy HP: {enemy.hp}</p>
          <p>Combat: {combatIndex}</p>
          <p>Reel size: {reels.map((reel) => reel.length).join(" / ")}</p>
        </div>
      </header>

      <section className="panel">
        <h2>Slot Grid (3 reels × 3 visible symbols)</h2>
        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="row">
              {row.map((symbol, colIndex) => (
                <span key={`cell-${rowIndex}-${colIndex}`} className="cell">
                  {SYMBOL_LABELS[symbol]}
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className="legend">
          ⚔️ Damage • 🛡️ Block • ❤️ Heal • 💀 Self-damage • 🧱 No effect • ⚡ Boost • 🌀
          Disrupt
        </p>
      </section>

      <section className="panel">
        <h2>Spin Cost / Active Lines</h2>
        <div className="actions">
          <button type="button" onClick={() => handleSpin(1)} disabled={!canSpin || playerHp < 1}>
            Spend 1 HP (middle row)
          </button>
          <button type="button" onClick={() => handleSpin(2)} disabled={!canSpin || playerHp < 2}>
            Spend 2 HP (all rows)
          </button>
          <button type="button" onClick={() => handleSpin(3)} disabled={!canSpin || playerHp < 3}>
            Spend 3 HP (rows + diagonals)
          </button>
        </div>
        {phase === "PROGRESSION" && (
          <div className="progression">
            <h3>Victory reward: modify reels before next combat</h3>
            <div className="actions">
              {PROGRESSION_CHOICES.map((choice) => (
                <button key={choice.key} type="button" onClick={() => chooseProgression(choice.key)}>
                  {choice.label}
                </button>
              ))}
            </div>
            <ul>
              {PROGRESSION_CHOICES.map((choice) => (
                <li key={`desc-${choice.key}`}>{choice.description}</li>
              ))}
            </ul>
          </div>
        )}
        {phase === "DEFEAT" && (
          <div className="progression">
            <h3>You were defeated by the machine.</h3>
            <button type="button" onClick={restartRun}>
              Restart run
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Combat log</h2>
        <ul className="log">
          {battleLogState.entries.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
