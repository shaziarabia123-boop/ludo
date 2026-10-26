export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'computer';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export type GameMode = 'local' | 'computer' | 'online';

export type TokenStatus = 'yard' | 'track' | 'home_column' | 'home';

export interface Token {
  id: string; // e.g., 'red-0'
  color: PlayerColor;
  index: number; // 0, 1, 2, 3
  status: TokenStatus;
  // position on the 52-tile circuit (0..51) when on track
  trackIndex: number | null;
  // step in home column (0..4) when in home_column, or 5 when in home
  homeIndex: number | null;
  // steps traveled from start square (0 to 56)
  stepsTraveled: number;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  difficulty?: AIDifficulty;
  tokens: Token[];
  hasWon: boolean;
  rank?: number; // 1st, 2nd, 3rd, 4th
}

export interface MoveOption {
  tokenId: string;
  tokenIndex: number;
  fromStatus: TokenStatus;
  toStatus: TokenStatus;
  fromTrackIndex: number | null;
  toTrackIndex: number | null;
  fromHomeIndex: number | null;
  toHomeIndex: number | null;
  willCaptureTokenIds: string[];
  isDeployment: boolean;
  isHomeEntry: boolean;
  isFinishing: boolean;
  landingOnSafeSquare: boolean;
}

export interface RulesConfig {
  sixAllowsDeployment: boolean;
  rollSixExtraTurn: boolean;
  captureExtraTurn: boolean;
  homeExtraTurn: boolean;
  threeConsecutiveSixesForfeit: boolean;
  exactRollForHome: boolean;
}

export type GamePhase =
  | 'menu'
  | 'setup'
  | 'waiting_for_roll'
  | 'selecting_token'
  | 'moving_token'
  | 'resolving_turn'
  | 'game_over';

export interface GameState {
  mode: GameMode;
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  diceValue: number | null;
  isRolling: boolean;
  consecutiveSixes: number;
  legalMoves: MoveOption[];
  selectedTokenId: string | null;
  moveHistory: string[];
  winner: Player | null;
  rankings: Player[];
  rules: RulesConfig;
  turnMessage: string;
}

export interface Coordinates {
  x: number;
  y: number;
}
