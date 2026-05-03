import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Lock } from 'lucide-react';
import { Level } from '../types';
import { LEVELS } from '../constants';
import { useState } from 'react';

interface LevelSelectProps {
  onSelect: (level: Level) => void;
  onBack: () => void;
  highScore: number;
}

export default function LevelSelect({ onSelect, onBack, highScore }: LevelSelectProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];

  const nextLevel = () => setLevelIndex((prev) => (prev + 1) % LEVELS.length);
  const prevLevel = () => setLevelIndex((prev) => (prev === 0 ? LEVELS.length - 1 : prev - 1));

  // Requirements for levels
  const requirements = [0, 0, 10, 25, 50];
  const isLocked = highScore < requirements[levelIndex];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 p-3 bg-white/5 rounded-full border border-white/10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mb-2">Select Expedition</p>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Level Selection</h2>
      </div>

      <div className="relative w-full max-w-sm flex items-center justify-center gap-4">
        <button onClick={prevLevel} className="p-2 hover:text-cyan-400 transition-colors">
          <ChevronLeft className="w-10 h-10" />
        </button>

        <motion.div 
          key={levelIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6"
        >
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ 
              backgroundColor: currentLevel.color,
              boxShadow: `0 0 30px ${currentLevel.color}44`
            }}
          >
            {isLocked ? <Lock className="w-10 h-10 text-black/50" /> : <div className="w-10 h-10 border-4 border-black/20 rounded" />}
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">{currentLevel.name}</h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-white/10 rounded text-neutral-400">
                {currentLevel.difficulty}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">
                ID: 0{currentLevel.id}
              </span>
            </div>
          </div>

          {isLocked ? (
            <div className="text-center text-fuchsia-500">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Locked</p>
              <p className="text-xs font-medium">Requires High Score: {requirements[levelIndex]}</p>
            </div>
          ) : (
            <button 
              onClick={() => onSelect(currentLevel)}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-black uppercase italic tracking-tighter rounded-xl hover:bg-neutral-200 transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Begin Run
            </button>
          )}
        </motion.div>

        <button onClick={nextLevel} className="p-2 hover:text-cyan-400 transition-colors">
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>

      <div className="mt-12 flex gap-2">
        {LEVELS.map((_, i) => (
          <div 
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === levelIndex ? 'bg-cyan-400 w-4' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
