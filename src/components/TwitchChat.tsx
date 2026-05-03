import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  color: string;
}

const NOE_LOPEZ_PHRASES = [
  "W GAME",
  "NOE LOPEZ IS THE GOAT",
  "FIRE IN THE HOLE",
  "WATER ON THE HILL",
  "LOBOTOMY DASH REAL?",
  "SHEESH NOE",
  "W RHYTHM",
  "EASY W",
  "NOE LOPEZ LANGUAGE ONLY",
  "GOAT STATUS",
  "W DASH",
  "NEON W",
  "W MOBILE PORT",
  "NOE LOPEZ CLAN",
  "W NOE",
];

const CHAT_USERS = [
  "NoeFan99", "DashMaster", "NeonRider", "LopezWatcher", "GD_God", 
  "RhythmKing", "StreamWatcher", "X_Noe_X", "Gamer123", "MobilePro"
];

const USER_COLORS = [
  "#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff", "#ffa500"
];

export default function TwitchChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        user: CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)],
        text: NOE_LOPEZ_PHRASES[Math.floor(Math.random() * NOE_LOPEZ_PHRASES.length)],
        color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
      };

      setMessages(prev => [...prev.slice(-10), newMessage]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-24 right-4 w-48 max-h-60 overflow-hidden flex flex-col justify-end pointer-events-none z-20">
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/5 flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1 border-bottom border-white/10 pb-1">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Live Chat</span>
        </div>
        <div className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[9px] flex gap-1 items-start leading-tight"
              >
                <span className="font-bold shrink-0" style={{ color: msg.color }}>{msg.user}:</span>
                <span className="text-white font-medium break-words">{msg.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
