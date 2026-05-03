import { useEffect, useRef } from 'react';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, GRAVITY, JUMP_FORCE, PLAYER_SIZE, SCROLL_SPEED } from '../constants';
import { Level, Obstacle, PlayerMode } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  isActive: boolean;
  playerColor?: string;
  level: Level;
}

export default function GameCanvas({ onGameOver, onScoreUpdate, isActive, playerColor = COLORS.player, level }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPressingRef = useRef(false);
  const gameStateRef = useRef({
    playerY: GAME_HEIGHT / 2,
    playerVelocity: 0,
    obstacles: [] as Obstacle[],
    score: 0,
    distance: 0,
    lastObstacleTime: 0,
    rotation: 0,
    isJumping: false,
    groundY: GAME_HEIGHT - 60,
    mode: 'CUBE' as PlayerMode,
  });

  const handlePressStart = () => {
    isPressingRef.current = true;
    if (!isActive) return;
    const state = gameStateRef.current;
    
    if (state.mode === 'CUBE' && state.playerY >= state.groundY - PLAYER_SIZE) {
      state.playerVelocity = JUMP_FORCE;
      state.isJumping = true;
    }
  };

  const handlePressEnd = () => {
    isPressingRef.current = false;
  };

  useEffect(() => {
    if (!isActive) return;

    // Reset game state for fresh start
    gameStateRef.current = {
      playerY: GAME_HEIGHT - 60 - PLAYER_SIZE,
      playerVelocity: 0,
      obstacles: [],
      score: 0,
      distance: 0,
      lastObstacleTime: 100,
      rotation: 0,
      isJumping: false,
      groundY: GAME_HEIGHT - 60,
      mode: 'CUBE',
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime: number | null = null;

    const gameLoop = (time: number) => {
      if (!startTime) startTime = time;
      const state = gameStateRef.current;

      // Ensure lastObstacleTime is correctly initialized relative to first frame
      if (state.lastObstacleTime === 100) {
        state.lastObstacleTime = time;
      }

      // 0. Mode Transition Check
      if (state.score >= 5 && state.mode === 'CUBE') {
        state.mode = 'SHIP';
        state.isJumping = true; // Use this to differentiate first jump
      }

      // 1. Update State
      if (state.mode === 'CUBE') {
        state.playerVelocity += GRAVITY;
      } else {
        // Ship Mode Physics: Hold to fly UP (negative velocity)
        const thrust = isPressingRef.current ? -0.8 : 0.6;
        state.playerVelocity += thrust;
        // Limit velocity
        state.playerVelocity = Math.max(Math.min(state.playerVelocity, 6), -6);
      }
      
      state.playerY += state.playerVelocity;

      // Ground collision
      if (state.playerY > state.groundY - PLAYER_SIZE) {
        state.playerY = state.groundY - PLAYER_SIZE;
        state.playerVelocity = 0;
        state.isJumping = false;
        // Snap rotation when hitting ground (Cube only)
        if (state.mode === 'CUBE') {
          state.rotation = Math.round(state.rotation / 90) * 90;
        }
      }

      // Ceiling collision (Ship only)
      if (state.mode === 'SHIP' && state.playerY < 0) {
        state.playerY = 0;
        state.playerVelocity = 0;
      }

      // Rotate player
      if (state.mode === 'CUBE') {
        if (state.isJumping) {
          state.rotation += 5;
        }
      } else {
        // Ship tilts based on velocity
        state.rotation = state.playerVelocity * 5;
      }

      // Scroll obstacles
      state.obstacles.forEach(obs => {
        obs.x -= level.speed;
      });

      // Spawn obstacles with pattern variety
      const spawnRate = state.mode === 'SHIP' ? level.spawnRate * 0.7 : level.spawnRate;
      if (time - state.lastObstacleTime > spawnRate) {
        const difficultyRoll = Math.random();
        
        if (state.mode === 'CUBE') {
          // Patterns: Single, Double, Triple Spikes or Blocks
          if (difficultyRoll > 0.8 && level.id >= 3) {
            // Triple Spike (Harder)
            for (let i = 0; i < 3; i++) {
              state.obstacles.push({
                x: GAME_WIDTH + (i * 38),
                y: state.groundY - 40,
                width: 40,
                height: 40,
                type: 'spike'
              });
            }
          } else if (difficultyRoll > 0.6 && level.id >= 2) {
            // Double block or Stack
            const isStack = Math.random() > 0.5;
            if (isStack) {
              state.obstacles.push({ x: GAME_WIDTH, y: state.groundY - 40, width: 40, height: 40, type: 'block' });
              state.obstacles.push({ x: GAME_WIDTH, y: state.groundY - 80, width: 40, height: 40, type: 'block' });
            } else {
              state.obstacles.push({ x: GAME_WIDTH, y: state.groundY - 40, width: 40, height: 40, type: 'block' });
              state.obstacles.push({ x: GAME_WIDTH + 45, y: state.groundY - 40, width: 40, height: 40, type: 'block' });
            }
          } else {
            // Standard Single Spike or Block
            state.obstacles.push({
              x: GAME_WIDTH,
              y: state.groundY - 40,
              width: 40,
              height: 40,
              type: Math.random() > 0.3 ? 'spike' : 'block'
            });
          }
        } else {
          // SHIP MODE: Pillars and Ceiling obstacles
          if (difficultyRoll > 0.7) {
            // High/Low Pillars
            const isTop = Math.random() > 0.5;
            const h = 120 + Math.random() * 80;
            state.obstacles.push({
              x: GAME_WIDTH,
              y: isTop ? 0 : state.groundY - h,
              width: 50,
              height: h,
              type: 'block'
            });
          } else {
            // Floating blocks chain
            const midY = 100 + Math.random() * (state.groundY - 200);
            state.obstacles.push({
              x: GAME_WIDTH,
              y: midY,
              width: 40,
              height: 120,
              type: 'block'
            });
          }
        }
        state.lastObstacleTime = time;
      }

      // Remove off-screen obstacles
      if (state.obstacles.length > 0 && state.obstacles[0].x < -100) {
        state.obstacles.shift();
        state.score += 1;
        onScoreUpdate(state.score);
      }

      // Collision detection
      const playerBox = {
        x: 100,
        y: state.playerY,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE
      };

      for (const obs of state.obstacles) {
        const padding = obs.type === 'spike' ? 12 : 4;
        if (
          playerBox.x < obs.x + obs.width - padding &&
          playerBox.x + playerBox.width > obs.x + padding &&
          playerBox.y < obs.y + obs.height - padding &&
          playerBox.y + playerBox.height > obs.y + padding
        ) {
          onGameOver(state.score);
          return;
        }
      }

      // 2. Render
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Background pulse
      const pulseColor = state.mode === 'SHIP' ? '255, 0, 85' : '112, 0, 255';
      const pulse = Math.sin(time / 1000) * 0.05 + 0.05;
      ctx.fillStyle = `rgba(${pulseColor}, ${pulse})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Background lines for speed feel
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const x = ((time / 5) + (i * 100)) % GAME_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
      }

      // Draw Ground
      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(0, state.groundY, GAME_WIDTH, GAME_HEIGHT - state.groundY);
      ctx.strokeStyle = level.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, state.groundY);
      ctx.lineTo(GAME_WIDTH, state.groundY);
      ctx.stroke();

      // Draw Obstacles
      state.obstacles.forEach(obs => {
        ctx.fillStyle = level.color;
        if (obs.type === 'spike') {
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 15;
          ctx.shadowColor = level.color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
          // Glow for blocks too
          ctx.shadowBlur = 10;
          ctx.shadowColor = level.color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Player
      ctx.save();
      ctx.translate(100 + PLAYER_SIZE / 2, state.playerY + PLAYER_SIZE / 2);
      ctx.rotate((state.rotation * Math.PI) / 180);
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = playerColor;
      ctx.fillStyle = playerColor;

      if (state.mode === 'CUBE') {
        // Outer square
        ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
        // Inner detail
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(-PLAYER_SIZE / 3, -PLAYER_SIZE / 3, (PLAYER_SIZE * 2) / 3, (PLAYER_SIZE * 2) / 3);
      } else {
        // Ship/Rocket Shape
        ctx.beginPath();
        ctx.moveTo(-PLAYER_SIZE/2, 0);
        ctx.lineTo(PLAYER_SIZE/2, -PLAYER_SIZE/4);
        ctx.lineTo(PLAYER_SIZE/2, PLAYER_SIZE/4);
        ctx.closePath();
        ctx.fill();

        // Rocket detail
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, -PLAYER_SIZE/8, PLAYER_SIZE/4, PLAYER_SIZE/4);

        // Thruster flame if pressing
        if (isPressingRef.current) {
          ctx.fillStyle = '#ffa500';
          ctx.beginPath();
          ctx.moveTo(-PLAYER_SIZE/2, 0);
          ctx.lineTo(-PLAYER_SIZE * 0.8, Math.random() * 10 - 5);
          ctx.fill();
        }
      }
      
      ctx.restore();

      // Portal Transition Effect
      if (state.score === 5 && (Math.floor(time / 200) % 2 === 0)) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, onGameOver, onScoreUpdate]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden"
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
    >
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
