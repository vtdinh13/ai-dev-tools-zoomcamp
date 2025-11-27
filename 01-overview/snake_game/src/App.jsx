import { useCallback, useEffect, useMemo, useState } from 'react';

const BOARD_SIZE = 18;
const INITIAL_DIRECTION = { x: 1, y: 0 };

const MOVES = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const DIFFICULTY = [
  { key: 'chill', label: 'Chill', speed: 220 },
  { key: 'classic', label: 'Classic', speed: 150 },
  { key: 'turbo', label: 'Turbo', speed: 90 },
];

const MODES = [
  { key: 'wall', label: 'Wall (classic)' },
  { key: 'pass', label: 'Pass-through' },
];

const createInitialSnake = () => {
  const center = Math.floor(BOARD_SIZE / 2);
  return [
    { x: center + 1, y: center },
    { x: center, y: center },
    { x: center - 1, y: center },
  ];
};

const spawnFood = (occupied = []) => {
  const available = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const isTaken = occupied.some((segment) => segment.x === x && segment.y === y);
      if (!isTaken) {
        available.push({ x, y });
      }
    }
  }
  return available[Math.floor(Math.random() * available.length)] ?? { x: 0, y: 0 };
};

export default function SnakeGame() {
  const [snake, setSnake] = useState(createInitialSnake);
  const [food, setFood] = useState(() => spawnFood(createInitialSnake()));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [status, setStatus] = useState('idle');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = window.localStorage.getItem('snake-codex-best');
    return saved ? Number(saved) : 0;
  });
  const [difficultyKey, setDifficultyKey] = useState('classic');
  const [modeKey, setModeKey] = useState('wall');

  const difficulty = useMemo(
    () => DIFFICULTY.find((entry) => entry.key === difficultyKey) ?? DIFFICULTY[1],
    [difficultyKey],
  );
  const activeDifficultyKey = difficulty?.key ?? difficultyKey;
  const mode = useMemo(
    () => MODES.find((entry) => entry.key === modeKey) ?? MODES[0],
    [modeKey],
  );
  const activeModeKey = mode?.key ?? modeKey;
  const isPassThrough = activeModeKey === 'pass';

  const resetGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    setSnake(initialSnake);
    setFood(spawnFood(initialSnake));
    setDirection(INITIAL_DIRECTION);
    setStatus('idle');
    setScore(0);
  }, []);

  const changeDirection = useCallback((nextMove) => {
    if (status === 'over') return;
    setDirection((current) => {
      if (current.x + nextMove.x === 0 && current.y + nextMove.y === 0) {
        return current;
      }
      return nextMove;
    });
    if (status === 'idle') {
      setStatus('running');
    }
  }, [status]);

  const handleStartPause = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
      return;
    }
    if (status === 'paused') {
      setStatus('running');
      return;
    }
    resetGame();
    setStatus('running');
  }, [resetGame, status]);

  const handleDifficultyChange = useCallback((key) => {
    setDifficultyKey(key);
    resetGame();
  }, [resetGame]);

  const handleModeChange = useCallback((key) => {
    setModeKey(key);
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('snake-codex-best', String(bestScore));
  }, [bestScore]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const move = MOVES[event.key];
      if (!move) return;
      event.preventDefault();
      changeDirection(move);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        let newHead = { x: head.x + direction.x, y: head.y + direction.y };
        const hitsWall =
          newHead.x < 0 || newHead.y < 0 || newHead.x >= BOARD_SIZE || newHead.y >= BOARD_SIZE;

        if (hitsWall && isPassThrough) {
          newHead = {
            x: (newHead.x + BOARD_SIZE) % BOARD_SIZE,
            y: (newHead.y + BOARD_SIZE) % BOARD_SIZE,
          };
        } else if (hitsWall) {
          setStatus('over');
          return currentSnake;
        }

        const hitsBody = currentSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y,
        );

        if (hitsBody) {
          setStatus('over');
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];
        const ateFood = newHead.x === food.x && newHead.y === food.y;

        if (ateFood) {
          setFood(spawnFood(newSnake));
          setScore((prev) => prev + 10);
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    }, difficulty.speed);

    return () => clearInterval(interval);
  }, [direction, status, difficulty.speed, food, isPassThrough]);

  useEffect(() => {
    if (status !== 'over') return;
    setBestScore((prev) => Math.max(prev, score));
  }, [status, score]);

  const boardCells = useMemo(() => {
    const cells = [];
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
        const isHead = isSnake && snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;
        cells.push({ id: `${x}-${y}`, isSnake, isHead, isFood });
      }
    }
    return cells;
  }, [snake, food]);

  const statusLabel = {
    idle: 'ready',
    running: 'running',
    paused: 'paused',
    over: 'game over',
  }[status];

  const statusStyles = {
    idle: 'border-slate-500/40 text-slate-300',
    running: 'border-emerald-400/60 text-emerald-200',
    paused: 'border-slate-100/30 text-slate-200',
    over: 'border-rose-400/60 text-rose-200',
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-slate-100 flex justify-center px-4 py-10 font-['Space_Grotesk','Inter','system-ui']">
      <div className="w-full max-w-5xl space-y-8">
        <header className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">react mini-project</p>
          <h1 className="text-4xl font-semibold">Snake — Codex Edition</h1>
          <p className="text-slate-400">Use the arrow keys or the touch pad to keep the snake fed.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr] items-start">
          <section className="rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-wide text-slate-400">
              <span>status</span>
              <span
                className={`rounded-full border px-4 py-1 text-[0.68rem] uppercase tracking-[0.35em] ${statusStyles[status]}`}
              >
                {statusLabel}
              </span>
            </div>

            <div
              className="grid justify-center gap-1.5 sm:gap-2 rounded-[30px] border border-emerald-400/30 bg-gradient-to-b from-teal-900/40 to-slate-950 shadow-[inset_0_0_30px_rgba(15,23,42,0.8)] p-4"
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
            >
              {boardCells.map((cell) => {
                const cellClasses = [
                  'w-4 h-4 sm:w-5 sm:h-5 rounded-md border border-slate-900/70 bg-slate-950/80 transition-all duration-150',
                ];
                if (cell.isSnake) {
                  cellClasses.push('border-0 bg-gradient-to-br from-emerald-400 to-cyan-300 shadow-[0_0_12px_rgba(16,185,129,0.55)]');
                }
                if (cell.isFood) {
                  cellClasses.push('border-0 bg-gradient-to-br from-rose-400 to-orange-400 shadow-[0_0_16px_rgba(251,113,133,0.7)] animate-pulse');
                }
                if (cell.isHead) {
                  cellClasses.push('ring-2 ring-white/40');
                }
                return <div key={cell.id} className={cellClasses.join(' ')} />;
              })}
            </div>

            {status === 'over' && (
              <p className="text-center text-rose-200 font-medium">
                You crashed! Hit restart or tap a direction to try again.
              </p>
            )}
          </section>

          <aside className="rounded-3xl border border-slate-700/40 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">scoreboard</p>
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">current</p>
                  <p className="text-4xl font-semibold text-emerald-300">{score}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">best</p>
                  <p className="text-3xl font-semibold text-cyan-300">{bestScore}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-emerald-400 to-teal-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-900 shadow-lg transition hover:shadow-emerald-500/30"
                onClick={handleStartPause}
              >
                {status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200 transition hover:border-emerald-300/50"
                onClick={resetGame}
              >
                Restart
              </button>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">speed</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DIFFICULTY.map((level) => (
                  <button
                    key={level.key}
                    className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] transition ${
                      activeDifficultyKey === level.key
                        ? 'border-emerald-300/70 bg-emerald-400/15 text-emerald-100'
                        : 'border-slate-600/70 text-slate-300'
                    } ${status === 'running' ? 'opacity-60 pointer-events-none' : 'hover:border-emerald-300/70'}`}
                    disabled={status === 'running'}
                    onClick={() => handleDifficultyChange(level.key)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              {status === 'running' && (
                <p className="mt-2 text-xs text-slate-500">Pause the game to switch speeds.</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">mode</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {MODES.map((entry) => (
                  <button
                    key={entry.key}
                    className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] transition ${
                      activeModeKey === entry.key
                        ? 'border-cyan-300/70 bg-cyan-400/10 text-cyan-100'
                        : 'border-slate-600/70 text-slate-300'
                    } ${status === 'running' ? 'opacity-60 pointer-events-none' : 'hover:border-cyan-300/70'}`}
                    disabled={status === 'running'}
                    onClick={() => handleModeChange(entry.key)}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
              {activeModeKey === 'pass' && (
                <p className="mt-2 text-xs text-slate-500">
                  Pass-through wraps edges, so the snake reappears on the opposite side.
                </p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">touch controls</p>
              <div className="mt-2 grid grid-cols-3 grid-rows-3 gap-2 justify-items-center items-center">
                <span />
                <button
                  className="rounded-2xl border border-blue-400/40 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 transition hover:border-blue-300/80 active:scale-95"
                  onClick={() => changeDirection(MOVES.ArrowUp)}
                >
                  ↑
                </button>
                <span />
                <button
                  className="rounded-2xl border border-blue-400/40 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 transition hover:border-blue-300/80 active:scale-95"
                  onClick={() => changeDirection(MOVES.ArrowLeft)}
                >
                  ←
                </button>
                <button
                  className="rounded-2xl border border-blue-400/40 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 transition hover:border-blue-300/80 active:scale-95"
                  onClick={() => changeDirection(MOVES.ArrowDown)}
                >
                  ↓
                </button>
                <button
                  className="rounded-2xl border border-blue-400/40 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 transition hover:border-blue-300/80 active:scale-95"
                  onClick={() => changeDirection(MOVES.ArrowRight)}
                >
                  →
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
