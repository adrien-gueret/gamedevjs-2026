import { useState } from "react";

import {
  MAX_PLAYER_HP,
  PROGRESSION_CHOICES,
  STARTING_REELS,
  SYMBOL_LABELS,
  applyEnemyCorruption,
  applyProgressionChoice,
  createEnemy,
  resolveSpin,
  spinReels,
  type ProgressionChoice,
  type SymbolType,
} from "@/screens/homeGameLogic";

type BattleLogState = {
  nextId: number;
  entries: Array<{ id: number; text: string }>;
};

function initialBattleLogState(): BattleLogState {
  return {
    nextId: 2,
    entries: [
      {
        id: 1,
        text: "Spin to resolve the middle row only, all rows, or all rows + diagonals.",
      },
    ],
  };
}

export default function Home() {
  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HP);
  const [playerShield, setPlayerShield] = useState(0);
  const [combatIndex, setCombatIndex] = useState(1);
  const [enemy, setEnemy] = useState(() => createEnemy(1));
  const [reels, setReels] = useState<SymbolType[][]>(STARTING_REELS);
  const [grid, setGrid] = useState<SymbolType[][]>(() => spinReels(STARTING_REELS).grid);
  const [battleLogState, setBattleLogState] = useState<BattleLogState>(
    initialBattleLogState,
  );
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
    setPlayerHp(MAX_PLAYER_HP);
    setPlayerShield(0);
    setCombatIndex(1);
    setEnemy(createEnemy(1));
    setReels(STARTING_REELS);
    setGrid(spinReels(STARTING_REELS).grid);
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
