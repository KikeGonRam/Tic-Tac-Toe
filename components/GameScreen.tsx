import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet,
  StatusBar, Animated, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { rs, hs, ThemeColors, nativeDriver } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import ScaleBtn from './ScaleBtn';
import { GameState } from '../utils/gameLogic';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import RoundOverlay from './RoundOverlay';
import { useTurnTimer } from '../hooks/useTurnTimer';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface GameScreenProps {
  gameState: GameState;
  myRole: 'player1' | 'player2';
  isMyTurn: boolean;
  winningCombo: number[] | null;
  roomCode: string | null;
  onMove: (index: number) => void;
  onNextRound: () => void;
  onReset: () => void;
  onLeave: () => void;
  isAIThinking?: boolean;
  musicButton?: React.ReactNode;
  playerName?: string;
}

export default function GameScreen({
  gameState, myRole, isMyTurn, winningCombo, roomCode,
  onMove, onNextRound, onReset, onLeave,
  isAIThinking, musicButton, playerName,
}: GameScreenProps) {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors, width, height]);

  const isSolo = roomCode === null;
  const isOverlay = gameState.phase === 'round_over' || gameState.phase === 'game_over';
  const mySymbol = myRole === 'player1' ? '○' : '✕';
  const myColor = myRole === 'player1' ? colors.cyan : colors.orange;
  const myBgGlow = myRole === 'player1' ? colors.cyanGlow : colors.orangeGlow;

  const isActiveMyTurn = isMyTurn && !isAIThinking;
  const turnText = isAIThinking
    ? 'IA PENSANDO...'
    : isMyTurn ? 'TU TURNO' : 'TURNO DEL RIVAL';
  const turnColor = isAIThinking ? colors.gold : isActiveMyTurn ? myColor : colors.grayMuted;

  const { timeLeft, fraction, isUrgent } = useTurnTimer(isMyTurn, gameState.phase);
  const sounds = useSoundEffects();

  // Timer bar animation
  const timerAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(timerAnim, {
      toValue: fraction,
      duration: 850,
      useNativeDriver: false,
    }).start();
  }, [fraction]);

  // Pulse animation for active turn
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    if (pulseLoop.current) pulseLoop.current.stop();
    if (isActiveMyTurn && gameState.phase === 'playing') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.55, duration: 700, useNativeDriver: nativeDriver }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: nativeDriver }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => { pulseLoop.current?.stop(); };
  }, [isActiveMyTurn, gameState.phase]);

  // Sound on phase change
  const prevPhase = useRef(gameState.phase);
  useEffect(() => {
    if (
      (gameState.phase === 'round_over' || gameState.phase === 'game_over') &&
      prevPhase.current === 'playing'
    ) {
      const w = gameState.phase === 'game_over' ? gameState.gameWinner : gameState.roundWinner;
      if (w === myRole) sounds.playWin();
      else if (w === 'draw') sounds.playDraw();
      else sounds.playLose();
    }
    prevPhase.current = gameState.phase;
  }, [gameState.phase]);

  const timerColor = isUrgent ? colors.error : myColor;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={s.header}>
        <ScaleBtn style={s.leaveBtn} onPress={onLeave}>
          <View style={s.leaveBtnInner}>
            <Ionicons name="close-outline" size={rs(14)} color={colors.error} />
            <Text style={[s.leaveBtnText, { color: colors.error }]}>SALIR</Text>
          </View>
        </ScaleBtn>

        {isSolo ? (
          <View style={s.roomCodeBadge}>
            <Text style={s.roomCodeLabel}>MODO</Text>
            <Text style={s.roomCodeValue}>SOLO</Text>
          </View>
        ) : (
          <View style={s.roomCodeBadge}>
            <Text style={s.roomCodeLabel}>SALA</Text>
            <Text style={s.roomCodeValue}>{roomCode}</Text>
          </View>
        )}

        <View style={s.headerRight}>
          {musicButton}
          <View style={[s.mySymbolBadge, { borderColor: myColor }]}>
            <Text style={[s.mySymbolText, { color: myColor }]}>{mySymbol}</Text>
          </View>
        </View>
      </View>

      {/* ScoreBoard */}
      <ScoreBoard
        gameState={gameState}
        myRole={myRole}
        playerName={playerName}
        opponentName={isSolo ? 'IA' : 'RIVAL'}
      />

      {/* Turn indicator */}
      <View style={s.turnSection}>
        <Animated.View
          style={[
            s.turnPill,
            isActiveMyTurn
              ? { backgroundColor: myBgGlow, borderColor: myColor }
              : { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Animated.View style={[s.turnDotLarge, {
            backgroundColor: isActiveMyTurn ? myColor : colors.grayMuted,
            opacity: isActiveMyTurn ? pulseAnim : 0.4,
            shadowColor: myColor,
            shadowOpacity: isActiveMyTurn ? 0.8 : 0,
            shadowRadius: 6,
          }]} />
          <Ionicons
            name={isAIThinking ? 'sync-outline' : isActiveMyTurn ? 'person-outline' : 'hourglass-outline'}
            size={rs(15)}
            color={turnColor}
          />
          <Text style={[s.turnText, { color: turnColor }]}>{turnText}</Text>
        </Animated.View>

        {/* Timer — shows during your turn with countdown */}
        {gameState.phase === 'playing' && isMyTurn && !isAIThinking && (
          <View style={s.timerRow}>
            <View style={s.timerTrack}>
              <Animated.View
                style={[
                  s.timerFill,
                  {
                    width: timerAnim.interpolate({
                      inputRange: [0, 1], outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: timerColor,
                    shadowColor: timerColor,
                    shadowOpacity: isUrgent ? 0.7 : 0,
                    shadowRadius: 4,
                  },
                ]}
              />
            </View>
            <Text style={[s.timerNum, { color: isUrgent ? colors.error : colors.gray }]}>
              {timeLeft}s
            </Text>
          </View>
        )}

        {/* Opponent timer placeholder — shows opponent is also on a clock */}
        {gameState.phase === 'playing' && !isMyTurn && !isSolo && (
          <View style={s.timerRow}>
            <View style={[s.timerTrack, { opacity: 0.3 }]}>
              <View style={[s.timerFill, { width: '100%', backgroundColor: colors.grayMuted }]} />
            </View>
            <Text style={[s.timerNum, { color: colors.grayMuted }]}>···</Text>
          </View>
        )}
      </View>

      {/* Board */}
      <View style={s.boardWrapper}>
        <Board
          board={gameState.board}
          onCellPress={onMove}
          isMyTurn={isMyTurn}
          winningCombo={winningCombo}
          disabled={isOverlay}
          onValidPress={sounds.playTap}
        />
      </View>

      {/* Bottom decoration */}
      <View style={s.bottomDecor}>
        <View style={[s.decorLine, { backgroundColor: colors.cyan }]} />
        <View style={s.decorDot} />
        <View style={[s.decorLine, { backgroundColor: colors.orange }]} />
      </View>

      {isOverlay && (
        <RoundOverlay
          gameState={gameState}
          myRole={myRole}
          onNextRound={onNextRound}
          onReset={onReset}
          onLeave={onLeave}
          canAdvance={true}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(14),
    paddingTop: hs(10),
    paddingBottom: hs(10),
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  leaveBtn: {
    paddingHorizontal: rs(12), paddingVertical: rs(7),
    borderRadius: 10, borderWidth: 1,
    borderColor: c.error,
    backgroundColor: c.errorGlow,
  },
  leaveBtnInner: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  leaveBtnText: { fontSize: rs(9), fontWeight: '800', letterSpacing: 1.5 },
  roomCodeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: rs(5),
    paddingHorizontal: rs(12), paddingVertical: rs(7),
    borderRadius: 10, borderWidth: 1,
    borderColor: c.border, backgroundColor: c.surface,
  },
  roomCodeLabel: { fontSize: rs(9), fontWeight: '700', color: c.gray, letterSpacing: 1 },
  roomCodeValue: {
    fontSize: rs(12), fontWeight: '900', fontFamily: 'Courier New',
    color: c.white, letterSpacing: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  mySymbolBadge: {
    width: rs(34), height: rs(34), borderRadius: 10, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface,
  },
  mySymbolText: { fontSize: rs(16), fontWeight: '700', lineHeight: rs(20) },
  turnSection: {
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingTop: hs(6),
    paddingBottom: hs(4),
    gap: hs(6),
  },
  turnPill: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8),
    paddingHorizontal: rs(20), paddingVertical: rs(9),
    borderRadius: 30, borderWidth: 1.5,
  },
  turnDotLarge: {
    width: 9, height: 9, borderRadius: 4.5,
    shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  turnText: { fontSize: rs(13), fontWeight: '900', letterSpacing: 2 },
  timerRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', gap: rs(8),
  },
  timerTrack: {
    flex: 1, height: 5, borderRadius: 3,
    backgroundColor: c.border, overflow: 'hidden',
  },
  timerFill: {
    height: '100%', borderRadius: 3,
    shadowOffset: { width: 0, height: 0 }, elevation: 3,
  },
  timerNum: {
    fontSize: rs(11), fontWeight: '900',
    fontFamily: 'Courier New', minWidth: rs(24), textAlign: 'right',
  },
  boardWrapper: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: rs(20), paddingVertical: hs(4),
  },
  bottomDecor: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: rs(40), paddingBottom: hs(12), justifyContent: 'center',
  },
  decorLine: { flex: 1, height: 1.5, opacity: 0.4 },
  decorDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: c.gold, marginHorizontal: 10,
    shadowColor: c.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity, shadowRadius: 4, elevation: 4,
  },
});
