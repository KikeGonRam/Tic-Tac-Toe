import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { rs, hs, ThemeColors } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { GameState } from '../utils/gameLogic';

interface ScoreBoardProps {
  gameState: GameState;
  myRole: 'player1' | 'player2';
  playerName?: string;
  opponentName?: string;
}

export default function ScoreBoard({ gameState, myRole, playerName, opponentName }: ScoreBoardProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors, width, height]);
  const { scores, round, currentTurn, phase } = gameState;
  const isP1Leading = scores.player1 > scores.player2;
  const isP2Leading = scores.player2 > scores.player1;
  const isTied = scores.player1 === scores.player2;
  const p1Label = myRole === 'player1' ? (playerName || 'TÚ') : (opponentName || 'RIVAL');
  const p2Label = myRole === 'player2' ? (playerName || 'TÚ') : (opponentName || 'RIVAL');

  return (
    <View style={s.container}>
      <View style={s.roundBadge}>
        <Text style={s.roundLabel}>RONDA</Text>
        <Text style={s.roundNumber}>{round}<Text style={s.roundTotal}>/5</Text></Text>
      </View>

      <View style={s.playersRow}>
        {/* Player 1 */}
        <View style={[
          s.playerCard, s.p1Card,
          currentTurn === 'player1' && phase === 'playing' && s.activeCardO,
          myRole === 'player1' && s.myCard,
        ]}>
          <View style={s.symbolBadgeO}><Text style={s.symbolTextO}>○</Text></View>
          <Text style={s.playerLabel} numberOfLines={1}>{p1Label}</Text>
          <Text style={[s.scoreText, { color: colors.cyan }]}>{scores.player1}</Text>
          {currentTurn === 'player1' && phase === 'playing' && (
            <View style={[s.turnBar, { backgroundColor: colors.cyan }]} />
          )}
        </View>

        <View style={s.divider}>
          <Text style={s.vsText}>VS</Text>
          {isTied  && <Text style={[s.leadIcon, { color: colors.gold }]}>≡</Text>}
          {isP1Leading && <Text style={[s.leadIcon, { color: colors.cyan }]}>◀</Text>}
          {isP2Leading && <Text style={[s.leadIcon, { color: colors.orange }]}>▶</Text>}
        </View>

        {/* Player 2 */}
        <View style={[
          s.playerCard, s.p2Card,
          currentTurn === 'player2' && phase === 'playing' && s.activeCardX,
          myRole === 'player2' && s.myCard,
        ]}>
          <View style={s.symbolBadgeX}><Text style={s.symbolTextX}>✕</Text></View>
          <Text style={s.playerLabel} numberOfLines={1}>{p2Label}</Text>
          <Text style={[s.scoreText, { color: colors.orange }]}>{scores.player2}</Text>
          {currentTurn === 'player2' && phase === 'playing' && (
            <View style={[s.turnBar, { backgroundColor: colors.orange }]} />
          )}
        </View>
      </View>

      <View style={s.dotsRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              i + 1 < round && s.dotDone,
              i + 1 === round && s.dotCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: rs(16),
    paddingTop: hs(8),
    paddingBottom: hs(4),
  },
  roundBadge: {
    flexDirection: 'row', alignItems: 'baseline', marginBottom: hs(8),
    backgroundColor: c.goldGlow,
    paddingHorizontal: rs(14), paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: c.goldDim, gap: 6,
  },
  roundLabel: { fontSize: rs(9), fontWeight: '700', color: c.gold, letterSpacing: 3 },
  roundNumber: { fontSize: rs(20), fontWeight: '900', color: c.gold, fontFamily: 'Courier New' },
  roundTotal: { fontSize: rs(12), color: c.goldDim },
  playersRow: {
    flexDirection: 'row', alignItems: 'center', gap: rs(10),
    width: '100%', justifyContent: 'center',
  },
  playerCard: {
    flex: 1, alignItems: 'center',
    paddingVertical: hs(8), paddingHorizontal: rs(8),
    borderRadius: 14, borderWidth: 1.5, borderColor: c.border,
    backgroundColor: c.surface, position: 'relative',
  },
  p1Card: { borderColor: c.cyanDim },
  p2Card: { borderColor: c.orangeDim },
  activeCardO: {
    borderColor: c.cyan, backgroundColor: c.cyanGlow,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.5, shadowRadius: 10, elevation: 8,
  },
  activeCardX: {
    borderColor: c.orange, backgroundColor: c.orangeGlow,
    shadowColor: c.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.5, shadowRadius: 10, elevation: 8,
  },
  myCard: { borderWidth: 2 },
  symbolBadgeO: {
    width: rs(28), height: rs(28), borderRadius: rs(14), borderWidth: 2,
    borderColor: c.cyan, alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  symbolBadgeX: {
    width: rs(28), height: rs(28), borderRadius: 7, borderWidth: 2,
    borderColor: c.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  symbolTextO: { fontSize: rs(14), color: c.cyan, fontWeight: '300', lineHeight: rs(18) },
  symbolTextX: { fontSize: rs(13), color: c.orange, fontWeight: '700' },
  playerLabel: {
    fontSize: rs(9), fontWeight: '800', letterSpacing: 1.5,
    color: c.gray, marginBottom: 2, maxWidth: '90%',
  },
  scoreText: { fontSize: rs(30), fontWeight: '900', fontFamily: 'Courier New' },
  turnBar: { position: 'absolute', bottom: 4, width: rs(18), height: 3, borderRadius: 2 },
  divider: { alignItems: 'center', width: rs(32) },
  vsText: { fontSize: rs(10), fontWeight: '900', color: c.gray, letterSpacing: 1 },
  leadIcon: { fontSize: rs(12), marginTop: 2 },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: hs(8) },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: c.border, borderWidth: 1, borderColor: c.borderBright,
  },
  dotDone: { backgroundColor: c.gold, borderColor: c.gold },
  dotCurrent: {
    backgroundColor: c.cyan, borderColor: c.cyan,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.9, shadowRadius: 4, elevation: 4,
  },
});
