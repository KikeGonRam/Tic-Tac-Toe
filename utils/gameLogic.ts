// utils/gameLogic.ts

export type CellValue = 'O' | 'X' | null;
export type Board = CellValue[];
export type GamePhase = 'waiting' | 'playing' | 'round_over' | 'game_over';

export interface GameState {
  board: Board;
  currentTurn: 'player1' | 'player2'; // player1 = O, player2 = X
  scores: { player1: number; player2: number };
  round: number; // 1-5
  phase: GamePhase;
  roundWinner: 'player1' | 'player2' | 'draw' | null;
  gameWinner: 'player1' | 'player2' | null;
  players: { player1: string | null; player2: string | null };
}

export const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export const INITIAL_BOARD: Board = Array(9).fill(null);

export function checkWinner(board: Board): { winner: CellValue; combo: number[] | null } {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return { winner: null, combo: null };
}

export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== null);
}

export function getInitialGameState(): GameState {
  return {
    board: [...INITIAL_BOARD],
    currentTurn: 'player1',
    scores: { player1: 0, player2: 0 },
    round: 1,
    phase: 'waiting',
    roundWinner: null,
    gameWinner: null,
    players: { player1: null, player2: null },
  };
}

export function calculateGameWinner(
  scores: { player1: number; player2: number },
  round: number,
  roundWinner: 'player1' | 'player2' | 'draw' | null
): 'player1' | 'player2' | null {
  const newScores = { ...scores };
  if (roundWinner === 'player1') newScores.player1++;
  if (roundWinner === 'player2') newScores.player2++;

  // Si alguien llega a 3 victorias antes del round 5 → gana
  if (newScores.player1 >= 3) return 'player1';
  if (newScores.player2 >= 3) return 'player2';

  // En el round 5 (último), gana quien tenga más puntos
  if (round === 5) {
    if (newScores.player1 > newScores.player2) return 'player1';
    if (newScores.player2 > newScores.player1) return 'player2';
    // Si empate 2-2 al final del round 5: desempate por quien ganó el último round
    if (newScores.player1 === newScores.player2) {
      return roundWinner === 'player1' ? 'player1' : 'player2';
    }
  }

  return null;
}

function minimax(board: Board, isMaximizing: boolean, depth = 0): number {
  const { winner } = checkWinner(board);
  if (winner === 'X') return 10 - depth;
  if (winner === 'O') return depth - 10;
  if (isBoardFull(board)) return 0;

  const available = board.map((c, i) => (c === null ? i : -1)).filter(i => i !== -1);

  if (isMaximizing) {
    let best = -Infinity;
    for (const idx of available) {
      const b = [...board] as Board;
      b[idx] = 'X';
      best = Math.max(best, minimax(b, false, depth + 1));
    }
    return best;
  } else {
    let best = Infinity;
    for (const idx of available) {
      const b = [...board] as Board;
      b[idx] = 'O';
      best = Math.min(best, minimax(b, true, depth + 1));
    }
    return best;
  }
}

export function getAIMove(board: Board, difficulty: 'easy' | 'hard'): number {
  const available = board.map((c, i) => (c === null ? i : -1)).filter(i => i !== -1);
  if (available.length === 0) return -1;

  if (difficulty === 'easy') {
    return available[Math.floor(Math.random() * available.length)];
  }

  let bestScore = -Infinity;
  let bestMove = available[0];
  for (const idx of available) {
    const b = [...board] as Board;
    b[idx] = 'X';
    const score = minimax(b, false);
    if (score > bestScore) { bestScore = score; bestMove = idx; }
  }
  return bestMove;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
