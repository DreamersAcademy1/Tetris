import React, { useState } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music, Tv } from 'lucide-react';
import { soundEngine } from '../game/soundEngine';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bgmEnabled: boolean;
  onToggleBgm: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMenu,
  crtEnabled,
  onToggleCrt,
  isMuted,
  onToggleMute,
  bgmEnabled,
  onToggleBgm,
}) => {
  const [sfxVol, setSfxVol] = useState<number>(0.5);
  const [bgmVol, setBgmVol] = useState<number>(0.3);

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundEngine.setVolume(val, bgmVol);
    soundEngine.playClick();
  };

  const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBgmVol(val);
    soundEngine.setVolume(sfxVol, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm p-6 bg-slate-900 border-2 border-purple-500/50 rounded-2xl neon-glow-purple shadow-2xl flex flex-col items-center text-center">
        <h2 className="font-pixel text-xl text-purple-300 mb-4 tracking-wider">
          GAME PAUSED
        </h2>

        {/* Audio & Display Quick Settings */}
        <div className="w-full p-3.5 mb-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3 text-left">
          <span className="text-[10px] font-pixel text-slate-400">AUDIO & DISPLAY</span>

          {/* Master Mute & CRT */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onToggleMute();
              }}
              className="flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>{isMuted ? 'Muted' : 'Sound Enabled'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onToggleCrt();
              }}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white"
            >
              <Tv className={`w-4 h-4 ${crtEnabled ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>CRT {crtEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* BGM Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onToggleBgm();
              }}
              className="flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white"
            >
              <Music className={`w-4 h-4 ${bgmEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>8-Bit Music: {bgmEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Volume Sliders */}
          <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>SFX Volume:</span>
              <span>{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxChange}
              className="accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>BGM Volume:</span>
              <span>{Math.round(bgmVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVol}
              onChange={handleBgmChange}
              className="accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 active:scale-95 text-slate-950 font-pixel text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-transform"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME [P]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-pixel text-[11px] flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART [R]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 font-pixel text-[11px] flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
