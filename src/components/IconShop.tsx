import { motion } from 'motion/react';
import { X, Lock, Check } from 'lucide-react';
import { PlayerCustomization } from '../types';

interface IconShopProps {
  onClose: () => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  highScore: number;
}

const COLORS_FOR_SALE: PlayerCustomization[] = [
  { name: 'Default', color: '#00ffff', cost: 0 },
  { name: 'Neon Lime', color: '#44ff44', cost: 0 },
  { name: 'Fuchsia', color: '#ff44ff', cost: 0 },
  { name: 'Golden Goat', color: '#ffd700', cost: 20 }, // Requires score of 20
];

export default function IconShop({ onClose, selectedColor, onSelectColor, highScore }: IconShopProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-x-4 top-20 bottom-20 z-50 bg-neutral-900/95 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col items-center"
    >
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-cyan-400">Icon Shop</h2>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full overflow-y-auto pb-6">
        {COLORS_FOR_SALE.map((item) => {
          const isLocked = highScore < item.cost;
          const isSelected = selectedColor === item.color;

          return (
            <button
              key={item.color}
              disabled={isLocked}
              onClick={() => onSelectColor(item.color)}
              className={`
                relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all
                ${isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5'}
                ${isLocked ? 'opacity-50 grayscale' : 'active:scale-95'}
              `}
            >
              <div 
                className="w-12 h-12 rounded-lg shadow-lg"
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: `0 0 15px ${item.color}`
                }}
              />
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">{item.name}</p>
                {isLocked ? (
                  <div className="flex items-center gap-1 text-[8px] text-fuchsia-500 mt-1">
                    <Lock className="w-2 h-2" />
                    <span>SCORE {item.cost} REQ</span>
                  </div>
                ) : isSelected ? (
                  <div className="flex items-center gap-1 text-[8px] text-cyan-400 mt-1">
                    <Check className="w-2 h-2" />
                    <span>SELECTED</span>
                  </div>
                ) : (
                  <p className="text-[8px] text-neutral-500 mt-1">UNLOCKED</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-auto text-[10px] uppercase tracking-widest text-neutral-500 text-center leading-relaxed">
        Your high score: {highScore}<br/>
        Play more to unlock special "Noe Lopez" skins
      </p>
    </motion.div>
  );
}
