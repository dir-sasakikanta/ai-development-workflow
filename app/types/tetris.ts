export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type CellValue = TetrominoType | null;

export type Board = CellValue[][];

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
}

export interface GameState {
  board: Board;
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
}
