import type { Board, CellValue, Position, Tetromino, TetrominoType } from '@/app/types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINO_SHAPES } from '@/app/constants/tetris';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

export function getRandomTetromino(): TetrominoType {
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  return types[Math.floor(Math.random() * types.length)];
}

export function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    shape: TETROMINO_SHAPES[type],
    position: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINO_SHAPES[type][0].length / 2),
      y: 0,
    },
  };
}

export function rotateTetromino(tetromino: Tetromino): Tetromino {
  const rotated = tetromino.shape[0].map((_, index) =>
    tetromino.shape.map(row => row[index]).reverse()
  );

  return {
    ...tetromino,
    shape: rotated,
  };
}

export function isValidMove(
  board: Board,
  tetromino: Tetromino,
  newPosition: Position
): boolean {
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const newX = newPosition.x + x;
        const newY = newPosition.y + y;

        // Check boundaries
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }

        // Check collision with existing pieces (but allow negative Y for spawn)
        if (newY >= 0 && board[newY][newX] !== null) {
          return false;
        }
      }
    }
  }
  return true;
}

export function mergePieceToBoard(board: Board, tetromino: Tetromino): Board {
  const newBoard = board.map(row => [...row]);

  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const boardY = tetromino.position.y + y;
        const boardX = tetromino.position.x + x;

        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = tetromino.type;
        }
      }
    }
  }

  return newBoard;
}

export function clearLines(board: Board): { newBoard: Board; linesCleared: number } {
  let linesCleared = 0;
  const newBoard: Board = [];

  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    const isLineFull = board[y].every(cell => cell !== null);

    if (isLineFull) {
      linesCleared++;
    } else {
      newBoard.unshift(board[y]);
    }
  }

  // Add empty lines at the top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return { newBoard, linesCleared };
}

export function checkGameOver(board: Board): boolean {
  // Check if any cell in the top row is filled
  return board[0].some(cell => cell !== null);
}

export function getGhostPosition(board: Board, tetromino: Tetromino): Position {
  let ghostY = tetromino.position.y;

  while (isValidMove(board, tetromino, { x: tetromino.position.x, y: ghostY + 1 })) {
    ghostY++;
  }

  return { x: tetromino.position.x, y: ghostY };
}
