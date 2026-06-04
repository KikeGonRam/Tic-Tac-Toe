import { useState, useEffect } from 'react';
import { GamePhase } from '../utils/gameLogic';

const SECONDS = 15;

export function useTurnTimer(isMyTurn: boolean, phase: GamePhase) {
  const [timeLeft, setTimeLeft] = useState(SECONDS);

  useEffect(() => {
    setTimeLeft(SECONDS);
  }, [isMyTurn, phase]);

  useEffect(() => {
    if (phase !== 'playing' || !isMyTurn || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, isMyTurn, phase]);

  return {
    timeLeft,
    fraction: timeLeft / SECONDS,
    isUrgent: timeLeft <= 5,
  };
}
