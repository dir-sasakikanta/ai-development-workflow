import { useState, useCallback, useEffect, useRef } from 'react';

import type { GameState, Tetromino } from '@/app/types/tetris';
import {
  createEmptyBoard,
  getRandomTetromino,
  createTetromino,
  rotateTetromino,
  isValidMove,
  mergePieceToBoard,
  clearLines,
  checkGameOver,
} from '@/app/utils/tetris';
import { INITIAL_DROP_SPEED, FAST_DROP_SPEED, POINTS_PER_LINE } from '@/app/constants/tetris';

export function useTetris() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: createTetromino(getRandomTetromino()),
    nextPiece: createTetromino(getRandomTetromino()),
    score: 0,
    isGameOver: false,
    isPaused: false,
  }));

  const [isFastDrop, setIsFastDrop] = useState(false);
  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;

      const newPosition = {
        x: prev.currentPiece.position.x + deltaX,
        y: prev.currentPiece.position.y + deltaY,
      };

      if (isValidMove(prev.board, prev.currentPiece, newPosition)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPosition,
          },
        };
      }

      // If moving down is not valid, lock the piece
      if (deltaY > 0) {
        const mergedBoard = mergePieceToBoard(prev.board, prev.currentPiece);
        const { newBoard, linesCleared } = clearLines(mergedBoard);

        // Check game over before spawning new piece
        if (checkGameOver(newBoard)) {
          return {
            ...prev,
            board: newBoard,
            currentPiece: null,
            isGameOver: true,
            score: prev.score + linesCleared * POINTS_PER_LINE,
          };
        }

        return {
          ...prev,
          board: newBoard,
          currentPiece: prev.nextPiece,
          nextPiece: createTetromino(getRandomTetromino()),
          score: prev.score + linesCleared * POINTS_PER_LINE,
        };
      }

      return prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;

      const rotated = rotateTetromino(prev.currentPiece);

      if (isValidMove(prev.board, rotated, rotated.position)) {
        return {
          ...prev,
          currentPiece: rotated,
        };
      }

      // Try wall kicks
      const wallKicks = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 2, y: 0 },
        { x: -2, y: 0 },
      ];

      for (const kick of wallKicks) {
        const kickedPosition = {
          x: rotated.position.x + kick.x,
          y: rotated.position.y + kick.y,
        };

        if (isValidMove(prev.board, rotated, kickedPosition)) {
          return {
            ...prev,
            currentPiece: {
              ...rotated,
              position: kickedPosition,
            },
          };
        }
      }

      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;

      let newY = prev.currentPiece.position.y;
      while (
        isValidMove(prev.board, prev.currentPiece, {
          x: prev.currentPiece.position.x,
          y: newY + 1,
        })
      ) {
        newY++;
      }

      const droppedPiece: Tetromino = {
        ...prev.currentPiece,
        position: { x: prev.currentPiece.position.x, y: newY },
      };

      const mergedBoard = mergePieceToBoard(prev.board, droppedPiece);
      const { newBoard, linesCleared } = clearLines(mergedBoard);

      // Check game over before spawning new piece
      if (checkGameOver(newBoard)) {
        return {
          ...prev,
          board: newBoard,
          currentPiece: null,
          isGameOver: true,
          score: prev.score + linesCleared * POINTS_PER_LINE,
        };
      }

      return {
        ...prev,
        board: newBoard,
        currentPiece: prev.nextPiece,
        nextPiece: createTetromino(getRandomTetromino()),
        score: prev.score + linesCleared * POINTS_PER_LINE,
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: createTetromino(getRandomTetromino()),
      nextPiece: createTetromino(getRandomTetromino()),
      score: 0,
      isGameOver: false,
      isPaused: false,
    });
  }, []);

  // Game loop for automatic piece dropping
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
      return;
    }

    const speed = isFastDrop ? FAST_DROP_SPEED : INITIAL_DROP_SPEED;

    dropIntervalRef.current = setInterval(() => {
      movePiece(0, 1);
    }, speed);

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
    };
  }, [gameState.isGameOver, gameState.isPaused, isFastDrop, movePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setIsFastDrop(true);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFastDrop(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isGameOver, movePiece, rotate, hardDrop, togglePause]);

  return {
    gameState,
    movePiece,
    rotate,
    hardDrop,
    togglePause,
    resetGame,
  };
}
