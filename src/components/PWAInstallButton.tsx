import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../game/soundEngine';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone app, do not display
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    soundEngine.playClick();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not iOS, render a friendly download/offline badge or return null
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Install Tetris Arcade for Offline Play"
        className={`flex items-center gap-1.5 rounded-lg border font-pixel text-xs transition-all active:scale-95 ${
          compact
            ? 'p-2 bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60'
            : 'px-3 py-1.5 bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-cyan-500/50 hover:border-cyan-400 text-cyan-200'
        }`}
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span className={compact ? 'hidden sm:inline text-[10px]' : 'text-[10px]'}>
          {isIOS ? 'INSTALL APP' : 'INSTALL APP'}
        </span>
      </button>

      {/* iOS Guided Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 bg-slate-900 border-2 border-cyan-500/60 rounded-2xl neon-glow-cyan shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="font-pixel text-sm text-slate-100">INSTALL ON IOS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Install Tetris Arcade directly to your home screen for instant full-screen offline gameplay:
            </p>

            <ol className="space-y-3 text-xs text-slate-300 font-mono mb-5">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>
                  Tap the <Share2 className="inline w-3.5 h-3.5 text-cyan-400 mx-0.5" /> <strong>Share</strong> button in the Safari toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>
                  Launch the app from your home screen anytime—even completely offline!
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs transition-colors"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
};
