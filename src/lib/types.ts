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

export type StartingPlayerMode =
  | 'uniform'
  | 'trickster-disadvantaged'
  | 'trickster-hint';

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
  /** 0–100: chance (%) that the trickster count is re-rolled randomly */
  tricksterVarianceProbability: number;
  startingPlayerMode: StartingPlayerMode;
  /** 0–100: relative weight of a trickster being picked as starting player (trickster-disadvantaged mode) */
  tricksterStartWeight: number;
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
