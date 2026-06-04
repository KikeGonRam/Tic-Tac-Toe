import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, rs, hs } from '../utils/theme';
import { GameState } from '../utils/gameLogic';

interface ScoreBoardProps {
  gameState: GameState;
  myRole: 'player1' | 'player2';
}

export default function ScoreBoard({ gameState, myRole }: ScoreBoardProps) {
  const { scores, round, currentTurn, phase } = gameState;
  const isP1Leading = scores.player1 > scores.player2;
  const isP2Leading = scores.player2 > scores.player1;
  const isTied = scores.player1 === scores.player2;

  return (
    <View style={styles.container}>
      <View style={styles.roundBadge}>
        <Text style={styles.roundLabel}>RONDA</Text>
        <Text style={styles.roundNumber}>
          {round}<Text style={styles.roundTotal}>/5</Text>
        </Text>
      </View>

      <View style={styles.playersRow}>
        <View style={[
          styles.playerCard, styles.p1Card,
          currentTurn === 'player1' && phase === 'playing' && styles.activeCard,
          myRole === 'player1' && styles.myCard,
        ]}>
          <View style={styles.symbolBadgeO}>
            <Text style={styles.symbolTextO}>○</Text>
          </View>
          <Text style={styles.playerLabel}>{myRole === 'player1' ? 'TÚ' : 'P1'}</Text>
          <Text style={[styles.scoreText, styles.scoreO]}>{scores.player1}</Text>
          {currentTurn === 'player1' && phase === 'playing' && (
            <View style={styles.turnIndicatorO} />
          )}
        </View>

        <View style={styles.dividerContainer}>
          <Text style={styles.vsText}>VS</Text>
          {isTied && <Text style={styles.tieText}>≡</Text>}
          {isP1Leading && <Text style={styles.leadText}>◀</Text>}
          {isP2Leading && <Text style={styles.leadTextR}>▶</Text>}
        </View>

        <View style={[
          styles.playerCard, styles.p2Card,
          currentTurn === 'player2' && phase === 'playing' && styles.activeCardX,
          myRole === 'player2' && styles.myCard,
        ]}>
          <View style={styles.symbolBadgeX}>
            <Text style={styles.symbolTextX}>✕</Text>
          </View>
          <Text style={styles.playerLabel}>{myRole === 'player2' ? 'TÚ' : 'P2'}</Text>
          <Text style={[styles.scoreText, styles.scoreX]}>{scores.player2}</Text>
          {currentTurn === 'player2' && phase === 'playing' && (
            <View style={styles.turnIndicatorX} />
          )}
        </View>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: 5 }).map((_, i) => {
          const dotRound = i + 1;
          const isDone = dotRound < round;
          const isCurrent = dotRound === round;
          return (
            <View key={i} style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]} />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: rs(16),
    paddingTop: hs(8),
    paddingBottom: hs(4),
  },
  roundBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: hs(8),
    backgroundColor: 'rgba(255,215,0,0.08)',
    paddingHorizontal: rs(14),
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    gap: 6,
  },
  roundLabel: {
    fontSize: rs(9),
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 3,
  },
  roundNumber: {
    fontSize: rs(20),
    fontWeight: '900',
    color: COLORS.gold,
    fontFamily: 'Courier New',
  },
  roundTotal: {
    fontSize: rs(12),
    color: COLORS.goldDim,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    width: '100%',
    justifyContent: 'center',
  },
  playerCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hs(8),
    paddingHorizontal: rs(8),
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(10,20,60,0.6)',
    position: 'relative',
  },
  p1Card: { borderColor: COLORS.cyanDim },
  p2Card: { borderColor: COLORS.orangeDim },
  activeCard: {
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.cyanGlow,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  activeCardX: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeGlow,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  myCard: { borderWidth: 2 },
  symbolBadgeO: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  symbolBadgeX: {
    width: rs(28),
    height: rs(28),
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  symbolTextO: { fontSize: rs(14), color: COLORS.cyan, fontWeight: '300', lineHeight: rs(18) },
  symbolTextX: { fontSize: rs(13), color: COLORS.orange, fontWeight: '700' },
  playerLabel: {
    fontSize: rs(9),
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.gray,
    marginBottom: 2,
  },
  scoreText: {
    fontSize: rs(30),
    fontWeight: '900',
    fontFamily: 'Courier New',
  },
  scoreO: { color: COLORS.cyan },
  scoreX: { color: COLORS.orange },
  turnIndicatorO: {
    position: 'absolute',
    bottom: 4,
    width: rs(18),
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.cyan,
  },
  turnIndicatorX: {
    position: 'absolute',
    bottom: 4,
    width: rs(18),
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.orange,
  },
  dividerContainer: { alignItems: 'center', width: rs(32) },
  vsText: { fontSize: rs(10), fontWeight: '900', color: COLORS.gray, letterSpacing: 1 },
  tieText: { fontSize: rs(16), color: COLORS.gold, marginTop: 2 },
  leadText: { fontSize: rs(12), color: COLORS.cyan, marginTop: 2 },
  leadTextR: { fontSize: rs(12), color: COLORS.orange, marginTop: 2 },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: hs(8) },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  dotDone: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  dotCurrent: {
    backgroundColor: COLORS.cyan, borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
});
