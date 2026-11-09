import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/60 px-3 py-1.5 text-xs font-mono text-amber-300 backdrop-blur-md shadow-lg neon-glow-amber animate-in fade-in duration-200">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>OFFLINE MODE · PLAYING FROM CACHE</span>
    </div>
  );
};
