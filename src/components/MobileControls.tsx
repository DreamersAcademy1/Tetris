import React, { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHold: () => void;
  canHold: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCw,
  onRotateCcw,
  onHold,
  canHold,
}) => {
  const repeatTimerRef = useRef<number | null>(null);

  const startRepeating = (action: () => void) => {
    action();
    repeatTimerRef.current = window.setInterval(action, 80);
  };

  const stopRepeating = () => {
    if (repeatTimerRef.current !== null) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-2 flex items-center justify-between gap-3 select-none touch-none">
      {/* Directional Pad */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              startRepeating(onMoveLeft);
            }}
            onTouchEnd={stopRepeating}
            onMouseDown={() => startRepeating(onMoveLeft)}
            onMouseUp={stopRepeating}
            onMouseLeave={stopRepeating}
            aria-label="Move Left"
            className="w-14 h-14 rounded-xl bg-slate-800/90 border border-slate-700/80 active:bg-cyan-600/40 active:border-cyan-400 active:scale-95 flex items-center justify-center text-cyan-400 shadow-md transition-transform"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              startRepeating(onSoftDrop);
            }}
            onTouchEnd={stopRepeating}
            onMouseDown={() => startRepeating(onSoftDrop)}
            onMouseUp={stopRepeating}
            onMouseLeave={stopRepeating}
            aria-label="Soft Drop"
            className="w-14 h-14 rounded-xl bg-slate-800/90 border border-slate-700/80 active:bg-amber-600/40 active:border-amber-400 active:scale-95 flex items-center justify-center text-amber-400 shadow-md transition-transform"
          >
            <ArrowDown className="w-7 h-7" />
          </button>

          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              startRepeating(onMoveRight);
            }}
            onTouchEnd={stopRepeating}
            onMouseDown={() => startRepeating(onMoveRight)}
            onMouseUp={stopRepeating}
            onMouseLeave={stopRepeating}
            aria-label="Move Right"
            className="w-14 h-14 rounded-xl bg-slate-800/90 border border-slate-700/80 active:bg-cyan-600/40 active:border-cyan-400 active:scale-95 flex items-center justify-center text-cyan-400 shadow-md transition-transform"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Hold Piece */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            if (canHold) onHold();
          }}
          onClick={() => {
            if (canHold) onHold();
          }}
          disabled={!canHold}
          aria-label="Hold Piece"
          className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shadow-md transition-transform active:scale-95 ${
            canHold
              ? 'bg-slate-800/90 border-purple-500/50 text-purple-400 active:bg-purple-600/40'
              : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-[9px] font-pixel mt-0.5">HOLD</span>
        </button>

        {/* Rotate CCW */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onRotateCcw();
          }}
          onClick={onRotateCcw}
          aria-label="Rotate Counter-Clockwise"
          className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 active:bg-emerald-600/40 active:border-emerald-400 active:scale-95 flex flex-col items-center justify-center text-emerald-400 shadow-md transition-transform"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[9px] font-pixel mt-0.5">CCW</span>
        </button>

        {/* Rotate CW (Primary Rotate) */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onRotateCw();
          }}
          onClick={onRotateCw}
          aria-label="Rotate Clockwise"
          className="w-14 h-14 rounded-2xl bg-emerald-600/20 border-2 border-emerald-500/80 active:bg-emerald-500/40 active:scale-95 flex flex-col items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/20 transition-transform"
        >
          <RotateCw className="w-6 h-6" />
          <span className="text-[9px] font-pixel mt-0.5">ROT</span>
        </button>

        {/* Hard Drop (Instant Slam) */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onHardDrop();
          }}
          onClick={onHardDrop}
          aria-label="Hard Drop"
          className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 active:bg-amber-400/40 active:scale-95 flex flex-col items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20 transition-transform"
        >
          <Zap className="w-6 h-6 fill-amber-400" />
          <span className="text-[9px] font-pixel mt-0.5">DROP</span>
        </button>
      </div>
    </div>
  );
};
