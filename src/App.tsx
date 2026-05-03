/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RotateCcw, Smartphone, Zap, MessageSquare, ShoppingBag } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import TwitchChat from './components/TwitchChat';
import AudioEngine from './components/AudioEngine';
import IconShop from './components/IconShop';
import LevelSelect from './components/LevelSelect';
import { GameState, Level } from './types';
import { LEVELS } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVELS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('neon-dash-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [playerColor, setPlayerColor] = useState(() => {
    return localStorage.getItem('neon-dash-player-color') || '#00ffff';
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setHighScore(prev => {
      const newHigh = Math.max(prev, finalScore);
      localStorage.setItem('neon-dash-highscore', newHigh.toString());
      return newHigh;
    });
    setGameState('GAMEOVER');
  }, []);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setScore(0);
    setGameState('PLAYING');
  };

  const startGame = useCallback(() => {
    setGameState('LEVEL_SELECT');
  }, []);

  const handleSelectColor = (color: string) => {
    setPlayerColor(color);
    localStorage.setItem('neon-dash-player-color', color);
  };

  if (!isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6 text-center">
        <div className="w-24 h-40 border-4 border-cyan-500 rounded-3xl mb-8 flex items-center justify-center animate-bounce">
          <Smartphone className="w-12 h-12 text-cyan-400" />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase italic neon-glow text-cyan-400">Mobile Only</h1>
        <p className="text-neutral-400 max-w-xs text-lg mb-8">
          This neon experience was crafted exclusively for mobile touch devices. 
          Please open this link on your smartphone to play.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsMobile(true)}
            className="px-6 py-2 border border-neutral-800 rounded-full text-xs uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
          >
            Force Desktop Mode (Dev)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none touch-none">
      <AudioEngine isActive={gameState === 'PLAYING'} score={score} />
      
      <AnimatePresence mode="wait">
        {gameState === 'LEVEL_SELECT' && (
          <LevelSelect 
            onSelect={handleSelectLevel}
            onBack={() => setGameState('START')}
            highScore={highScore}
          />
        )}

        {gameState === 'SHOP' && (
          <IconShop 
            onClose={() => setGameState('START')}
            selectedColor={playerColor}
            onSelectColor={handleSelectColor}
            highScore={highScore}
          />
        )}

        {gameState === 'START' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[#050505]" />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(0,255,255,0.1)_0%,transparent_70%)]"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

            <div className="relative mb-12">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-12 border border-cyan-500/20 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-fuchsia-500/20 rounded-full"
              />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full whitespace-nowrap"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 italic">Noe Lopez Edition</span>
              </motion.div>
              <h1 className="text-7xl font-black italic tracking-tighter uppercase neon-glow text-cyan-400 transform -skew-x-12 leading-none text-center">
                NEON<br />DASH
              </h1>
            </div>

            <TwitchChat />

            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={startGame}
                className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-cyan-500 neon-border hover:bg-cyan-400 transition-all active:scale-95"
              >
                <Play className="w-10 h-10 text-black fill-current ml-1" />
              </button>
              
              <div className="flex flex-row gap-6 items-center">
                <button 
                  onClick={() => setGameState('SHOP')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-active:scale-90 transition-transform">
                    <ShoppingBag className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <span className="text-[8px] uppercase tracking-widest text-neutral-500">Shop</span>
                </button>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Best Score</span>
                  <div className="flex items-center gap-2 text-2xl font-bold text-fuchsia-400">
                    <Trophy className="w-5 h-5" />
                    {highScore}
                  </div>
                </div>
              </div>
            </div>

            <p className="absolute bottom-12 text-[10px] uppercase tracking-[0.4em] text-neutral-600 font-medium">
              Tap anywhere to jump
            </p>
          </motion.div>
        )}

        {gameState === 'GAMEOVER' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-red-500 neon-glow mb-2">CRASHED</h2>
            <p className="text-neutral-500 text-sm uppercase tracking-widest mb-12">Attempt Failed</p>
            
            <div className="flex gap-12 mb-16">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Score</p>
                <p className="text-4xl font-bold text-white">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">High Score</p>
                <p className="text-4xl font-bold text-cyan-400">{highScore}</p>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase italic tracking-tighter rounded-full hover:bg-neutral-200 transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              Retry Run
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-full">
        {/* Simple HUD */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-8 left-0 right-0 z-5 px-8 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Progress</span>
              <div className="text-3xl font-black italic tracking-tighter text-white tabular-nums">
                {score}
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
              <Zap className="w-3 h-3 text-cyan-400 fill-current" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Neon Core Active</span>
            </div>
          </div>
        )}

        <GameCanvas 
          isActive={gameState === 'PLAYING'} 
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          playerColor={playerColor}
          level={selectedLevel}
        />
      </div>
    </div>
  );
}
