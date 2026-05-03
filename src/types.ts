export type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SHOP';
export type PlayerMode = 'CUBE' | 'SHIP';

export interface PlayerCustomization {
  color: string;
  name: string;
  cost: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Obstacle extends Entity {
  type: 'spike' | 'block';
}

export interface GameData {
  score: number;
  highScore: number;
  distance: number;
}
