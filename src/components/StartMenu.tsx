import React from 'react';
import { Play, Trophy, Flame, Zap, Shield, Sparkles } from 'lucide-react';
import { GameMode } from '../game/tetrisConstants';
import { soundEngine } from '../game/soundEngine';

interface StartMenuProps {
  gameMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  startingLevel: number;
  onSelectStartingLevel: (level: number) => void;
  highScores: Record<GameMode, number>;
  onStart: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  gameMode,
  onSelectMode,
  startingLevel,
  onSelectStartingLevel,
  highScores,
  onStart,
}) => {
  const modes: { id: GameMode; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'marathon',
      title: 'Marathon',
      desc: 'Endless classic survival. Level up every 10 lines.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/50 hover:border-amber-400 text-amber-400',
    },
    {
      id: 'sprint',
      title: '40-Line Sprint',
      desc: 'Race against the clock to clear 40 lines as fast as possible.',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/50 hover:border-cyan-400 text-cyan-400',
    },
    {
      id: 'ultra',
      title: 'Ultra (2 Min)',
      desc: 'Score as many points as you can in 120 seconds.',
      icon: <Trophy className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/50 hover:border-purple-400 text-purple-400',
    },
    {
      id: 'zen',
      title: 'Zen Mode',
      desc: 'Relaxed practice. No game over, unwinding puzzle play.',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/50 hover:border-emerald-400 text-emerald-400',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-slate-900/95 border-2 border-cyan-500/40 rounded-2xl neon-glow-cyan shadow-2xl backdrop-blur-xl flex flex-col items-center">
      {/* Title */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ARCADE EDITION 2026</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300 neon-text-glow tracking-wider">
          TETRIS RETRO
        </h1>
        <p className="text-slate-400 text-xs mt-1.5 font-arcade tracking-wide">
          SMOOTH 60FPS · CHIPTUNE SYNTH · SRS KICKS · GHOST PIECE
        </p>
      </div>

      {/* Mode Selector */}
      <div className="w-full mb-5">
        <label className="block text-xs font-pixel text-slate-300 mb-2.5">SELECT GAME MODE</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {modes.map(m => {
            const isSelected = gameMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectMode(m.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? `bg-slate-800/90 ${m.color} ring-2 ring-cyan-400/50 shadow-lg`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    {m.icon}
                    <span className="font-pixel text-xs text-slate-100">{m.title}</span>
                  </div>
                  {highScores[m.id] > 0 && (
                    <span className="text-[10px] font-mono text-amber-400">
                      ★ {highScores[m.id].toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Starting Level Selector */}
      {gameMode === 'marathon' && (
        <div className="w-full mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-pixel text-slate-300">STARTING LEVEL</span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              LEVEL {startingLevel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectStartingLevel(lvl);
                }}
                className={`flex-1 min-w-[32px] py-1.5 rounded-lg font-pixel text-[11px] transition-colors ${
                  startingLevel === lvl
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playClick();
          onStart();
        }}
        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 hover:from-cyan-400 hover:via-purple-400 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-pixel text-sm font-bold shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-transform"
      >
        <Play className="w-5 h-5 fill-slate-950" />
        <span>START GAME [SPACE]</span>
      </button>

      {/* Footer controls hint */}
      <div className="mt-4 text-center text-xs text-slate-500 font-mono">
        Desktop: Arrow Keys / WASD · Mobile: On-Screen Touch Controls
      </div>
    </div>
  );
};
