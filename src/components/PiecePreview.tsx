import React from 'react';
import { TetrominoType, TETROMINO_COLORS, TETROMINO_SHAPES } from '../game/tetrisConstants';

interface PiecePreviewProps {
  type: TetrominoType | null;
  size?: number; // size of each small block cell (px)
  dimmed?: boolean;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  size = 18,
  dimmed = false,
}) => {
  if (!type) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-800/80 bg-slate-950/60"
        style={{ width: `${size * 4 + 8}px`, height: `${size * 4 + 8}px` }}
      >
        <span className="text-xs text-slate-600 font-pixel">—</span>
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type][0]; // default 0 rotation
  const color = TETROMINO_COLORS[type];
  const matrixSize = shape.length;

  return (
    <div
      className={`relative flex items-center justify-center p-1 rounded-lg border border-slate-800/80 bg-slate-950/70 ${
        dimmed ? 'opacity-40' : ''
      }`}
      style={{
        width: `${size * 4 + 8}px`,
        height: `${size * 3 + 8}px`,
      }}
    >
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${matrixSize}, ${size}px)`,
          gridTemplateRows: `repeat(${matrixSize}, ${size}px)`,
        }}
      >
        {shape.map((row, r) =>
          row.map((cell, c) => {
            if (cell === 0) {
              return <div key={`${r}-${c}`} className="w-full h-full" />;
            }
            return (
              <div
                key={`${r}-${c}`}
                className="relative rounded-[2px] shadow-sm"
                style={{
                  backgroundColor: color.fill,
                  boxShadow: `inset 1px 1px 0px ${color.light}, inset -1px -1px 0px ${color.dark}`,
                  border: `1px solid ${color.border}`,
                }}
              >
                <div
                  className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/40 rounded-[1px]"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
