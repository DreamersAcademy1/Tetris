import {
  BOARD_COLS,
  BOARD_ROWS,
  TOTAL_ROWS,
  TetrominoType,
  TETROMINO_SHAPES,
  SRS_KICKS_J_L_S_T_Z,
  SRS_KICKS_I,
  ActivePiece,
  GridCell,
} from './tetrisConstants';

export function createEmptyGrid(): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const row: GridCell[] = new Array(BOARD_COLS).fill(null);
    grid.push(row);
  }
  return grid;
}

export function shuffleBag(): TetrominoType[] {
  const pieces: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

export function getPieceMatrix(type: TetrominoType, rotation: number): number[][] {
  const shapes = TETROMINO_SHAPES[type];
  const rot = ((rotation % 4) + 4) % 4;
  return shapes[rot];
}

export function checkCollision(
  grid: GridCell[][],
  type: TetrominoType,
  rotation: number,
  px: number,
  py: number
): boolean {
  const matrix = getPieceMatrix(type, rotation);
  const size = matrix.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] !== 0) {
        const boardX = px + c;
        const boardY = py + r;

        // Check horizontal boundaries
        if (boardX < 0 || boardX >= BOARD_COLS) {
          return true;
        }
        // Check bottom boundary
        if (boardY >= TOTAL_ROWS) {
          return true;
        }
        // Check collision with already locked cells (if inside board)
        if (boardY >= 0 && grid[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }

  return false;
}

export function getGhostPieceY(
  grid: GridCell[][],
  piece: ActivePiece
): number {
  let testY = piece.y;
  while (!checkCollision(grid, piece.type, piece.rotation, piece.x, testY + 1)) {
    testY++;
  }
  return testY;
}

export function getWallKicks(
  type: TetrominoType,
  fromRot: number,
  toRot: number
): [number, number][] {
  if (type === 'O') {
    return [[0, 0]];
  }

  const key = `${fromRot}->${toRot}`;
  if (type === 'I') {
    return SRS_KICKS_I[key] || [[0, 0]];
  }
  return SRS_KICKS_J_L_S_T_Z[key] || [[0, 0]];
}

export function lockPieceToGrid(
  grid: GridCell[][],
  piece: ActivePiece
): GridCell[][] {
  const newGrid = grid.map(row => [...row]);
  const matrix = getPieceMatrix(piece.type, piece.rotation);
  const size = matrix.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] !== 0) {
        const boardX = piece.x + c;
        const boardY = piece.y + r;
        if (boardY >= 0 && boardY < TOTAL_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
          newGrid[boardY][boardX] = piece.type;
        }
      }
    }
  }

  return newGrid;
}

export function findFullLines(grid: GridCell[][]): number[] {
  const fullLines: number[] = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    if (grid[r].every(cell => cell !== null)) {
      fullLines.push(r);
    }
  }
  return fullLines;
}

export function clearLinesFromGrid(
  grid: GridCell[][],
  linesToClear: number[]
): GridCell[][] {
  if (linesToClear.length === 0) return grid;

  const lineSet = new Set(linesToClear);
  const remainingRows = grid.filter((_, idx) => !lineSet.has(idx));
  const newRowsNeeded = TOTAL_ROWS - remainingRows.length;

  const newEmptyRows: GridCell[][] = [];
  for (let i = 0; i < newRowsNeeded; i++) {
    newEmptyRows.push(new Array(BOARD_COLS).fill(null));
  }

  return [...newEmptyRows, ...remainingRows];
}

export function getDropIntervalMs(level: number): number {
  // Classic curve: speed scales smoothly as level increases
  const speeds = [
    800, // Lvl 1
    710, // Lvl 2
    620, // Lvl 3
    530, // Lvl 4
    450, // Lvl 5
    370, // Lvl 6
    290, // Lvl 7
    220, // Lvl 8
    160, // Lvl 9
    110, // Lvl 10
    90,  // Lvl 11
    80,  // Lvl 12
    70,  // Lvl 13
    60,  // Lvl 14
    50,  // Lvl 15+
  ];
  const idx = Math.min(Math.max(1, level) - 1, speeds.length - 1);
  return speeds[idx];
}

export function createNewPiece(type: TetrominoType): ActivePiece {
  // Center spawn position
  let startX = 3;
  if (type === 'O') startX = 4;
  if (type === 'I') startX = 3;

  return {
    type,
    rotation: 0,
    x: startX,
    y: 0, // In hidden buffer top area
  };
}
