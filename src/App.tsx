/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTetrisGame } from './game/useTetrisGame';
import { soundEngine } from './game/soundEngine';
import { ArcadeHud } from './components/ArcadeHud';
import { TetrisCanvas } from './components/TetrisCanvas';
import { LeftPanel, RightPanel } from './components/SidePanels';
import { PiecePreview } from './components/PiecePreview';
import { MobileControls } from './components/MobileControls';
import { StartMenu } from './components/StartMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  const {
    gameState,
    gameMode,
    setGameMode,
    startingLevel,
    setStartingLevel,
    crtEnabled,
    setCrtEnabled,
    ghostEnabled,
    setGhostEnabled,
    grid,
    activePiece,
    nextQueue,
    holdPiece,
    canHold,
    clearingLines,
    boardShake,
    particles,
    floatingTexts,
    stats,
    highScores,
    isNewHighScore,
    startGame,
    togglePause,
    returnToMenu,
    moveHorizontally,
    softDrop,
    hardDrop,
    rotatePiece,
    holdCurrentPiece,
  } = useTetrisGame();

  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(soundEngine.getBgmEnabled());

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    soundEngine.setBgmEnabled(next);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden retro-grid font-arcade">
      {/* Ambient Neon Atmosphere Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* CRT Scanline Filter Overlay */}
      {crtEnabled && (
        <div className="fixed inset-0 z-40 crt-overlay pointer-events-none" />
      )}

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-2 sm:px-4 py-3 flex-1 flex flex-col items-center justify-center">
        {gameState === 'MENU' ? (
          <StartMenu
            gameMode={gameMode}
            onSelectMode={setGameMode}
            startingLevel={startingLevel}
            onSelectStartingLevel={setStartingLevel}
            highScores={highScores}
            onStart={() => startGame(gameMode, startingLevel)}
          />
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Top Arcade HUD */}
            <ArcadeHud
              stats={stats}
              gameMode={gameMode}
              crtEnabled={crtEnabled}
              onToggleCrt={() => setCrtEnabled(!crtEnabled)}
              ghostEnabled={ghostEnabled}
              onToggleGhost={() => setGhostEnabled(!ghostEnabled)}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              bgmEnabled={bgmEnabled}
              onToggleBgm={handleToggleBgm}
              onPause={togglePause}
              onRestart={() => startGame(gameMode, startingLevel)}
            />

            {/* Mobile Mini Hold & Next Bar (Visible only on small viewports) */}
            <div className="flex md:hidden items-center justify-between w-full max-w-sm px-2 mb-2 gap-2">
              <button
                type="button"
                onClick={holdCurrentPiece}
                disabled={!canHold}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/90 border border-purple-500/40 text-left"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-pixel text-purple-400">HOLD</span>
                  <span className="text-[8px] text-slate-500">{canHold ? 'TAP' : 'LOCK'}</span>
                </div>
                <PiecePreview type={holdPiece} size={11} dimmed={!canHold} />
              </button>

              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-right">
                <PiecePreview type={nextQueue[0] || null} size={11} />
                <div className="flex flex-col">
                  <span className="text-[9px] font-pixel text-cyan-400">NEXT</span>
                  <span className="text-[8px] text-slate-500">1 OF 3</span>
                </div>
              </div>
            </div>

            {/* Game Arena: Left Panel, Center Canvas, Right Panel */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 my-auto">
              {/* Left Sidebar (Desktop / Tablet) */}
              <div className="hidden md:block">
                <LeftPanel
                  holdPiece={holdPiece}
                  canHold={canHold}
                  stats={stats}
                />
              </div>

              {/* Center Game Canvas */}
              <div className="flex flex-col items-center">
                <TetrisCanvas
                  grid={grid}
                  activePiece={activePiece}
                  ghostEnabled={ghostEnabled}
                  clearingLines={clearingLines}
                  shakeOffset={boardShake}
                  particles={particles}
                  floatingTexts={floatingTexts}
                  onSwipeMove={moveHorizontally}
                  onSwipeDrop={softDrop}
                  onSwipeRotate={() => rotatePiece(1)}
                  onTapHardDrop={hardDrop}
                />
              </div>

              {/* Right Sidebar (Desktop / Tablet) */}
              <div className="hidden md:block">
                <RightPanel nextQueue={nextQueue} />
              </div>
            </div>

            {/* Mobile Virtual Controller */}
            <div className="w-full mt-2 block md:hidden">
              <MobileControls
                onMoveLeft={() => moveHorizontally(-1)}
                onMoveRight={() => moveHorizontally(1)}
                onSoftDrop={softDrop}
                onHardDrop={hardDrop}
                onRotateCw={() => rotatePiece(1)}
                onRotateCcw={() => rotatePiece(-1)}
                onHold={holdCurrentPiece}
                canHold={canHold}
              />
            </div>
          </div>
        )}
      </main>

      {/* Overlays & Modals */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={togglePause}
          onRestart={() => startGame(gameMode, startingLevel)}
          onMenu={returnToMenu}
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled(!crtEnabled)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          bgmEnabled={bgmEnabled}
          onToggleBgm={handleToggleBgm}
        />
      )}

      {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
        <GameOverModal
          isVictory={gameState === 'VICTORY'}
          gameMode={gameMode}
          stats={stats}
          isNewHighScore={isNewHighScore}
          onRestart={() => startGame(gameMode, startingLevel)}
          onMenu={returnToMenu}
        />
      )}
    </div>
  );
}
