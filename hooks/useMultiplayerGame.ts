import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, onValue, off, get } from 'firebase/database';
import { db } from '../utils/firebase';
import {
  GameState,
  GamePhase,
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

  // Refs updated SYNCHRONOUSLY — never stale, no useEffect needed
  const gameStateRef = useRef<GameState | null>(null);
  const myRoleRef = useRef<PlayerRole>(null);
  const roomCodeRef = useRef('');

  const getRoomRef = (code: string) => ref(db, `rooms/${code}`);

  const createRoom = useCallback(async () => {
    try {
      setError(null);
      const code = generateRoomCode();
      // Update refs synchronously before async Firebase call
      roomCodeRef.current = code;
      myRoleRef.current = 'player1';

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
      const upperCode = code.toUpperCase();
      const roomRef = getRoomRef(upperCode);
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
        players: { ...state.players, player2: upperCode + '_p2' },
      };
      await set(roomRef, updated);

      // Update refs synchronously after confirming join
      roomCodeRef.current = upperCode;
      myRoleRef.current = 'player2';
      setRoomCode(upperCode);
      setMyRole('player2');
      subscribeToRoom(upperCode);
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
        // CRITICAL: update ref synchronously BEFORE setState
        // This ensures makeMove always reads the latest state,
        // even if the user clicks before React re-renders.
        gameStateRef.current = state;
        setGameState(state);
        setIsConnected(true);
        const { combo } = checkWinner(state.board);
        setWinningCombo(combo);
      }
    });

    unsubRef.current = () => off(roomRef, 'value', listener);
  }, []);

  const makeMove = useCallback(async (index: number) => {
    const gs = gameStateRef.current;
    const role = myRoleRef.current;
    const code = roomCodeRef.current;

    if (!gs || !code || !role) return;
    if (gs.phase !== 'playing') return;
    if (gs.currentTurn !== role) return;
    if (gs.board[index] !== null) return;

    const symbol: CellValue = role === 'player1' ? 'O' : 'X';
    const newBoard: Board = [...gs.board];
    newBoard[index] = symbol;

    const { winner } = checkWinner(newBoard);
    const full = isBoardFull(newBoard);

    let roundWinner: 'player1' | 'player2' | 'draw' | null = null;
    let newPhase: GamePhase = gs.phase;
    let newScores = { ...gs.scores };
    let gameWinner: 'player1' | 'player2' | null = gs.gameWinner ?? null;

    if (winner) {
      roundWinner = role;
      if (role === 'player1') newScores.player1++;
      else newScores.player2++;

      if (newScores.player1 >= 3 || newScores.player2 >= 3) {
        gameWinner = newScores.player1 >= 3 ? 'player1' : 'player2';
        newPhase = 'game_over';
      } else if (gs.round >= 5) {
        gameWinner = calculateGameWinner(newScores, gs.round, roundWinner);
        newPhase = 'game_over';
      } else {
        newPhase = 'round_over';
      }
    } else if (full) {
      roundWinner = 'draw';
      if (gs.round >= 5) {
        gameWinner = calculateGameWinner(newScores, gs.round, 'draw');
        newPhase = 'game_over';
      } else {
        newPhase = 'round_over';
      }
    }

    const updatedState: GameState = {
      ...gs,
      board: newBoard,
      currentTurn: role === 'player1' ? 'player2' : 'player1',
      scores: newScores,
      phase: newPhase,
      roundWinner,
      gameWinner,
    };

    // Optimistically update the ref so rapid clicks are blocked immediately
    gameStateRef.current = updatedState;
    await set(getRoomRef(code), updatedState);
  }, []);

  const nextRound = useCallback(async () => {
    const gs = gameStateRef.current;
    const code = roomCodeRef.current;
    if (!gs || !code) return;

    const updatedState: GameState = {
      ...gs,
      board: [...INITIAL_BOARD],
      currentTurn: 'player1',
      round: gs.round + 1,
      phase: 'playing',
      roundWinner: null,
      gameWinner: null,
    };
    gameStateRef.current = updatedState;
    setWinningCombo(null);
    await set(getRoomRef(code), updatedState);
  }, []);

  const resetGame = useCallback(async () => {
    const gs = gameStateRef.current;
    const code = roomCodeRef.current;
    if (!code) return;

    const fresh: GameState = {
      ...getInitialGameState(),
      phase: 'playing',
      players: gs?.players || { player1: null, player2: null },
    };
    gameStateRef.current = fresh;
    setWinningCombo(null);
    await set(getRoomRef(code), fresh);
  }, []);

  const leaveRoom = useCallback(() => {
    if (unsubRef.current) unsubRef.current();
    gameStateRef.current = null;
    setGameState(null);
    setMyRole(null);
    setRoomCode('');
    setIsConnected(false);
    setWinningCombo(null);
  }, []);

  useEffect(() => {
    return () => { if (unsubRef.current) unsubRef.current(); };
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
