import React from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Tv,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { GameMode, GameStats } from '../game/tetrisConstants';
import { soundEngine } from '../game/soundEngine';
import { PWAInstallButton } from './PWAInstallButton';

interface ArcadeHudProps {
  stats: GameStats;
  gameMode: GameMode;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  ghostEnabled: boolean;
  onToggleGhost: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bgmEnabled: boolean;
  onToggleBgm: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const ArcadeHud: React.FC<ArcadeHudProps> = ({
  stats,
  gameMode,
  crtEnabled,
  onToggleCrt,
  ghostEnabled,
  onToggleGhost,
  isMuted,
  onToggleMute,
  bgmEnabled,
  onToggleBgm,
  onPause,
  onRestart,
}) => {
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ultra remaining time
  const ultraTimeRemaining = Math.max(0, 120 - stats.timeElapsed);

  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-2 mb-2 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md rounded-xl">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 text-sm tracking-wider">
            TETRIS
          </span>
          <span className="text-[10px] font-pixel px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
            {gameMode}
          </span>
        </div>

        {/* Timer or Goal */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 tabular-nums">
          <span className="text-slate-500">TIME:</span>
          <span className="text-slate-200 font-semibold">
            {gameMode === 'ultra' ? formatTime(ultraTimeRemaining) : formatTime(stats.timeElapsed)}
          </span>
        </div>
      </div>

      {/* Primary Score Counter */}
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-pixel">SCORE</span>
          <span className="font-pixel text-lg text-cyan-300 tabular-nums neon-text-glow">
            {stats.score.toLocaleString()}
          </span>
        </div>

        <div className="hidden sm:flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-pixel">BEST</span>
          <span className="font-pixel text-base text-amber-400 tabular-nums">
            {stats.highScore.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-pixel">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-500">LVL</span>
            <span className="text-purple-300 text-sm tabular-nums">{stats.level}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-500">LINES</span>
            <span className="text-emerald-300 text-sm tabular-nums">{stats.lines}</span>
          </div>
        </div>
      </div>

      {/* Action / Setting Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleGhost();
          }}
          title={ghostEnabled ? 'Disable Ghost Piece' : 'Enable Ghost Piece'}
          className={`p-2 rounded-lg border transition-colors ${
            ghostEnabled
              ? 'bg-slate-800/90 border-cyan-500/40 text-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {ghostEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleCrt();
          }}
          title={crtEnabled ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
          className={`p-2 rounded-lg border transition-colors ${
            crtEnabled
              ? 'bg-slate-800/90 border-purple-500/40 text-purple-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          <Tv className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleBgm();
          }}
          title={bgmEnabled ? 'Disable 8-Bit BGM' : 'Enable 8-Bit BGM'}
          className={`p-2 rounded-lg border transition-colors ${
            bgmEnabled
              ? 'bg-slate-800/90 border-amber-500/40 text-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute All Sounds' : 'Mute All Sounds'}
          className={`p-2 rounded-lg border transition-colors ${
            !isMuted
              ? 'bg-slate-800/90 border-slate-700 text-slate-300'
              : 'bg-red-950/60 border-red-800/60 text-red-400'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onPause}
          title="Pause Game (P / Esc)"
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Pause className="w-4 h-4" />
        </button>

        <PWAInstallButton compact />

        <button
          type="button"
          onClick={onRestart}
          title="Restart Game (R)"
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
