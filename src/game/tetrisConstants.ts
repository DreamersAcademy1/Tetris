export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;
export const HIDDEN_ROWS = 2;
export const TOTAL_ROWS = BOARD_ROWS + HIDDEN_ROWS;

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface BlockColor {
  fill: string;
  light: string;
  dark: string;
  glow: string;
  border: string;
}

export const TETROMINO_COLORS: Record<TetrominoType, BlockColor> = {
  I: {
    fill: '#06b6d4',      // Cyan
    light: '#67e8f9',
    dark: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.6)',
    border: '#22d3ee',
  },
  J: {
    fill: '#2563eb',      // Royal Blue
    light: '#60a5fa',
    dark: '#1d4ed8',
    glow: 'rgba(37, 99, 235, 0.6)',
    border: '#3b82f6',
  },
  L: {
    fill: '#ea580c',      // Orange
    light: '#fb923c',
    dark: '#c2410c',
    glow: 'rgba(234, 88, 12, 0.6)',
    border: '#f97316',
  },
  O: {
    fill: '#eab308',      // Canary Yellow
    light: '#fde047',
    dark: '#ca8a04',
    glow: 'rgba(234, 179, 8, 0.6)',
    border: '#facc15',
  },
  S: {
    fill: '#16a34a',      // Lime Green
    light: '#4ade80',
    dark: '#15803d',
    glow: 'rgba(22, 163, 74, 0.6)',
    border: '#22c55e',
  },
  T: {
    fill: '#9333ea',      // Purple
    light: '#c084fc',
    dark: '#7e22ce',
    glow: 'rgba(147, 51, 234, 0.6)',
    border: '#a855f7',
  },
  Z: {
    fill: '#dc2626',      // Crimson Red
    light: '#f87171',
    dark: '#b91c1c',
    glow: 'rgba(220, 38, 38, 0.6)',
    border: '#ef4444',
  },
};

// Standard SRS 4-state rotation matrices
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
};

// Super Rotation System (SRS) Wall Kick Data [x, y] offsets (y is down in grid coords)
export const SRS_KICKS_J_L_S_T_Z: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

export const SRS_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

export interface ActivePiece {
  type: TetrominoType;
  rotation: number; // 0, 1, 2, 3
  x: number;
  y: number;
}

export type GridCell = TetrominoType | null;

export type GameMode = 'marathon' | 'sprint' | 'ultra' | 'zen';

export interface GameStats {
  score: number;
  highScore: number;
  lines: number;
  level: number;
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
  maxCombo: number;
  currentCombo: number;
  timeElapsed: number; // in seconds
  backToBack: boolean;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
}

export interface HighScoreRecord {
  id: string;
  score: number;
  lines: number;
  level: number;
  date: string;
  mode: GameMode;
}
