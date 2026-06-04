// components/GameScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../utils/theme';
import { GameState } from '../utils/gameLogic';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import RoundOverlay from './RoundOverlay';

interface GameScreenProps {
  gameState: GameState;
  myRole: 'player1' | 'player2';
  isMyTurn: boolean;
  winningCombo: number[] | null;
  roomCode: string;
  onMove: (index: number) => void;
  onNextRound: () => void;
  onReset: () => void;
  onLeave: () => void;
}

export default function GameScreen({
  gameState,
  myRole,
  isMyTurn,
  winningCombo,
  roomCode,
  onMove,
  onNextRound,
  onReset,
  onLeave,
}: GameScreenProps) {
  const isOverlay = gameState.phase === 'round_over' || gameState.phase === 'game_over';
  const mySymbol = myRole === 'player1' ? '○' : '✕';
  const myColor = myRole === 'player1' ? COLORS.cyan : COLORS.orange;

  const turnText = isMyTurn
    ? 'TU TURNO'
    : `TURNO DEL RIVAL`;
  const turnColor = isMyTurn ? myColor : COLORS.gray;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
          <Text style={styles.leaveBtnText}>✕ SALIR</Text>
        </TouchableOpacity>
        <View style={styles.roomCodeBadge}>
          <Text style={styles.roomCodeLabel}>SALA</Text>
          <Text style={styles.roomCodeValue}>{roomCode}</Text>
        </View>
        <View style={[styles.mySymbolBadge, { borderColor: myColor }]}>
          <Text style={[styles.mySymbolText, { color: myColor }]}>{mySymbol}</Text>
        </View>
      </View>

      {/* ScoreBoard */}
      <ScoreBoard gameState={gameState} myRole={myRole} />

      {/* Turn indicator */}
      <View style={styles.turnRow}>
        <View style={[styles.turnDot, { backgroundColor: isMyTurn ? myColor : 'transparent', borderColor: myColor }]} />
        <Text style={[styles.turnText, { color: turnColor }]}>{turnText}</Text>
        <View style={[styles.turnDot, { backgroundColor: isMyTurn ? myColor : 'transparent', borderColor: myColor }]} />
      </View>

      {/* Board */}
      <View style={styles.boardWrapper}>
        <Board
          board={gameState.board}
          onCellPress={onMove}
          isMyTurn={isMyTurn}
          winningCombo={winningCombo}
          disabled={isOverlay}
        />
      </View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecor}>
        <View style={[styles.decorLine, { backgroundColor: COLORS.cyan }]} />
        <View style={styles.decorDot} />
        <View style={[styles.decorLine, { backgroundColor: COLORS.orange }]} />
      </View>

      {/* Round/Game Over Overlay */}
      {isOverlay && (
        <RoundOverlay
          gameState={gameState}
          myRole={myRole}
          onNextRound={onNextRound}
          onReset={onReset}
          canAdvance={myRole === 'player1'}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  leaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,68,102,0.4)',
    backgroundColor: 'rgba(255,68,102,0.06)',
  },
  leaveBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF4466',
    letterSpacing: 1.5,
  },
  roomCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  roomCodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
  },
  roomCodeValue: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'Courier New',
    color: COLORS.white,
    letterSpacing: 2,
  },
  mySymbolBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mySymbolText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  turnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  turnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  bottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 16,
    gap: 0,
    justifyContent: 'center',
  },
  decorLine: {
    flex: 1,
    height: 1.5,
    opacity: 0.4,
  },
  decorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    marginHorizontal: 10,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
