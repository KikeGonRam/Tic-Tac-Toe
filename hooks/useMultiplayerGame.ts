import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, onValue, off, get, runTransaction } from 'firebase/database';
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

const getRoomRef = (code: string) => ref(db, `rooms/${code}`);

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

  // Prevents a second tap from firing while a transaction is in flight.
  const isProcessingRef = useRef(false);

  const gameStateRef = useRef<GameState | null>(null);
  const myRoleRef = useRef<PlayerRole>(null);
  const roomCodeRef = useRef('');

  const createRoom = useCallback(async () => {
    try {
      setError(null);
      const code = generateRoomCode();
      roomCodeRef.current = code;
      myRoleRef.current = 'player1';

      const initialState: GameState = {
        ...getInitialGameState(),
        phase: 'waiting',
        players: { player1: code + '_p1', player2: null },
      };
      await set(getRoomRef(code), initialState);
      setRoomCode(code);
      setMyRole('player1');
      subscribeToRoom(code);
    } catch {
      setError('Error al crear la sala. Verifica tu conexión.');
    }
  }, []);

  const joinRoom = useCallback(async (code: string) => {
    try {
      setError(null);
      const upperCode = code.toUpperCase();
      const snapshot = await get(getRoomRef(upperCode));

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
      await set(getRoomRef(upperCode), updated);

      roomCodeRef.current = upperCode;
      myRoleRef.current = 'player2';
      setRoomCode(upperCode);
      setMyRole('player2');
      subscribeToRoom(upperCode);
    } catch {
      setError('Error al unirse. Verifica tu conexión y el código.');
    }
  }, []);

  const subscribeToRoom = useCallback((code: string) => {
    if (unsubRef.current) unsubRef.current();
    const roomRef = getRoomRef(code);

    const listener = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const state: GameState = { ...raw, board: normalizeBoard(raw.board) };
        gameStateRef.current = state;
        setGameState(state);
        setIsConnected(true);
        const { combo } = checkWinner(state.board);
        setWinningCombo(combo);
      }
    });

    unsubRef.current = () => off(roomRef, 'value', listener);
  }, []);

  // Uses a Firebase transaction so the move is validated against the LIVE server
  // state, not a potentially stale local cache. This prevents the race condition
  // where both players write simultaneously and one overwrites the other.
  const makeMove = useCallback(async (index: number) => {
    if (isProcessingRef.current) return;
    const role = myRoleRef.current;
    const code = roomCodeRef.current;
    if (!code || !role) return;

    isProcessingRef.current = true;
    try {
      await runTransaction(getRoomRef(code), (current: any) => {
        if (!current) return current;
        // Abort if state changed since last render (stale local read).
        if (current.phase !== 'playing') return;
        if (current.currentTurn !== role) return;

        const board = normalizeBoard(current.board);
        if (board[index] !== null) return; // cell already taken

        const symbol: CellValue = role === 'player1' ? 'O' : 'X';
        const newBoard: Board = [...board];
        newBoard[index] = symbol;

        const { winner } = checkWinner(newBoard);
        const full = isBoardFull(newBoard);

        let roundWinner: 'player1' | 'player2' | 'draw' | null = null;
        let newPhase: GamePhase = 'playing';
        let newScores = { ...current.scores };
        let gameWinner: 'player1' | 'player2' | null = null;

        if (winner) {
          roundWinner = role;
          if (role === 'player1') newScores.player1++;
          else newScores.player2++;

          if (newScores.player1 >= 3 || newScores.player2 >= 3) {
            gameWinner = newScores.player1 >= 3 ? 'player1' : 'player2';
            newPhase = 'game_over';
          } else if (current.round >= 5) {
            gameWinner = calculateGameWinner(newScores, current.round, roundWinner);
            newPhase = 'game_over';
          } else {
            newPhase = 'round_over';
          }
        } else if (full) {
          roundWinner = 'draw';
          if (current.round >= 5) {
            gameWinner = calculateGameWinner(newScores, current.round, 'draw');
            newPhase = 'game_over';
          } else {
            newPhase = 'round_over';
          }
        }

        return {
          ...current,
          board: newBoard,
          currentTurn: (role === 'player1' ? 'player2' : 'player1') as 'player1' | 'player2',
          scores: newScores,
          phase: newPhase,
          roundWinner,
          gameWinner,
        };
      });
    } catch {
      // Network failure — transaction silently dropped.
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Both players can call nextRound. The transaction ensures only the FIRST
  // caller advances (phase check aborts any duplicate call).
  const nextRound = useCallback(async () => {
    const code = roomCodeRef.current;
    if (!code) return;
    try {
      await runTransaction(getRoomRef(code), (current: any) => {
        if (!current) return current;
        if (current.phase !== 'round_over') return; // already advanced — abort
        return {
          ...current,
          board: [...INITIAL_BOARD],
          currentTurn: 'player1',
          round: current.round + 1,
          phase: 'playing',
          roundWinner: null,
          gameWinner: null,
        };
      });
    } catch { /* ignore */ }
  }, []);

  // Same pattern as nextRound — first player to tap "Jugar de nuevo" wins the race.
  const resetGame = useCallback(async () => {
    const gs = gameStateRef.current;
    const code = roomCodeRef.current;
    if (!code) return;
    try {
      await runTransaction(getRoomRef(code), (current: any) => {
        if (!current) return current;
        if (current.phase !== 'game_over') return; // guard — abort
        return {
          ...getInitialGameState(),
          phase: 'playing',
          players: current.players ?? gs?.players ?? { player1: null, player2: null },
        };
      });
    } catch { /* ignore */ }
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

  const isMyTurn =
    myRole !== null &&
    gameState?.currentTurn === myRole &&
    gameState?.phase === 'playing';

  return {
    gameState, myRole, roomCode, isConnected, error,
    createRoom, joinRoom, makeMove, nextRound, resetGame,
    leaveRoom, isMyTurn, winningCombo,
  };
}
