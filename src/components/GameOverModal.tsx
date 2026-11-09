import React from 'react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { GameMode, GameStats } from '../game/tetrisConstants';
import { soundEngine } from '../game/soundEngine';

interface GameOverModalProps {
  isVictory?: boolean;
  gameMode: GameMode;
  stats: GameStats;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory = false,
  gameMode,
  stats,
  isNewHighScore,
  onRestart,
  onMenu,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 bg-slate-900 border-2 border-cyan-500/50 rounded-2xl neon-glow-cyan shadow-2xl flex flex-col items-center text-center">
        {/* Header Badge */}
        {isNewHighScore && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-pixel text-[10px] mb-3 animate-bounce">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        <h2 className="font-pixel text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-purple-400 mb-1">
          {isVictory ? 'SPRINT VICTORY!' : 'GAME OVER'}
        </h2>

        <p className="text-xs text-slate-400 font-arcade uppercase mb-5">
          {gameMode} MODE · RUN COMPLETED
        </p>

        {/* Score Card */}
        <div className="w-full p-4 mb-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
          <span className="text-xs font-pixel text-slate-400 mb-1">FINAL SCORE</span>
          <span className="font-pixel text-3xl text-cyan-300 neon-text-glow tabular-nums">
            {stats.score.toLocaleString()}
          </span>

          {stats.highScore > stats.score && (
            <span className="text-xs font-mono text-slate-500 mt-1">
              BEST: {stats.highScore.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-6 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Lines Cleared:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{stats.lines}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Level Reached:</span>
            <span className="text-purple-400 font-bold tabular-nums">{stats.level}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">TETRIS (4-Line):</span>
            <span className="text-cyan-400 font-bold tabular-nums">{stats.tetrises}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Max Combo:</span>
            <span className="text-amber-400 font-bold tabular-nums">
              {stats.maxCombo > 0 ? `x${stats.maxCombo}` : '0'}
            </span>
          </div>

          <div className="col-span-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Time Played:</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {formatTime(stats.timeElapsed)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 active:scale-95 text-slate-950 font-pixel text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onMenu();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-pixel text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
