import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Modal, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rs, hs, ThemeColors, nativeDriver } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { GameState } from '../utils/gameLogic';
import Confetti from './Confetti';
import ScaleBtn from './ScaleBtn';

interface RoundOverlayProps {
  gameState: GameState;
  myRole: 'player1' | 'player2';
  onNextRound: () => void;
  onReset: () => void;
  onLeave: () => void;
  canAdvance: boolean;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export default function RoundOverlay({ gameState, myRole, onNextRound, onReset, onLeave, canAdvance }: RoundOverlayProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors, width, height]);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const isGameOver = gameState.phase === 'game_over';
  const winner = isGameOver ? gameState.gameWinner : gameState.roundWinner;
  const isDraw = winner === 'draw';
  const iWon = winner === myRole;
  const showConfetti = isGameOver && iWon;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: nativeDriver }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: nativeDriver }),
    ]).start();

    if (!isDraw) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: nativeDriver }),
          Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: nativeDriver }),
        ])
      ).start();
    }
  }, []);

  const getTitle = () => {
    if (isDraw) return 'EMPATE';
    if (isGameOver) return iWon ? '¡CAMPEÓN!' : '¡DERROTA!';
    return iWon ? '¡RONDA TUYA!' : '¡RONDA DEL RIVAL!';
  };

  const getSubtitle = () => {
    if (isDraw && !isGameOver) return `Nadie marcó en la ronda ${gameState.round}`;
    if (isDraw && isGameOver) return 'Partido increíblemente igualado';
    if (isGameOver && iWon) return '¡Ganaste la serie completa!';
    if (isGameOver && !iWon) return 'El rival ganó la serie';
    const sym = winner === 'player1' ? '○' : '✕';
    return `${sym} gana la ronda ${gameState.round}`;
  };

  const getIcon = (): IoniconName => {
    if (isDraw) return 'remove-circle-outline';
    if (isGameOver && iWon) return 'trophy';
    if (isGameOver && !iWon) return 'star-outline';
    return iWon ? 'star' : 'star-half-outline';
  };

  const titleColor = isDraw ? colors.gold : iWon ? colors.cyan : colors.orange;
  const glowColor = isDraw ? colors.gold : iWon ? colors.cyan : colors.orange;
  const cardWidth = Math.min(width - rs(40), 320);

  return (
    <Modal transparent animationType="none" visible>
      <View style={s.backdrop}>
        <Confetti active={showConfetti} />

        <Animated.View
          style={[
            s.card,
            { width: cardWidth, transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            { borderColor: glowColor, shadowColor: glowColor },
          ]}
        >
          <View style={[s.topBar, { backgroundColor: glowColor }]} />

          <View style={[s.iconRing, { borderColor: glowColor, width: rs(64), height: rs(64), borderRadius: rs(32) }]}>
            <Ionicons name={getIcon()} size={rs(30)} color={glowColor} />
          </View>

          <Text style={[s.title, { color: titleColor, fontSize: rs(24) }]}>{getTitle()}</Text>
          <Text style={s.subtitle}>{getSubtitle()}</Text>

          <View style={s.scoreRow}>
            <View style={[s.scorePill, { borderColor: colors.cyanDim }]}>
              <Text style={s.scoreSymbol}>○</Text>
              <Text style={[s.scorePillNum, { color: colors.cyan }]}>{gameState.scores.player1}</Text>
            </View>
            <Text style={s.scoreDash}>—</Text>
            <View style={[s.scorePill, { borderColor: colors.orangeDim }]}>
              <Text style={[s.scorePillNum, { color: colors.orange }]}>{gameState.scores.player2}</Text>
              <Text style={s.scoreSymbol}>✕</Text>
            </View>
          </View>

          {!isGameOver && (
            canAdvance ? (
              <ScaleBtn style={[s.btn, s.btnPrimary]} onPress={onNextRound}>
                <View style={s.btnInner}>
                  <Text style={[s.btnText, { color: colors.onCyan }]}>RONDA {gameState.round + 1}</Text>
                  <Ionicons name="arrow-forward-outline" size={rs(16)} color={colors.onCyan} />
                </View>
              </ScaleBtn>
            ) : (
              <View style={s.waitingBox}>
                <Ionicons name="time-outline" size={rs(14)} color={colors.gray} />
                <Text style={s.waitingText}>Esperando al rival...</Text>
              </View>
            )
          )}

          {isGameOver && (
            canAdvance ? (
              <View style={s.gameOverBtns}>
                <ScaleBtn style={[s.btn, s.btnGold]} onPress={onReset}>
                  <View style={s.btnInner}>
                    <Ionicons name="refresh-outline" size={rs(16)} color={colors.onCyan} />
                    <Text style={[s.btnText, { color: colors.onCyan }]}>JUGAR DE NUEVO</Text>
                  </View>
                </ScaleBtn>
                <ScaleBtn style={[s.btn, s.btnLeave]} onPress={onLeave}>
                  <View style={s.btnInner}>
                    <Ionicons name="exit-outline" size={rs(16)} color={colors.gray} />
                    <Text style={s.btnTextLeave}>SALIR</Text>
                  </View>
                </ScaleBtn>
              </View>
            ) : (
              <View style={s.waitingBox}>
                <Ionicons name="time-outline" size={rs(14)} color={colors.gray} />
                <Text style={s.waitingText}>Esperando decisión del rival...</Text>
              </View>
            )
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: c.overlayBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(20),
  },
  card: {
    backgroundColor: c.cardBg,
    borderRadius: 24, borderWidth: 1.5,
    padding: rs(22), alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity + 0.1, shadowRadius: 24, elevation: 20,
    overflow: 'hidden',
  },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  iconRing: {
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
    marginBottom: rs(14), backgroundColor: c.surface,
  },
  title: { fontWeight: '900', letterSpacing: 2, marginBottom: rs(6), fontFamily: 'Courier New', textAlign: 'center' },
  subtitle: { fontSize: rs(12), color: c.gray, textAlign: 'center', marginBottom: rs(20), letterSpacing: 0.5 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: rs(10), marginBottom: rs(24) },
  scorePill: {
    flexDirection: 'row', alignItems: 'center', gap: rs(5),
    paddingHorizontal: rs(14), paddingVertical: rs(7),
    borderRadius: 20, borderWidth: 1.5, backgroundColor: c.surface,
  },
  scoreSymbol: { fontSize: rs(13), color: c.gray },
  scorePillNum: { fontSize: rs(22), fontWeight: '900', fontFamily: 'Courier New' },
  scoreDash: { fontSize: rs(18), color: c.gray },
  btn: { width: '100%', borderRadius: 14 },
  btnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(8), paddingVertical: rs(13),
  },
  btnText: { fontSize: rs(14), fontWeight: '900', letterSpacing: 2 },
  btnPrimary: {
    backgroundColor: c.cyan,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.7, shadowRadius: 10, elevation: 8,
  },
  btnGold: {
    backgroundColor: c.gold,
    shadowColor: c.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.7, shadowRadius: 10, elevation: 8,
  },
  gameOverBtns: { width: '100%', gap: rs(10) },
  btnLeave: {
    borderWidth: 1, borderColor: c.borderBright, backgroundColor: c.surface,
  },
  btnTextLeave: { fontSize: rs(13), fontWeight: '700', color: c.gray, letterSpacing: 1.5 },
  waitingBox: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8),
    paddingHorizontal: rs(18), paddingVertical: rs(11),
    borderRadius: 12, borderWidth: 1,
    borderColor: c.border, backgroundColor: c.surface,
  },
  waitingText: { color: c.gray, fontSize: rs(12), letterSpacing: 0.5 },
});
