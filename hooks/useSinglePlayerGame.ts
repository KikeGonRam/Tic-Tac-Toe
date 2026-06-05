import { useState, useCallback, useEffect } from 'react';
import {
  GameState, GamePhase, Board, checkWinner, isBoardFull,
  calculateGameWinner, getInitialGameState, INITIAL_BOARD, getAIMove,
} from '../utils/gameLogic';

export type Difficulty = 'easy' | 'hard';

const INITIAL_STATE = (diff: Difficulty): GameState => ({
  ...getInitialGameState(),
  phase: 'playing',
  players: { player1: 'human', player2: 'ai' },
});

export function useSinglePlayerGame(difficulty: Difficulty) {
  const [gameState, setGameState] = useState<GameState>(() => INITIAL_STATE(difficulty));
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // AI move when it's player2's turn
  useEffect(() => {
    if (gameState.phase !== 'playing' || gameState.currentTurn !== 'player2') return;

    setIsAIThinking(true);
    const timeout = setTimeout(() => {
      setGameState(prev => {
        if (prev.phase !== 'playing' || prev.currentTurn !== 'player2') return prev;

        const aiIndex = getAIMove(prev.board, difficulty);
        if (aiIndex === -1) return prev;

        const newBoard = [...prev.board] as Board;
        newBoard[aiIndex] = 'X';

        const { winner, combo } = checkWinner(newBoard);
        const full = isBoardFull(newBoard);
        let roundWinner: 'player1' | 'player2' | 'draw' | null = null;
        let newPhase: GamePhase = prev.phase;
        let newScores = { ...prev.scores };
        let gameWinner: 'player1' | 'player2' | null = null;

        if (winner) {
          roundWinner = 'player2';
          newScores.player2++;
          if (newScores.player2 >= 3) {
            gameWinner = 'player2'; newPhase = 'game_over';
          } else if (prev.round >= 5) {
            gameWinner = calculateGameWinner(prev.scores, prev.round, roundWinner);
            newPhase = 'game_over';
          } else {
            newPhase = 'round_over';
          }
        } else if (full) {
          roundWinner = 'draw';
          if (prev.round >= 5) {
            gameWinner = calculateGameWinner(prev.scores, prev.round, 'draw');
            newPhase = 'game_over';
          } else {
            newPhase = 'round_over';
          }
        }

        if (combo) setWinningCombo(combo);

        return {
          ...prev,
          board: newBoard,
          currentTurn: 'player1',
          scores: newScores,
          phase: newPhase,
          roundWinner,
          gameWinner,
        };
      });
      setIsAIThinking(false);
    }, 750);

    return () => clearTimeout(timeout);
  }, [gameState.currentTurn, gameState.phase, difficulty]);

  const makeMove = useCallback((index: number) => {
    setGameState(prev => {
      if (prev.phase !== 'playing' || prev.currentTurn !== 'player1') return prev;
      if (prev.board[index] !== null) return prev;

      const newBoard = [...prev.board] as Board;
      newBoard[index] = 'O';

      const { winner, combo } = checkWinner(newBoard);
      const full = isBoardFull(newBoard);
      let roundWinner: 'player1' | 'player2' | 'draw' | null = null;
      let newPhase: GamePhase = prev.phase;
      let newScores = { ...prev.scores };
      let gameWinner: 'player1' | 'player2' | null = null;

      if (winner) {
        roundWinner = 'player1';
        newScores.player1++;
        if (newScores.player1 >= 3) {
          gameWinner = 'player1'; newPhase = 'game_over';
        } else if (prev.round >= 5) {
          gameWinner = calculateGameWinner(prev.scores, prev.round, roundWinner);
          newPhase = 'game_over';
        } else {
          newPhase = 'round_over';
        }
      } else if (full) {
        roundWinner = 'draw';
        if (prev.round >= 5) {
          gameWinner = calculateGameWinner(prev.scores, prev.round, 'draw');
          newPhase = 'game_over';
        } else {
          newPhase = 'round_over';
        }
      }

      if (combo) setWinningCombo(combo);

      return {
        ...prev,
        board: newBoard,
        currentTurn: 'player2',
        scores: newScores,
        phase: newPhase,
        roundWinner,
        gameWinner,
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setWinningCombo(null);
    setGameState(prev => ({
      ...prev,
      board: [...INITIAL_BOARD],
      currentTurn: 'player1',
      round: prev.round + 1,
      phase: 'playing',
      roundWinner: null,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setWinningCombo(null);
    setGameState(INITIAL_STATE(difficulty));
  }, [difficulty]);

  const isMyTurn = gameState.currentTurn === 'player1' && gameState.phase === 'playing';

  return {
    gameState,
    winningCombo,
    isAIThinking,
    isMyTurn,
    makeMove,
    nextRound,
    resetGame,
  };
}
