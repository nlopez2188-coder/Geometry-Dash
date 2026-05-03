import { useEffect, useRef, useState } from 'react';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, GRAVITY, JUMP_FORCE, PLAYER_SIZE, SCROLL_SPEED } from '../constants';
import { Obstacle } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  isActive: boolean;
}

export default function GameCanvas({ onGameOver, onScoreUpdate, isActive }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  });

  const jump = () => {
    if (!isActive) return;
    const state = gameStateRef.current;
    // Only jump if on ground (typical Geometry Dash mechanic)
    if (state.playerY >= state.groundY - PLAYER_SIZE) {
      state.playerVelocity = JUMP_FORCE;
      state.isJumping = true;
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (time: number) => {
      const state = gameStateRef.current;

      // 1. Update State
      state.playerVelocity += GRAVITY;
      state.playerY += state.playerVelocity;

      // Ground collision
      if (state.playerY > state.groundY - PLAYER_SIZE) {
        state.playerY = state.groundY - PLAYER_SIZE;
        state.playerVelocity = 0;
        state.isJumping = false;
        // Snap rotation when hitting ground
        state.rotation = Math.round(state.rotation / 90) * 90;
      }

      // Rotate while jumping
      if (state.isJumping) {
        state.rotation += 5;
      }

      // Scroll obstacles
      state.obstacles.forEach(obs => {
        obs.x -= SCROLL_SPEED;
      });

      // Spawn obstacles
      if (time - state.lastObstacleTime > 1500) {
        state.obstacles.push({
          x: GAME_WIDTH,
          y: state.groundY - 40,
          width: 40,
          height: 40,
          type: Math.random() > 0.5 ? 'spike' : 'block'
        });
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
        // Simple AABB collision with a bit of padding for spike
        const padding = obs.type === 'spike' ? 10 : 2;
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

      // Draw Progress/HUD Info (optional secondary display)
      
      // 2. Render
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Background pulse
      const pulse = Math.sin(time / 1000) * 0.05 + 0.05;
      ctx.fillStyle = `rgba(112, 0, 255, ${pulse})`;
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
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, state.groundY);
      ctx.lineTo(GAME_WIDTH, state.groundY);
      ctx.stroke();

      // Draw Obstacles
      state.obstacles.forEach(obs => {
        ctx.fillStyle = COLORS.obstacle;
        if (obs.type === 'spike') {
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          // Glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = COLORS.obstacle;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
      });

      // Draw Player
      ctx.save();
      ctx.translate(100 + PLAYER_SIZE / 2, state.playerY + PLAYER_SIZE / 2);
      ctx.rotate((state.rotation * Math.PI) / 180);
      
      // Outer square
      ctx.fillStyle = COLORS.player;
      ctx.shadowBlur = 20;
      ctx.shadowColor = COLORS.player;
      ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
      
      // Inner detail
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeRect(-PLAYER_SIZE / 3, -PLAYER_SIZE / 3, (PLAYER_SIZE * 2) / 3, (PLAYER_SIZE * 2) / 3);
      
      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, onGameOver, onScoreUpdate]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden"
      onTouchStart={jump}
      onMouseDown={jump}
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
