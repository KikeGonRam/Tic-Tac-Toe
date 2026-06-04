// hooks/useMultiplayerGame.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, onValue, off, get } from 'firebase/database';
import { db } from '../utils/firebase';
import {
  GameState,
  Board,
  CellValue,
  checkWinner,
  isBoardFull,
  calculateGameWinner,
  getInitialGameState,
  generateRoomCode,
  INITIAL_BOARD,
} from '../utils/gameLogic';

export type PlayerRole = 'player1' | 'player2' | null;

function normalizeBoard(raw: any): Board {
  const board: Board = Array(9).fill(null);
  if (!raw) return board;
  if (Array.isArray(raw)) return raw.length === 9 ? raw : board;
  // Firebase stores sparse arrays as objects with integer keys e.g. {"4": "O"}
  Object.entries(raw).forEach(([key, value]) => {
    const idx = parseInt(key);
    if (idx >= 0 && idx < 9) board[idx] = value as CellValue;
  });
  return board;
}

interface UseMultiplayerGameReturn {
  gameState: GameState | null;
  myRole: PlayerRole;
  roomCode: string;
  isConnected: boolean;
  error: string | null;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  makeMove: (index: number) => Promise<void>;
  nextRound: () => Promise<void>;
  resetGame: () => Promise<void>;
  leaveRoom: () => void;
  isMyTurn: boolean;
  winningCombo: number[] | null;
}

export function useMultiplayerGame(): UseMultiplayerGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myRole, setMyRole] = useState<PlayerRole>(null);
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const getRoomRef = (code: string) => ref(db, `rooms/${code}`);

  const createRoom = useCallback(async () => {
    try {
      setError(null);
      const code = generateRoomCode();
      const roomRef = getRoomRef(code);
      const initialState: GameState = {
        ...getInitialGameState(),
        phase: 'waiting',
        players: { player1: code + '_p1', player2: null },
      };
      await set(roomRef, initialState);
      setRoomCode(code);
      setMyRole('player1');
      subscribeToRoom(code);
    } catch (e) {
      setError('Error al crear la sala. Verifica tu conexión.');
    }
  }, []);

  const joinRoom = useCallback(async (code: string) => {
    try {
      setError(null);
      const roomRef = getRoomRef(code.toUpperCase());
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        setError('Sala no encontrada. Verifica el código.');
        return;
      }
      const state: GameState = snapshot.val();
      if (state.players?.player2) {
        setError('La sala ya está llena.');
        return;
      }
      const updated: GameState = {
        ...state,
        phase: 'playing',
        players: { ...state.players, player2: code.toUpperCase() + '_p2' },
      };
      await set(roomRef, updated);
      setRoomCode(code.toUpperCase());
      setMyRole('player2');
      subscribeToRoom(code.toUpperCase());
    } catch (e) {
      setError('Error al unirse. Verifica tu conexión y el código.');
    }
  }, []);

  const subscribeToRoom = useCallback((code: string) => {
    const roomRef = getRoomRef(code);
    if (unsubRef.current) unsubRef.current();

    const listener = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const state: GameState = {
          ...raw,
          board: normalizeBoard(raw.board),
        };
        setGameState(state);
        setIsConnected(true);
        const { combo } = checkWinner(state.board);
        setWinningCombo(combo);
      }
    });

    unsubRef.current = () => off(roomRef, 'value', listener);
  }, []);

  const makeMove = useCallback(async (index: number) => {
    if (!gameState || !roomCode || !myRole) return;
    if (gameState.phase !== 'playing') return;
    if (gameState.currentTurn !== myRole) return;
    if (gameState.board[index] !== null) return;

    const symbol: CellValue = myRole === 'player1' ? 'O' : 'X';
    const newBoard: Board = [...gameState.board];
    newBoard[index] = symbol;

    const { winner, combo } = checkWinner(newBoard);
    const full = isBoardFull(newBoard);

    let roundWinner: 'player1' | 'player2' | 'draw' | null = null;
    let newPhase = gameState.phase;
    let newScores = { ...gameState.scores };
    let gameWinner: 'player1' | 'player2' | null = null;

    if (winner) {
      roundWinner = myRole;
      if (myRole === 'player1') newScores.player1++;
      else newScores.player2++;

      // Check if 3 wins reached
      if (newScores.player1 >= 3 || newScores.player2 >= 3) {
        gameWinner = newScores.player1 >= 3 ? 'player1' : 'player2';
        newPhase = 'game_over';
      } else if (gameState.round >= 5) {
        // Last round, determine winner
        gameWinner = calculateGameWinner(gameState.scores, gameState.round, roundWinner);
        newPhase = 'game_over';
      } else {
        newPhase = 'round_over';
      }
    } else if (full) {
      roundWinner = 'draw';
      if (gameState.round >= 5) {
        gameWinner = calculateGameWinner(gameState.scores, gameState.round, 'draw');
        newPhase = 'game_over';
      } else {
        newPhase = 'round_over';
      }
    }

    const updatedState: GameState = {
      ...gameState,
      board: newBoard,
      currentTurn: myRole === 'player1' ? 'player2' : 'player1',
      scores: newScores,
      phase: newPhase,
      roundWinner,
      gameWinner,
    };

    await set(getRoomRef(roomCode), updatedState);
  }, [gameState, roomCode, myRole]);

  const nextRound = useCallback(async () => {
    if (!gameState || !roomCode) return;
    const updatedState: GameState = {
      ...gameState,
      board: [...INITIAL_BOARD],
      currentTurn: 'player1',
      round: gameState.round + 1,
      phase: 'playing',
      roundWinner: null,
    };
    await set(getRoomRef(roomCode), updatedState);
  }, [gameState, roomCode]);

  const resetGame = useCallback(async () => {
    if (!roomCode) return;
    const fresh: GameState = {
      ...getInitialGameState(),
      phase: 'playing',
      players: gameState?.players || { player1: null, player2: null },
    };
    await set(getRoomRef(roomCode), fresh);
    setWinningCombo(null);
  }, [gameState, roomCode]);

  const leaveRoom = useCallback(() => {
    if (unsubRef.current) unsubRef.current();
    setGameState(null);
    setMyRole(null);
    setRoomCode('');
    setIsConnected(false);
    setWinningCombo(null);
  }, []);

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const isMyTurn = myRole !== null && gameState?.currentTurn === myRole && gameState?.phase === 'playing';

  return {
    gameState,
    myRole,
    roomCode,
    isConnected,
    error,
    createRoom,
    joinRoom,
    makeMove,
    nextRound,
    resetGame,
    leaveRoom,
    isMyTurn,
    winningCombo,
  };
}
