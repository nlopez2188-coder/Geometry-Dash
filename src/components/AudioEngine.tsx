import { useEffect, useRef } from 'react';

interface AudioEngineProps {
  isActive: boolean;
  score: number;
}

export default function AudioEngine({ isActive, score }: AudioEngineProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const beatRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);

  const playOsc = (freq: number, type: OscillatorType, startTime: number, duration: number, volume: number) => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const scheduler = () => {
    if (!audioCtxRef.current || !isActive) return;

    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      const time = nextNoteTimeRef.current;
      const beat = beatRef.current % 16;

      // Kick Drum (Every 4 beats)
      if (beat % 4 === 0) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start(time);
        osc.stop(time + 0.1);
      }

      // Funky Bass (Square wave)
      const bassNotes = [55, 55, 65, 41, 55, 41, 82, 55];
      if (beat % 2 === 0) {
        playOsc(bassNotes[beat % bassNotes.length], 'square', time, 0.15, 0.1);
      }

      // Geometrical Melody (High pings)
      // Complexity increases slightly with score
      const scale = [220, 247, 261, 293, 329, 349, 392, 440];
      if (beat % 3 === 0 || (score > 5 && beat % 5 === 0)) {
        const freq = scale[(beat + Math.floor(score/2)) % scale.length] * 2;
        playOsc(freq, 'triangle', time, 0.2, 0.05);
      }

      nextNoteTimeRef.current += 0.125; // 120 BPM roughly
      beatRef.current++;
    }
    timerIdRef.current = requestAnimationFrame(scheduler);
  };

  useEffect(() => {
    if (isActive) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      nextNoteTimeRef.current = audioCtxRef.current.currentTime;
      beatRef.current = 0;
      scheduler();
    } else {
      if (timerIdRef.current) cancelAnimationFrame(timerIdRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().then(() => {
          audioCtxRef.current = null;
        });
      }
    }

    return () => {
      if (timerIdRef.current) cancelAnimationFrame(timerIdRef.current);
    };
  }, [isActive]);

  return null;
}
