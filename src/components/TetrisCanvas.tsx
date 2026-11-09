import React, { useRef, useEffect, useState } from 'react';
import {
  BOARD_COLS,
  BOARD_ROWS,
  TOTAL_ROWS,
  ActivePiece,
  GridCell,
  TETROMINO_COLORS,
  Particle,
  FloatingText,
} from '../game/tetrisConstants';
import { getGhostPieceY, getPieceMatrix } from '../game/tetrisLogic';

interface TetrisCanvasProps {
  grid: GridCell[][];
  activePiece: ActivePiece | null;
  ghostEnabled: boolean;
  clearingLines: number[];
  shakeOffset: { x: number; y: number };
  particles: Particle[];
  floatingTexts: FloatingText[];
  onSwipeMove?: (dir: -1 | 1) => void;
  onSwipeDrop?: () => void;
  onSwipeRotate?: () => void;
  onTapHardDrop?: () => void;
}

export const TetrisCanvas: React.FC<TetrisCanvasProps> = ({
  grid,
  activePiece,
  ghostEnabled,
  clearingLines,
  shakeOffset,
  particles,
  floatingTexts,
  onSwipeMove,
  onSwipeDrop,
  onSwipeRotate,
  onTapHardDrop,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cellSize, setCellSize] = useState<number>(28);

  // Responsive cell size calculation based on available container height & width
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      // Board is 10 wide by 20 high (visible)
      const maxCellWidth = Math.floor((clientWidth - 16) / BOARD_COLS);
      const maxCellHeight = Math.floor((clientHeight - 16) / BOARD_ROWS);
      const calculated = Math.max(16, Math.min(34, maxCellWidth, maxCellHeight));
      setCellSize(calculated);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const width = BOARD_COLS * cellSize;
  const height = BOARD_ROWS * cellSize;

  // Touch gesture handling on canvas
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Tap detection (minimal movement within 250ms)
    if (dist < 12 && dt < 280) {
      onSwipeRotate?.();
    } else if (dist >= 24) {
      // Swiping gestures
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) {
          onSwipeMove?.(1);
        } else {
          onSwipeMove?.(-1);
        }
      } else {
        // Vertical swipe
        if (dy > 0) {
          onSwipeDrop?.();
        } else {
          onTapHardDrop?.();
        }
      }
    }

    touchStartRef.current = null;
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Apply board shake
    ctx.translate(shakeOffset.x, shakeOffset.y);

    // 1. Draw subtle retro grid background
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let c = 0; c <= BOARD_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, height);
      ctx.stroke();
    }

    for (let r = 0; r <= BOARD_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(width, r * cellSize);
      ctx.stroke();
    }

    // Helper: draw an arcade beveled glossy block
    const drawBlock = (
      col: number,
      row: number,
      type: string,
      isGhost: boolean = false
    ) => {
      const x = col * cellSize;
      const y = row * cellSize;
      const color = TETROMINO_COLORS[type as keyof typeof TETROMINO_COLORS] || TETROMINO_COLORS.I;

      if (isGhost) {
        // Ghost piece: translucent outlined block
        ctx.strokeStyle = color.border;
        ctx.fillStyle = color.glow.replace('0.6', '0.12');
        ctx.lineWidth = 1.5;

        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        ctx.strokeRect(x + 1.5, y + 1.5, cellSize - 3, cellSize - 3);

        // Subtle corner accents
        ctx.fillStyle = color.light;
        ctx.fillRect(x + 3, y + 3, 2, 2);
        ctx.fillRect(x + cellSize - 5, y + 3, 2, 2);
        return;
      }

      // Solid Arcade Block
      ctx.save();

      // Block Fill
      ctx.fillStyle = color.fill;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      // Top & Left Highlight Bevel
      ctx.fillStyle = color.light;
      ctx.beginPath();
      ctx.moveTo(x + 1, y + 1);
      ctx.lineTo(x + cellSize - 1, y + 1);
      ctx.lineTo(x + cellSize - 4, y + 4);
      ctx.lineTo(x + 4, y + 4);
      ctx.lineTo(x + 4, y + cellSize - 4);
      ctx.lineTo(x + 1, y + cellSize - 1);
      ctx.closePath();
      ctx.fill();

      // Bottom & Right Shadow Bevel
      ctx.fillStyle = color.dark;
      ctx.beginPath();
      ctx.moveTo(x + cellSize - 1, y + 1);
      ctx.lineTo(x + cellSize - 1, y + cellSize - 1);
      ctx.lineTo(x + 1, y + cellSize - 1);
      ctx.lineTo(x + 4, y + cellSize - 4);
      ctx.lineTo(x + cellSize - 4, y + cellSize - 4);
      ctx.lineTo(x + cellSize - 4, y + 4);
      ctx.closePath();
      ctx.fill();

      // Center glossy plate
      ctx.fillStyle = color.fill;
      ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

      // Crisp inner shine point
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.45;
      ctx.fillRect(x + 5, y + 5, 2.5, 2.5);

      ctx.restore();
    };

    // 2. Draw locked blocks on the board (skipping the 2 hidden rows)
    for (let r = 2; r < TOTAL_ROWS; r++) {
      const isClearing = clearingLines.includes(r);
      for (let c = 0; c < BOARD_COLS; c++) {
        const cell = grid[r][c];
        if (cell) {
          if (isClearing) {
            // Flashing white/yellow effect for cleared line
            const x = c * cellSize;
            const y = (r - 2) * cellSize;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 12;
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.shadowBlur = 0;
          } else {
            drawBlock(c, r - 2, cell);
          }
        }
      }
    }

    // 3. Draw Ghost Piece
    if (activePiece && ghostEnabled) {
      const ghostY = getGhostPieceY(grid, activePiece);
      const matrix = getPieceMatrix(activePiece.type, activePiece.rotation);
      const size = matrix.length;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c] !== 0) {
            const visualRow = ghostY + r - 2;
            const visualCol = activePiece.x + c;
            if (visualRow >= 0 && visualRow < BOARD_ROWS && visualCol >= 0 && visualCol < BOARD_COLS) {
              drawBlock(visualCol, visualRow, activePiece.type, true);
            }
          }
        }
      }
    }

    // 4. Draw Active Piece
    if (activePiece) {
      const matrix = getPieceMatrix(activePiece.type, activePiece.rotation);
      const size = matrix.length;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c] !== 0) {
            const visualRow = activePiece.y + r - 2;
            const visualCol = activePiece.x + c;
            if (visualRow >= 0 && visualRow < BOARD_ROWS && visualCol >= 0 && visualCol < BOARD_COLS) {
              drawBlock(visualCol, visualRow, activePiece.type, false);
            }
          }
        }
      }
    }

    // 5. Draw Particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

      ctx.restore();
    }

    // 6. Draw Floating Texts
    for (const ft of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.opacity;
      ctx.font = 'bold 15px "Press Start 2P", monospace';
      ctx.textAlign = 'center';

      // Outline shadow
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);

      // Glow fill
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y);

      ctx.restore();
    }

    ctx.restore();
  }, [
    grid,
    activePiece,
    ghostEnabled,
    clearingLines,
    shakeOffset,
    particles,
    floatingTexts,
    width,
    height,
    cellSize,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center p-2 rounded-xl bg-slate-900/90 border-2 border-cyan-500/30 neon-glow-cyan overflow-hidden touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: `${width + 16}px`,
        height: `${height + 16}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        className="block rounded-lg shadow-inner cursor-pointer"
      />
    </div>
  );
};
