import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  BOARD_COLS,
  BOARD_ROWS,
  TOTAL_ROWS,
  TetrominoType,
  ActivePiece,
  GridCell,
  GameMode,
  GameStats,
  FloatingText,
  Particle,
  TETROMINO_COLORS,
} from './tetrisConstants';
import {
  createEmptyGrid,
  shuffleBag,
  checkCollision,
  getGhostPieceY,
  getWallKicks,
  lockPieceToGrid,
  findFullLines,
  clearLinesFromGrid,
  getDropIntervalMs,
  createNewPiece,
} from './tetrisLogic';
import { soundEngine } from './soundEngine';
import {
  createLineClearParticles,
  createHardDropParticles,
  updateParticles,
  updateFloatingTexts,
} from './particleSystem';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

const HIGH_SCORE_KEY = 'tetris_arcade_high_scores_v2';

export function useTetrisGame() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('marathon');
  const [startingLevel, setStartingLevel] = useState<number>(1);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [ghostEnabled, setGhostEnabled] = useState<boolean>(true);

  // High scores dictionary for each mode
  const [highScores, setHighScores] = useState<Record<GameMode, number>>({
    marathon: 0,
    sprint: 0,
    ultra: 0,
    zen: 0,
  });

  // Core board state
  const [grid, setGrid] = useState<GridCell[][]>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);

  // Line clear animation state
  const [clearingLines, setClearingLines] = useState<number[]>([]);
  const [boardShake, setBoardShake] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Visual effects
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Game stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    lines: 0,
    level: 1,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetrises: 0,
    maxCombo: 0,
    currentCombo: -1,
    timeElapsed: 0,
    backToBack: false,
  });

  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Refs for animation loop and tick interval
  const bagRef = useRef<TetrominoType[]>([]);
  const dropTimerRef = useRef<number | null>(null);
  const lastDropTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const isSoftDroppingRef = useRef<boolean>(false);
  const stateRef = useRef<{
    gameState: GameState;
    grid: GridCell[][];
    activePiece: ActivePiece | null;
    stats: GameStats;
    gameMode: GameMode;
    canHold: boolean;
    holdPiece: TetrominoType | null;
    nextQueue: TetrominoType[];
    clearingLines: number[];
  }>({
    gameState: 'MENU',
    grid: createEmptyGrid(),
    activePiece: null,
    stats: {
      score: 0,
      highScore: 0,
      lines: 0,
      level: 1,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      maxCombo: 0,
      currentCombo: -1,
      timeElapsed: 0,
      backToBack: false,
    },
    gameMode: 'marathon',
    canHold: true,
    holdPiece: null,
    nextQueue: [],
    clearingLines: [],
  });

  // Keep stateRef in sync for loop performance
  stateRef.current.gameState = gameState;
  stateRef.current.grid = grid;
  stateRef.current.activePiece = activePiece;
  stateRef.current.stats = stats;
  stateRef.current.gameMode = gameMode;
  stateRef.current.canHold = canHold;
  stateRef.current.holdPiece = holdPiece;
  stateRef.current.nextQueue = nextQueue;
  stateRef.current.clearingLines = clearingLines;

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHighScores(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Update current mode's high score in stats
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      highScore: highScores[gameMode] || 0,
    }));
  }, [gameMode, highScores]);

  // Haptic feedback helper
  const triggerHaptic = (pattern: number | number[] = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Vibrations might be denied in some browsers
      }
    }
  };

  // Helper to draw piece from 7-bag
  const getNextPieceFromBag = useCallback((): TetrominoType => {
    if (bagRef.current.length <= 3) {
      bagRef.current = [...bagRef.current, ...shuffleBag()];
    }
    const piece = bagRef.current.shift();
    return piece || 'T';
  }, []);

  // Spawn new active piece
  const spawnPiece = useCallback((typeToSpawn?: TetrominoType) => {
    const queue = [...stateRef.current.nextQueue];
    while (queue.length < 5) {
      queue.push(getNextPieceFromBag());
    }

    const type = typeToSpawn || queue.shift()!;
    setNextQueue(queue);

    const piece = createNewPiece(type);

    // Check game over (spawn collision)
    if (checkCollision(stateRef.current.grid, piece.type, piece.rotation, piece.x, piece.y)) {
      if (stateRef.current.gameMode === 'zen') {
        // In zen mode, clear lower 6 rows to give room
        const wipedGrid = clearLinesFromGrid(
          stateRef.current.grid,
          [16, 17, 18, 19, 20, 21]
        );
        setGrid(wipedGrid);
        setActivePiece(piece);
        setCanHold(true);
        return;
      }

      // Marathon / Sprint / Ultra Top-Out
      setGameState('GAME_OVER');
      soundEngine.playGameOver();
      triggerHaptic([40, 60, 40]);
      return;
    }

    setActivePiece(piece);
    setCanHold(true);
  }, [getNextPieceFromBag]);

  // Add floating floating text
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    setFloatingTexts(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        text,
        x,
        y,
        color,
        scale: 1,
        opacity: 1,
        life: 0,
        maxLife: 45,
      },
    ]);
  }, []);

  // Lock current piece
  const lockPiece = useCallback((pieceToLock: ActivePiece) => {
    const currentGrid = stateRef.current.grid;
    const newGrid = lockPieceToGrid(currentGrid, pieceToLock);

    // Check full lines
    const fullLines = findFullLines(newGrid);

    if (fullLines.length > 0) {
      // Trigger line clear sequence
      setClearingLines(fullLines);
      soundEngine.playLineClear(fullLines.length);

      // Collect colors of cleared rows for particles
      const rowColors = fullLines.map(r =>
        newGrid[r].map(cell => (cell ? TETROMINO_COLORS[cell].fill : '#06b6d4'))
      );

      // Spawn line clear particles
      const newParticles = createLineClearParticles(
        fullLines,
        28, // base cell size
        0,
        0,
        rowColors
      );
      setParticles(prev => [...prev, ...newParticles]);

      // Calculate score and combos
      const currentLevel = stateRef.current.stats.level;
      const currentCombo = stateRef.current.stats.currentCombo + 1;
      const isBackToBack = fullLines.length === 4 && stateRef.current.stats.backToBack;

      let linePoints = 0;
      let label = '';
      let textColor = '#22d3ee';

      if (fullLines.length === 1) {
        linePoints = 100 * currentLevel;
        label = '+100 SINGLE';
        textColor = '#60a5fa';
        setStats(s => ({ ...s, singles: s.singles + 1 }));
      } else if (fullLines.length === 2) {
        linePoints = 300 * currentLevel;
        label = '+300 DOUBLE!';
        textColor = '#4ade80';
        setStats(s => ({ ...s, doubles: s.doubles + 1 }));
      } else if (fullLines.length === 3) {
        linePoints = 500 * currentLevel;
        label = '+500 TRIPLE!!';
        textColor = '#facc15';
        setStats(s => ({ ...s, triples: s.triples + 1 }));
      } else if (fullLines.length === 4) {
        linePoints = (isBackToBack ? 1200 : 800) * currentLevel;
        label = isBackToBack ? '+1200 B2B TETRIS!' : '+800 TETRIS!';
        textColor = '#c084fc';
        setStats(s => ({ ...s, tetrises: s.tetrises + 1 }));

        // Confetti for Tetris!
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#06b6d4', '#a855f7', '#facc15', '#ec4899'],
        });
      }

      // Combo bonus
      if (currentCombo > 0) {
        linePoints += 50 * currentCombo * currentLevel;
      }

      // Screen shake
      setBoardShake({
        x: (Math.random() - 0.5) * (fullLines.length >= 4 ? 10 : 4),
        y: fullLines.length >= 4 ? 6 : 2,
      });
      setTimeout(() => setBoardShake({ x: 0, y: 0 }), 150);

      // Trigger haptic for line clear
      triggerHaptic(fullLines.length >= 4 ? [30, 40, 30] : 20);

      // Add floating text
      addFloatingText(label, 140, (fullLines[0] - 2) * 28 + 20, textColor);
      if (currentCombo > 1) {
        addFloatingText(`COMBO x${currentCombo}`, 140, (fullLines[0] - 2) * 28 - 15, '#f59e0b');
      }

      // Update lines count and level
      const updatedLines = stateRef.current.stats.lines + fullLines.length;
      let newLevel = currentLevel;

      if (stateRef.current.gameMode === 'marathon') {
        const calculatedLevel = Math.max(
          startingLevel,
          Math.floor(updatedLines / 10) + 1
        );
        if (calculatedLevel > currentLevel) {
          newLevel = calculatedLevel;
          soundEngine.playLevelUp();
          addFloatingText(`LEVEL ${newLevel}!`, 140, 160, '#10b981');
          confetti({ particleCount: 30, spread: 70, origin: { y: 0.4 } });
        }
      }

      // Check sprint 40-line victory
      if (stateRef.current.gameMode === 'sprint' && updatedLines >= 40) {
        setTimeout(() => {
          setGameState('VICTORY');
          soundEngine.playLevelUp();
          confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
        }, 200);
      }

      // Delay grid collapse slightly so player sees the flashing line
      setTimeout(() => {
        const clearedGrid = clearLinesFromGrid(newGrid, fullLines);
        setGrid(clearedGrid);
        setClearingLines([]);

        setStats(s => {
          const nextScore = s.score + linePoints;
          const nextMaxCombo = Math.max(s.maxCombo, currentCombo);
          let newHighScore = s.highScore;

          if (nextScore > s.highScore) {
            newHighScore = nextScore;
            setIsNewHighScore(true);
            setHighScores(hs => {
              const updated = { ...hs, [stateRef.current.gameMode]: nextScore };
              try {
                localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }

          return {
            ...s,
            score: nextScore,
            highScore: newHighScore,
            lines: updatedLines,
            level: newLevel,
            currentCombo,
            maxCombo: nextMaxCombo,
            backToBack: fullLines.length === 4,
          };
        });

        // Spawn next piece
        spawnPiece();
      }, 140);
    } else {
      // No lines cleared, reset combo
      setGrid(newGrid);
      setStats(s => ({
        ...s,
        currentCombo: -1,
        backToBack: false,
      }));
      spawnPiece();
    }
  }, [addFloatingText, spawnPiece, startingLevel]);

  // Movement: Move Left / Right
  const moveHorizontally = useCallback((dir: -1 | 1) => {
    if (stateRef.current.gameState !== 'PLAYING') return;
    const piece = stateRef.current.activePiece;
    if (!piece) return;

    if (!checkCollision(stateRef.current.grid, piece.type, piece.rotation, piece.x + dir, piece.y)) {
      setActivePiece({
        ...piece,
        x: piece.x + dir,
      });
      soundEngine.playMove();
      triggerHaptic(8);
    }
  }, []);

  // Soft Drop
  const softDrop = useCallback(() => {
    if (stateRef.current.gameState !== 'PLAYING') return;
    const piece = stateRef.current.activePiece;
    if (!piece) return;

    if (!checkCollision(stateRef.current.grid, piece.type, piece.rotation, piece.x, piece.y + 1)) {
      setActivePiece({
        ...piece,
        y: piece.y + 1,
      });
      setStats(s => ({ ...s, score: s.score + 1 }));
      soundEngine.playSoftDrop();
    } else {
      // Reached floor
      lockPiece(piece);
    }
  }, [lockPiece]);

  // Hard Drop
  const hardDrop = useCallback(() => {
    if (stateRef.current.gameState !== 'PLAYING') return;
    const piece = stateRef.current.activePiece;
    if (!piece) return;

    const ghostY = getGhostPieceY(stateRef.current.grid, piece);
    const droppedDistance = ghostY - piece.y;
    const droppedPiece = { ...piece, y: ghostY };

    // Slam screen shake
    setBoardShake({ x: (Math.random() - 0.5) * 4, y: 5 });
    setTimeout(() => setBoardShake({ x: 0, y: 0 }), 100);

    // Sound and haptic
    soundEngine.playHardDrop();
    triggerHaptic(25);

    // Slam particles
    const slamParticles = createHardDropParticles(
      piece.x,
      ghostY,
      28,
      0,
      0,
      TETROMINO_COLORS[piece.type].fill
    );
    setParticles(p => [...p, ...slamParticles]);

    // Points for hard drop (2 pts per cell)
    setStats(s => ({ ...s, score: s.score + droppedDistance * 2 }));

    // Lock piece
    lockPiece(droppedPiece);
  }, [lockPiece]);

  // Rotation: Clockwise (dir = 1) or Counter-Clockwise (dir = -1)
  const rotatePiece = useCallback((dir: 1 | -1 = 1) => {
    if (stateRef.current.gameState !== 'PLAYING') return;
    const piece = stateRef.current.activePiece;
    if (!piece) return;

    const fromRot = piece.rotation;
    const toRot = ((fromRot + dir) % 4 + 4) % 4;

    // Check SRS wall kicks
    const kicks = getWallKicks(piece.type, fromRot, toRot);

    for (const [kx, ky] of kicks) {
      // In SRS coordinates, +ky is upward, but in array grid coords, +y is downward!
      const testX = piece.x + kx;
      const testY = piece.y - ky;

      if (!checkCollision(stateRef.current.grid, piece.type, toRot, testX, testY)) {
        setActivePiece({
          ...piece,
          rotation: toRot,
          x: testX,
          y: testY,
        });
        soundEngine.playRotate();
        triggerHaptic(12);
        return;
      }
    }
  }, []);

  // Hold Piece
  const holdCurrentPiece = useCallback(() => {
    if (stateRef.current.gameState !== 'PLAYING') return;
    if (!stateRef.current.canHold) return;
    const piece = stateRef.current.activePiece;
    if (!piece) return;

    soundEngine.playHold();
    triggerHaptic(15);
    setCanHold(false);

    const prevHold = stateRef.current.holdPiece;
    setHoldPiece(piece.type);

    if (prevHold) {
      spawnPiece(prevHold);
    } else {
      spawnPiece();
    }
  }, [spawnPiece]);

  // Start new game
  const startGame = useCallback((mode: GameMode = gameMode, level: number = startingLevel) => {
    soundEngine.unlockAudio();
    soundEngine.playClick();
    soundEngine.startBgm();

    setGameMode(mode);
    setStartingLevel(level);

    // Reset board
    const newGrid = createEmptyGrid();
    setGrid(newGrid);
    setClearingLines([]);
    setParticles([]);
    setFloatingTexts([]);
    setIsNewHighScore(false);
    setHoldPiece(null);
    setCanHold(true);

    // Fresh 7-bag
    bagRef.current = shuffleBag();
    const initialQueue: TetrominoType[] = [];
    for (let i = 0; i < 5; i++) {
      if (bagRef.current.length === 0) bagRef.current = shuffleBag();
      initialQueue.push(bagRef.current.shift()!);
    }
    setNextQueue(initialQueue);

    const firstPieceType = initialQueue.shift()!;
    const firstPiece = createNewPiece(firstPieceType);
    setActivePiece(firstPiece);

    setStats({
      score: 0,
      highScore: highScores[mode] || 0,
      lines: 0,
      level,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      maxCombo: 0,
      currentCombo: -1,
      timeElapsed: 0,
      backToBack: false,
    });

    setGameState('PLAYING');
    lastDropTimeRef.current = performance.now();
  }, [gameMode, highScores, startingLevel]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    soundEngine.playClick();
    setGameState(curr => {
      if (curr === 'PLAYING') {
        soundEngine.pauseBgm();
        return 'PAUSED';
      }
      if (curr === 'PAUSED') {
        soundEngine.startBgm();
        lastDropTimeRef.current = performance.now();
        return 'PLAYING';
      }
      return curr;
    });
  }, []);

  // Return to Menu
  const returnToMenu = useCallback(() => {
    soundEngine.playClick();
    soundEngine.stopBgm();
    setGameState('MENU');
  }, []);

  // Timer & Game Loop (falling pieces and particle physics)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let timerInterval: number | null = null;
    timerInterval = window.setInterval(() => {
      setStats(s => {
        const nextTime = s.timeElapsed + 1;
        // Ultra mode time check (120 seconds)
        if (stateRef.current.gameMode === 'ultra' && nextTime >= 120) {
          setGameState('GAME_OVER');
          soundEngine.playGameOver();
        }
        return { ...s, timeElapsed: nextTime };
      });
    }, 1000);

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameState]);

  // Main animation / drop frame loop
  useEffect(() => {
    let lastFrameTime = performance.now();

    const loop = (now: number) => {
      // Update particles and floating texts on every animation frame for 60fps smoothness
      setParticles(p => (p.length > 0 ? updateParticles(p) : p));
      setFloatingTexts(t => (t.length > 0 ? updateFloatingTexts(t) : t));

      if (stateRef.current.gameState === 'PLAYING' && stateRef.current.clearingLines.length === 0) {
        const dropInterval = isSoftDroppingRef.current
          ? 40
          : getDropIntervalMs(stateRef.current.stats.level);

        if (now - lastDropTimeRef.current >= dropInterval) {
          lastDropTimeRef.current = now;
          const piece = stateRef.current.activePiece;
          if (piece) {
            if (!checkCollision(stateRef.current.grid, piece.type, piece.rotation, piece.x, piece.y + 1)) {
              setActivePiece(p => (p ? { ...p, y: p.y + 1 } : null));
              if (isSoftDroppingRef.current) {
                setStats(s => ({ ...s, score: s.score + 1 }));
              }
            } else {
              lockPiece(piece);
            }
          }
        }
      }

      lastFrameTime = now;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lockPiece]);

  // Keyboard input listeners with DAS (Delayed Auto Shift)
  useEffect(() => {
    const keysDown = new Set<string>();
    const dasTimers = new Map<string, number>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Unlock sound on any key press
      soundEngine.unlockAudio();

      // Quick pause toggle
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      // Quick restart
      if (e.key === 'r' || e.key === 'R') {
        if (stateRef.current.gameState === 'PLAYING' || stateRef.current.gameState === 'PAUSED') {
          e.preventDefault();
          startGame(stateRef.current.gameMode, startingLevel);
          return;
        }
      }

      // In menu / game over, Enter or Space starts game
      if (stateRef.current.gameState === 'MENU' || stateRef.current.gameState === 'GAME_OVER' || stateRef.current.gameState === 'VICTORY') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startGame(stateRef.current.gameMode, startingLevel);
          return;
        }
      }

      if (stateRef.current.gameState !== 'PLAYING') return;

      // Prevent page scrolling on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (keysDown.has(e.code)) return;
      keysDown.add(e.code);

      // Handle Key Actions
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        moveHorizontally(-1);
        const timer = window.setTimeout(() => {
          const repeatInterval = window.setInterval(() => {
            if (keysDown.has(e.code)) {
              moveHorizontally(-1);
            } else {
              clearInterval(repeatInterval);
            }
          }, 38);
          dasTimers.set(e.code + '_repeat', repeatInterval);
        }, 150);
        dasTimers.set(e.code, timer);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        moveHorizontally(1);
        const timer = window.setTimeout(() => {
          const repeatInterval = window.setInterval(() => {
            if (keysDown.has(e.code)) {
              moveHorizontally(1);
            } else {
              clearInterval(repeatInterval);
            }
          }, 38);
          dasTimers.set(e.code + '_repeat', repeatInterval);
        }, 150);
        dasTimers.set(e.code, timer);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        isSoftDroppingRef.current = true;
        softDrop();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyX') {
        rotatePiece(1);
      } else if (e.code === 'KeyZ' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
        rotatePiece(-1);
      } else if (e.code === 'Space') {
        hardDrop();
      } else if (e.code === 'KeyC' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        holdCurrentPiece();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);

      if (dasTimers.has(e.code)) {
        clearTimeout(dasTimers.get(e.code));
        dasTimers.delete(e.code);
      }
      if (dasTimers.has(e.code + '_repeat')) {
        clearInterval(dasTimers.get(e.code + '_repeat'));
        dasTimers.delete(e.code + '_repeat');
      }

      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        isSoftDroppingRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      dasTimers.forEach(id => {
        clearTimeout(id);
        clearInterval(id);
      });
    };
  }, [
    moveHorizontally,
    softDrop,
    hardDrop,
    rotatePiece,
    holdCurrentPiece,
    togglePause,
    startGame,
    startingLevel,
  ]);

  return {
    gameState,
    gameMode,
    setGameMode,
    startingLevel,
    setStartingLevel,
    crtEnabled,
    setCrtEnabled,
    ghostEnabled,
    setGhostEnabled,
    grid,
    activePiece,
    nextQueue,
    holdPiece,
    canHold,
    clearingLines,
    boardShake,
    particles,
    floatingTexts,
    stats,
    highScores,
    isNewHighScore,
    startGame,
    togglePause,
    returnToMenu,
    moveHorizontally,
    softDrop,
    hardDrop,
    rotatePiece,
    holdCurrentPiece,
  };
}
