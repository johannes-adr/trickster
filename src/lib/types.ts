export type GameState =
  | 'HOME'
  | 'SELECT_PLAYER_COUNT'
  | 'ENTER_PLAYER_NAMES'
  | 'SET_OPTIONS'
  | 'PASS_AROUND'
  | 'DISCUSSION'
  | 'VOTING'
  | 'RESULTS';

export type PlayerRole = 'civilian' | 'imposter';

export interface Player {
  id: number;
  name: string;
  role: PlayerRole;
}

export interface Settings {
  playerCount: number;
  hintsEnabled: boolean;
  imposterCount: number;
  votingEnabled: boolean;
}

export interface WordEntry {
  category: string;
  word: string;
  hint: string;
}

export interface Round {
  secretWord: string;
  hint: string;
  category: string;
}
