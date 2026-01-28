'use client';

import { useTetris } from '@/app/hooks/useTetris';
import { TETROMINO_COLORS, BOARD_WIDTH, BOARD_HEIGHT } from '@/app/constants/tetris';
import { getGhostPosition } from '@/app/utils/tetris';

import type { DisplayBoard, Tetromino } from '@/app/types/tetris';

export default function TetrisPage() {
  const { gameState, resetGame, togglePause } = useTetris();

  const renderBoard = () => {
    // Create a copy of the board to render
    const displayBoard: DisplayBoard = gameState.board.map(row => [...row]);

    // Add ghost piece
    if (gameState.currentPiece && !gameState.isGameOver) {
      const ghostPos = getGhostPosition(gameState.board, gameState.currentPiece);

      for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
        for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
          if (gameState.currentPiece.shape[y][x]) {
            const boardY = ghostPos.y + y;
            const boardX = ghostPos.x + x;

            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH &&
              displayBoard[boardY][boardX] === null
            ) {
              // Mark as ghost piece (we'll render it differently)
              displayBoard[boardY][boardX] = 'ghost';
            }
          }
        }
      }

      // Add current piece
      for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
        for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
          if (gameState.currentPiece.shape[y][x]) {
            const boardY = gameState.currentPiece.position.y + y;
            const boardX = gameState.currentPiece.position.x + x;

            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = gameState.currentPiece.type;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  const renderNextPiece = (piece: Tetromino | null) => {
    if (!piece) return null;

    return (
      <div className="flex flex-col gap-1">
        {piece.shape.map((row, y) => (
          <div key={y} className="flex gap-1">
            {row.map((cell, x) => (
              <div
                key={x}
                className="w-6 h-6 border border-slate-700"
                style={{
                  backgroundColor: cell ? TETROMINO_COLORS[piece.type] : 'transparent',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const displayBoard = renderBoard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎮 Tetris
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Main Game Board */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6">
            <div
              className="grid gap-0 bg-slate-900 border-4 border-slate-700 rounded-lg overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 30px)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, 30px)`,
              }}
            >
              {displayBoard.map((row, y) =>
                row.map((cell, x) => {
                  const isGhost = cell === 'ghost';
                  const cellColor = cell && !isGhost ? TETROMINO_COLORS[cell] : 'transparent';

                  return (
                    <div
                      key={`${y}-${x}`}
                      className="border border-slate-700/30"
                      style={{
                        backgroundColor: cellColor,
                        opacity: isGhost ? 0.3 : 1,
                      }}
                    />
                  );
                })
              )}
            </div>

            {gameState.isGameOver && (
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-red-400 mb-2">Game Over!</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  New Game
                </button>
              </div>
            )}

            {gameState.isPaused && !gameState.isGameOver && (
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">Paused</p>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 min-w-[200px]">
            {/* Next Piece */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Next</h2>
              <div className="bg-slate-900 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                {renderNextPiece(gameState.nextPiece)}
              </div>
            </div>

            {/* Score */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Score</h2>
              <div className="bg-slate-900 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{gameState.score}</p>
              </div>
            </div>

            {/* Controls */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Controls</h2>
              <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span>Move:</span>
                  <span className="text-white font-mono">← →</span>
                </div>
                <div className="flex justify-between">
                  <span>Rotate:</span>
                  <span className="text-white font-mono">↑</span>
                </div>
                <div className="flex justify-between">
                  <span>Soft Drop:</span>
                  <span className="text-white font-mono">↓</span>
                </div>
                <div className="flex justify-between">
                  <span>Hard Drop:</span>
                  <span className="text-white font-mono">Space</span>
                </div>
                <div className="flex justify-between">
                  <span>Pause:</span>
                  <span className="text-white font-mono">P</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={togglePause}
                disabled={gameState.isGameOver}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {gameState.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={resetGame}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                New Game
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
          <div className="text-slate-300 space-y-2">
            <p>
              • Use <span className="text-white font-mono">arrow keys</span> to move and rotate
              the falling pieces
            </p>
            <p>
              • Press <span className="text-white font-mono">Space</span> to instantly drop the
              piece to the bottom
            </p>
            <p>• Complete horizontal lines to clear them and earn points</p>
            <p>• The game ends when pieces stack up to the top</p>
            <p>
              • Press <span className="text-white font-mono">P</span> to pause/resume the game
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
