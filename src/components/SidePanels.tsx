import React from 'react';
import { TetrominoType, GameStats } from '../game/tetrisConstants';
import { PiecePreview } from './PiecePreview';

interface LeftPanelProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
  stats: GameStats;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ holdPiece, canHold, stats }) => {
  return (
    <div className="flex flex-col gap-3 w-32 md:w-36">
      {/* HOLD PIECE BOX */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 neon-glow-purple flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-1.5 px-1">
          <span className="font-pixel text-[10px] text-purple-400">HOLD</span>
          <span className="text-[9px] font-mono text-slate-500">[C]</span>
        </div>
        <PiecePreview type={holdPiece} size={16} dimmed={!canHold} />
        {!canHold && (
          <span className="text-[9px] text-slate-500 font-pixel mt-1">LOCKED</span>
        )}
      </div>

      {/* STATS BREAKDOWN */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col gap-1.5 text-xs">
        <span className="font-pixel text-[9px] text-slate-400 mb-1">STATS</span>

        <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
          <span>TETRIS</span>
          <span className="text-cyan-400 font-bold tabular-nums">{stats.tetrises}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
          <span>TRIPLES</span>
          <span className="text-amber-400 font-bold tabular-nums">{stats.triples}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
          <span>DOUBLES</span>
          <span className="text-emerald-400 font-bold tabular-nums">{stats.doubles}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
          <span>SINGLES</span>
          <span className="text-blue-400 font-bold tabular-nums">{stats.singles}</span>
        </div>

        <div className="h-[1px] bg-slate-800 my-0.5" />

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">MAX COMBO</span>
          <span className="text-purple-400 font-bold tabular-nums">
            {stats.maxCombo > 0 ? `x${stats.maxCombo}` : '0'}
          </span>
        </div>

        {stats.backToBack && (
          <div className="mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-pixel text-[8px] text-center">
            B2B ACTIVE
          </div>
        )}
      </div>
    </div>
  );
};

interface RightPanelProps {
  nextQueue: TetrominoType[];
}

export const RightPanel: React.FC<RightPanelProps> = ({ nextQueue }) => {
  const visibleNext = nextQueue.slice(0, 3);

  return (
    <div className="flex flex-col gap-3 w-32 md:w-36">
      {/* NEXT QUEUE BOX */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 neon-glow-cyan flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-1.5 px-1">
          <span className="font-pixel text-[10px] text-cyan-400">NEXT</span>
          <span className="text-[9px] font-mono text-slate-500">QUEUE</span>
        </div>
        <div className="flex flex-col gap-2 items-center">
          {visibleNext.map((type, idx) => (
            <PiecePreview key={`${type}-${idx}`} type={type} size={idx === 0 ? 16 : 14} />
          ))}
        </div>
      </div>

      {/* QUICK KEYBOARD GUIDE (hidden on small screens) */}
      <div className="hidden lg:flex p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex-col gap-1 text-[10px] font-mono text-slate-400">
        <span className="font-pixel text-[9px] text-slate-400 mb-0.5">CONTROLS</span>
        <div className="flex justify-between">
          <span>Move:</span>
          <span className="text-slate-200">← / →</span>
        </div>
        <div className="flex justify-between">
          <span>Rotate:</span>
          <span className="text-slate-200">↑ / Z</span>
        </div>
        <div className="flex justify-between">
          <span>Soft Drop:</span>
          <span className="text-slate-200">↓</span>
        </div>
        <div className="flex justify-between">
          <span>Hard Drop:</span>
          <span className="text-slate-200">SPACE</span>
        </div>
        <div className="flex justify-between">
          <span>Hold:</span>
          <span className="text-slate-200">C</span>
        </div>
        <div className="flex justify-between">
          <span>Pause:</span>
          <span className="text-slate-200">P / ESC</span>
        </div>
      </div>
    </div>
  );
};
