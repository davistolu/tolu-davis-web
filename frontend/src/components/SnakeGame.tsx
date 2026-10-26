import React, { useState, useEffect, useRef, useCallback } from 'react';
import { terminalSound } from '../utils/terminalSound';
import { Play, RotateCcw, Trophy, Pause, Zap, Gamepad2 } from 'lucide-react';

const GRID_SIZE = 16;
type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ]);
  const [food, setFood] = useState<Position>({ x: 12, y: 8 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('snake_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [speed, setSpeed] = useState<number>(100); // ms per frame

  // Refs to prevent stale closure inside the tick interval
  const snakeRef = useRef<Position[]>(snake);
  const foodRef = useRef<Position>(food);
  const directionRef = useRef<Direction>(direction);
  const nextDirectionRef = useRef<Direction>(direction);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const isPausedRef = useRef<boolean>(isPaused);
  const isGameOverRef = useRef<boolean>(isGameOver);
  const scoreRef = useRef<number>(score);
  const highScoreRef = useRef<number>(highScore);

  // Keep refs synchronized
  snakeRef.current = snake;
  foodRef.current = food;
  directionRef.current = direction;
  isPlayingRef.current = isPlaying;
  isPausedRef.current = isPaused;
  isGameOverRef.current = isGameOver;
  scoreRef.current = score;
  highScoreRef.current = highScore;

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    let attempts = 0;
    while (attempts < 500) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const collision = currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y);
      if (!collision) return newFood;
      attempts++;
    }
    return { x: 0, y: 0 };
  }, []);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    if (newDir === 'UP' && current !== 'DOWN') nextDirectionRef.current = 'UP';
    if (newDir === 'DOWN' && current !== 'UP') nextDirectionRef.current = 'DOWN';
    if (newDir === 'LEFT' && current !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    if (newDir === 'RIGHT' && current !== 'LEFT') nextDirectionRef.current = 'RIGHT';
    terminalSound.playKeyClick();
  }, []);

  const startGame = () => {
    const initialSnake: Position[] = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    const newFood = generateFood(initialSnake);
    setSnake(initialSnake);
    setFood(newFood);
    setDirection('RIGHT');
    nextDirectionRef.current = 'RIGHT';
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setScore(0);
    terminalSound.playSuccess();
  };

  const togglePause = () => {
    if (!isPlayingRef.current || isGameOverRef.current) return;
    setIsPaused((prev) => !prev);
    terminalSound.playKeyClick();
  };

  // Keyboard handler with preventDefault for arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        // Prevent window scrolling during game
        if (isPlayingRef.current && !isGameOverRef.current) {
          e.preventDefault();
        }
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (isPlayingRef.current && !isGameOverRef.current) {
          togglePause();
          return;
        }
      }

      if (!isPlayingRef.current || isGameOverRef.current || isPausedRef.current) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        changeDirection('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        changeDirection('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        changeDirection('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        changeDirection('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [changeDirection]);

  // Main game tick loop
  useEffect(() => {
    if (!isPlaying || isGameOver || isPaused) return;

    const interval = setInterval(() => {
      const currentSnake = snakeRef.current;
      const currentDir = nextDirectionRef.current;
      directionRef.current = currentDir;
      setDirection(currentDir);

      const head = { ...currentSnake[0] };
      if (currentDir === 'UP') head.y -= 1;
      if (currentDir === 'DOWN') head.y += 1;
      if (currentDir === 'LEFT') head.x -= 1;
      if (currentDir === 'RIGHT') head.x += 1;

      // 1. Check Wall Collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setIsGameOver(true);
        setIsPlaying(false);
        terminalSound.playError();
        return;
      }

      // 2. Check Self Collision (ignoring the very last tail piece since it moves)
      const hitSelf = currentSnake.slice(0, -1).some((s) => s.x === head.x && s.y === head.y);
      if (hitSelf) {
        setIsGameOver(true);
        setIsPlaying(false);
        terminalSound.playError();
        return;
      }

      // 3. Check Food Collision
      const currentFood = foodRef.current;
      const ateFood = head.x === currentFood.x && head.y === currentFood.y;

      let newSnake: Position[];
      if (ateFood) {
        newSnake = [head, ...currentSnake];
        terminalSound.playEat();
        const newScore = scoreRef.current + 10;
        setScore(newScore);

        if (newScore > highScoreRef.current) {
          setHighScore(newScore);
          try {
            localStorage.setItem('snake_high_score', newScore.toString());
          } catch {}
        }

        const nextFood = generateFood(newSnake);
        setFood(nextFood);
      } else {
        newSnake = [head, ...currentSnake.slice(0, -1)];
      }

      setSnake(newSnake);
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isPaused, speed, generateFood]);

  // Touch Swipe Gesture State for Mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Minimum swipe threshold: 25px
    if (Math.max(absDx, absDy) > 25) {
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) changeDirection('RIGHT');
        else changeDirection('LEFT');
      } else {
        // Vertical swipe
        if (dy > 0) changeDirection('DOWN');
        else changeDirection('UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="p-3 sm:p-4 bg-[#0a0a0c] border border-[#27272a] rounded-lg space-y-3 sm:space-y-4 font-mono text-xs max-w-md mx-auto shadow-2xl touch-manipulation">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Gamepad2 className="w-4 h-4 text-[#22c55e]" />
          <span className="text-[#22c55e] font-bold tracking-wider text-xs">SNAKE_CLI.sh</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="text-zinc-400">
            Score: <span className="text-white font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-[#f59e0b] font-semibold">
            <Trophy className="w-3.5 h-3.5" /> {highScore}
          </div>
        </div>
      </div>

      {/* Speed / Difficulty Controls */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-[#121215] px-2.5 sm:px-3 py-1.5 rounded border border-[#1f1f23]">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-[#38bdf8]" />
          <span>Speed:</span>
        </div>
        <div className="flex gap-1">
          {[
            { label: 'Normal', val: 110 },
            { label: 'Fast', val: 80 },
            { label: 'Insane', val: 50 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setSpeed(s.val)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer touch-manipulation ${
                speed === s.val
                  ? 'bg-[#22c55e] text-black font-bold'
                  : 'bg-[#1e1e24] text-zinc-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 16x16 Game Canvas Box with Touch Swipe Listeners */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full max-w-[300px] sm:max-w-[320px] mx-auto bg-[#030304] border-2 border-[#22c55e]/40 rounded p-1 shadow-[0_0_15px_rgba(34,197,94,0.15)] select-none cursor-pointer"
      >
        <div
          className="w-full h-full"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gap: '2px',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.some((s, i) => i !== 0 && s.x === x && s.y === y);
            const isFoodCell = food.x === x && food.y === y;

            let cellBg = 'bg-[#0e0e12]/60';
            if (isHead) {
              cellBg = 'bg-[#4ade80] rounded-[2px] shadow-[0_0_8px_#4ade80] z-10';
            } else if (isBody) {
              cellBg = 'bg-[#16a34a] rounded-[1px] opacity-90';
            } else if (isFoodCell) {
              cellBg = 'bg-[#ef4444] rounded-full shadow-[0_0_8px_#ef4444] animate-pulse';
            }

            return (
              <div
                key={idx}
                className={`w-full h-full transition-all duration-75 ${cellBg}`}
              />
            );
          })}
        </div>

        {/* Modal Overlay for Idle / Game Over / Paused */}
        {(!isPlaying || isGameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 rounded">
            {isGameOver ? (
              <>
                <div className="text-[#ef4444] font-bold text-base tracking-wider flex items-center gap-1.5 animate-bounce">
                  <span>💥 GAME OVER</span>
                </div>
                <div className="text-zinc-300 text-xs">
                  Final Score: <span className="text-[#4ade80] font-bold">{score}</span>
                  {score >= highScore && score > 0 && (
                    <p className="text-[#f59e0b] text-[10px] mt-0.5">⭐ NEW HIGH SCORE! ⭐</p>
                  )}
                </div>
                <button
                  onClick={startGame}
                  className="px-4 py-2 bg-[#22c55e] text-black font-bold rounded hover:bg-[#16a34a] active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.4)] cursor-pointer touch-manipulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Play Again
                </button>
              </>
            ) : isPaused ? (
              <>
                <div className="text-[#f59e0b] font-bold text-sm tracking-wider">⏸️ GAME PAUSED</div>
                <p className="text-[11px] text-zinc-400">Tap Resume or press Spacebar to continue</p>
                <button
                  onClick={togglePause}
                  className="px-4 py-1.5 bg-[#f59e0b] text-black font-bold rounded hover:bg-[#d97706] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation"
                >
                  <Play className="w-3.5 h-3.5" /> Resume Game
                </button>
              </>
            ) : (
              <>
                <div className="text-[#4ade80] font-bold text-sm tracking-widest">RETRO SNAKE CLI</div>
                <p className="text-[11px] text-zinc-400 max-w-[220px] leading-relaxed">
                  Swipe on screen, tap the D-Pad, or use <span className="text-white font-bold">Arrow Keys / WASD</span>.
                </p>
                <button
                  onClick={startGame}
                  className="px-5 py-2 bg-[#22c55e] text-black font-bold rounded hover:bg-[#16a34a] active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.5)] cursor-pointer touch-manipulation"
                >
                  <Play className="w-4 h-4 fill-black" /> START GAME
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* On-screen Controls (Keyboard / Mobile Friendly Tactile D-Pad) */}
      <div className="pt-1 flex flex-col items-center gap-2 select-none">
        <div className="flex items-center justify-between w-full px-1 text-[10px] text-zinc-500">
          <span>Swipe canvas or tap D-Pad:</span>
          {isPlaying && (
            <button
              onClick={togglePause}
              className="text-[#f59e0b] font-bold hover:underline cursor-pointer touch-manipulation"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
        <button
          onClick={() => changeDirection('UP')}
          disabled={!isPlaying || isGameOver || isPaused}
          className="w-16 sm:w-16 h-10 sm:h-10 bg-[#18181b] border border-[#27272a] active:bg-[#22c55e] active:text-black rounded-lg text-zinc-200 font-bold hover:border-[#3f3f46] flex items-center justify-center transition-all disabled:opacity-30 active:scale-90 touch-manipulation cursor-pointer text-sm shadow-md"
          aria-label="Up"
        >
          ▲
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeDirection('LEFT')}
            disabled={!isPlaying || isGameOver || isPaused}
            className="w-16 sm:w-16 h-10 sm:h-10 bg-[#18181b] border border-[#27272a] active:bg-[#22c55e] active:text-black rounded-lg text-zinc-200 font-bold hover:border-[#3f3f46] flex items-center justify-center transition-all disabled:opacity-30 active:scale-90 touch-manipulation cursor-pointer text-sm shadow-md"
            aria-label="Left"
          >
            ◀
          </button>
          <button
            onClick={() => changeDirection('DOWN')}
            disabled={!isPlaying || isGameOver || isPaused}
            className="w-16 sm:w-16 h-10 sm:h-10 bg-[#18181b] border border-[#27272a] active:bg-[#22c55e] active:text-black rounded-lg text-zinc-200 font-bold hover:border-[#3f3f46] flex items-center justify-center transition-all disabled:opacity-30 active:scale-90 touch-manipulation cursor-pointer text-sm shadow-md"
            aria-label="Down"
          >
            ▼
          </button>
          <button
            onClick={() => changeDirection('RIGHT')}
            disabled={!isPlaying || isGameOver || isPaused}
            className="w-16 sm:w-16 h-10 sm:h-10 bg-[#18181b] border border-[#27272a] active:bg-[#22c55e] active:text-black rounded-lg text-zinc-200 font-bold hover:border-[#3f3f46] flex items-center justify-center transition-all disabled:opacity-30 active:scale-90 touch-manipulation cursor-pointer text-sm shadow-md"
            aria-label="Right"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
