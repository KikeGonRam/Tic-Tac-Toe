import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Modal, useWindowDimensions,
} from 'react-native';
import { COLORS, rs, hs } from '../utils/theme';
import { GameState } from '../utils/gameLogic';

interface RoundOverlayProps {
  gameState: GameState;
  myRole: 'player1' | 'player2';
  onNextRound: () => void;
  onReset: () => void;
  canAdvance: boolean;
}

export default function RoundOverlay({ gameState, myRole, onNextRound, onReset, canAdvance }: RoundOverlayProps) {
  const { width } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const isGameOver = gameState.phase === 'game_over';
  const winner = isGameOver ? gameState.gameWinner : gameState.roundWinner;
  const isDraw = winner === 'draw';
  const iWon = winner === myRole;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    if (!isDraw) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const getTitle = () => {
    if (isDraw) return 'EMPATE';
    if (isGameOver) return iWon ? '¡GANASTE!' : '¡PERDISTE!';
    return iWon ? '¡RONDA TUYA!' : '¡RONDA DEL RIVAL!';
  };

  const getSubtitle = () => {
    if (isDraw && !isGameOver) return `Nadie marcó en la ronda ${gameState.round}`;
    if (isDraw && isGameOver) return 'Partido increíblemente igualado';
    if (isGameOver && iWon) return '¡CAMPEÓN DE LA SERIE!';
    if (isGameOver && !iWon) return 'El rival ganó la serie';
    const sym = winner === 'player1' ? '○' : '✕';
    return `${sym} gana la ronda ${gameState.round}`;
  };

  const titleColor = isDraw ? COLORS.gold : iWon ? COLORS.cyan : COLORS.orange;
  const glowColor = isDraw ? COLORS.gold : iWon ? COLORS.cyan : COLORS.orange;
  const cardWidth = Math.min(width - rs(40), 320);

  return (
    <Modal transparent animationType="none" visible>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            { width: cardWidth, transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            { borderColor: glowColor, shadowColor: glowColor },
          ]}
        >
          <View style={[styles.topBar, { backgroundColor: glowColor }]} />

          <View style={[styles.iconRing, { borderColor: glowColor, width: rs(64), height: rs(64), borderRadius: rs(32) }]}>
            <Text style={[styles.iconText, { color: glowColor, fontSize: rs(30) }]}>
              {isDraw ? '⊘' : iWon ? '★' : isGameOver ? '☆' : winner === 'player1' ? '○' : '✕'}
            </Text>
          </View>

          <Text style={[styles.title, { color: titleColor, fontSize: rs(24) }]}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>

          <View style={styles.scoreRow}>
            <View style={[styles.scorePill, { borderColor: COLORS.cyanDim }]}>
              <Text style={styles.scoreSymbol}>○</Text>
              <Text style={[styles.scorePillNum, { color: COLORS.cyan }]}>{gameState.scores.player1}</Text>
            </View>
            <Text style={styles.scoreDash}>—</Text>
            <View style={[styles.scorePill, { borderColor: COLORS.orangeDim }]}>
              <Text style={[styles.scorePillNum, { color: COLORS.orange }]}>{gameState.scores.player2}</Text>
              <Text style={styles.scoreSymbol}>✕</Text>
            </View>
          </View>

          {!isGameOver && (
            canAdvance ? (
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onNextRound}>
                <Text style={styles.btnTextPrimary}>RONDA {gameState.round + 1} →</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingBox}>
                <Text style={styles.waitingText}>⏳ Esperando al rival...</Text>
              </View>
            )
          )}

          {isGameOver && (
            canAdvance ? (
              <TouchableOpacity style={[styles.btn, styles.btnGold]} onPress={onReset}>
                <Text style={styles.btnTextGold}>↺ JUGAR DE NUEVO</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingBox}>
                <Text style={styles.waitingText}>⏳ Esperando decisión del rival...</Text>
              </View>
            )
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,10,30,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(20),
  },
  card: {
    backgroundColor: '#080F2A',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: rs(22),
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  iconRing: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(14),
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconText: {
    fontWeight: '300',
    lineHeight: rs(36),
  },
  title: {
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: 'Courier New',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: rs(12),
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: rs(16),
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    marginBottom: rs(20),
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    paddingHorizontal: rs(14),
    paddingVertical: rs(7),
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  scoreSymbol: { fontSize: rs(13), color: COLORS.gray },
  scorePillNum: { fontSize: rs(22), fontWeight: '900', fontFamily: 'Courier New' },
  scoreDash: { fontSize: rs(18), color: COLORS.gray },
  btn: {
    width: '100%',
    paddingVertical: rs(13),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnTextPrimary: { fontSize: rs(14), fontWeight: '900', color: '#050A1E', letterSpacing: 2 },
  btnGold: {
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnTextGold: { fontSize: rs(14), fontWeight: '900', color: '#050A1E', letterSpacing: 2 },
  waitingBox: {
    paddingHorizontal: rs(18),
    paddingVertical: rs(11),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  waitingText: { color: COLORS.gray, fontSize: rs(12), letterSpacing: 0.5 },
});
