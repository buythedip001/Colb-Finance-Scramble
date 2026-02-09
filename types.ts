export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface WordData {
  word: string;
  hint: string;
}

export interface GameStats {
  score: number;
  streak: number;
  bestStreak: number;
}