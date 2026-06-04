// components/ScoreBoard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';
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
      {/* Round indicator */}
      <View style={styles.roundBadge}>
        <Text style={styles.roundLabel}>RONDA</Text>
        <Text style={styles.roundNumber}>{round}<Text style={styles.roundTotal}>/5</Text></Text>
      </View>

      {/* Players */}
      <View style={styles.playersRow}>
        {/* Player 1 - O */}
        <View style={[
          styles.playerCard,
          styles.p1Card,
          currentTurn === 'player1' && phase === 'playing' && styles.activeCard,
          myRole === 'player1' && styles.myCard,
        ]}>
          <View style={styles.symbolBadgeO}>
            <Text style={styles.symbolTextO}>○</Text>
          </View>
          <Text style={styles.playerLabel}>
            {myRole === 'player1' ? 'TÚ' : 'P1'}
          </Text>
          <Text style={[styles.scoreText, styles.scoreO]}>{scores.player1}</Text>
          {currentTurn === 'player1' && phase === 'playing' && (
            <View style={styles.turnIndicatorO} />
          )}
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <Text style={styles.vsText}>VS</Text>
          {isTied && <Text style={styles.tieText}>≡</Text>}
          {isP1Leading && <Text style={styles.leadText}>◀</Text>}
          {isP2Leading && <Text style={styles.leadTextR}>▶</Text>}
        </View>

        {/* Player 2 - X */}
        <View style={[
          styles.playerCard,
          styles.p2Card,
          currentTurn === 'player2' && phase === 'playing' && styles.activeCardX,
          myRole === 'player2' && styles.myCard,
        ]}>
          <View style={styles.symbolBadgeX}>
            <Text style={styles.symbolTextX}>✕</Text>
          </View>
          <Text style={styles.playerLabel}>
            {myRole === 'player2' ? 'TÚ' : 'P2'}
          </Text>
          <Text style={[styles.scoreText, styles.scoreX]}>{scores.player2}</Text>
          {currentTurn === 'player2' && phase === 'playing' && (
            <View style={styles.turnIndicatorX} />
          )}
        </View>
      </View>

      {/* Round dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: 5 }).map((_, i) => {
          const dotRound = i + 1;
          const isDone = dotRound < round;
          const isCurrent = dotRound === round;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                isDone && styles.dotDone,
                isCurrent && styles.dotCurrent,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  roundBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    backgroundColor: 'rgba(255,215,0,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    gap: 6,
  },
  roundLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 3,
  },
  roundNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.gold,
    fontFamily: 'Courier New',
  },
  roundTotal: {
    fontSize: 14,
    color: COLORS.goldDim,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  playerCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(10,20,60,0.6)',
    position: 'relative',
  },
  p1Card: {
    borderColor: COLORS.cyanDim,
  },
  p2Card: {
    borderColor: COLORS.orangeDim,
  },
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
  myCard: {
    borderWidth: 2,
  },
  symbolBadgeO: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  symbolBadgeX: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  symbolTextO: {
    fontSize: 18,
    color: COLORS.cyan,
    fontWeight: '300',
    lineHeight: 22,
  },
  symbolTextX: {
    fontSize: 16,
    color: COLORS.orange,
    fontWeight: '700',
  },
  playerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.gray,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: 'Courier New',
  },
  scoreO: {
    color: COLORS.cyan,
  },
  scoreX: {
    color: COLORS.orange,
  },
  turnIndicatorO: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.cyan,
  },
  turnIndicatorX: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.orange,
  },
  dividerContainer: {
    alignItems: 'center',
    width: 36,
  },
  vsText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.gray,
    letterSpacing: 1,
  },
  tieText: {
    fontSize: 18,
    color: COLORS.gold,
    marginTop: 2,
  },
  leadText: {
    fontSize: 14,
    color: COLORS.cyan,
    marginTop: 2,
  },
  leadTextR: {
    fontSize: 14,
    color: COLORS.orange,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dotDone: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  dotCurrent: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
