import { Level } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;
export const PLAYER_SIZE = 40;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const SCROLL_SPEED = 5;
export const SPAWN_INTERVAL = 1500; // ms

export const COLORS = {
  player: '#00ffff',
  obstacle: '#ff0055',
  ground: '#222222',
  background: '#050505',
  accent: '#7000ff',
};

export const LEVELS: Level[] = [
  { id: 1, name: 'STEREO DASH', difficulty: 'Easy', speed: 5, spawnRate: 1500, color: '#00ffff' },
  { id: 2, name: 'NEON TRACK', difficulty: 'Normal', speed: 6, spawnRate: 1300, color: '#44ff44' },
  { id: 3, name: 'POLAR PULSE', difficulty: 'Hard', speed: 7, spawnRate: 1100, color: '#ffff44' },
  { id: 4, name: 'DRY RUN', difficulty: 'Harder', speed: 8, spawnRate: 950, color: '#ffa500' },
  { id: 5, name: 'BASE NOE', difficulty: 'Insane', speed: 10, spawnRate: 800, color: '#ff44ff' },
];
