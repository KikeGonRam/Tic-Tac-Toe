import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { rs, hs, ThemeColors, nativeDriver } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface WaitingScreenProps {
  roomCode: string;
}

export default function WaitingScreen({ roomCode }: WaitingScreenProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors, width, height]);
  const charBoxSize = Math.min(rs(44), (width - 80) / 7);

  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  const pulse = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const dotAnims = dots.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 220),
          Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: nativeDriver }),
          Animated.timing(anim, { toValue: 0.3, duration: 380, useNativeDriver: nativeDriver }),
          Animated.delay((dots.length - i - 1) * 220),
        ])
      )
    );
    dotAnims.forEach(a => a.start());

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: nativeDriver }),
          Animated.timing(ringScale, { toValue: 1.06, duration: 1400, useNativeDriver: nativeDriver }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: nativeDriver }),
          Animated.timing(ringScale, { toValue: 1, duration: 1400, useNativeDriver: nativeDriver }),
        ]),
      ])
    );
    pulseLoop.start();

    return () => {
      dotAnims.forEach(a => a.stop());
      pulseLoop.stop();
    };
  }, []);

  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
    <View style={s.container}>
      <View style={s.bgGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={[s.bgCell, i === 4 && s.bgCellCenter]} />
        ))}
      </View>

      <View style={s.badge}>
        <Ionicons name="wifi-outline" size={rs(11)} color={colors.cyan} />
        <Text style={s.badgeText}>SALA CREADA · ESPERANDO RIVAL</Text>
      </View>

      <Text style={s.codeLabel}>CÓDIGO DE SALA</Text>

      <View style={s.codeWrapper}>
        <Animated.View
          style={[
            s.pulseRing,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
              width: (charBoxSize + rs(6)) * 6 + rs(5) * 5 + rs(24),
              height: charBoxSize * 1.25 + rs(24),
              borderRadius: 22,
            },
          ]}
        />
        <View style={s.codeRow}>
          {roomCode.split('').map((char, i) => (
            <View key={i} style={[s.charBox, { width: charBoxSize, height: charBoxSize * 1.25 }]}>
              <Text style={[s.charText, { fontSize: charBoxSize * 0.52 }]}>{char}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={s.hint}>Comparte este código con tu rival para que se una</Text>

      <View style={s.dotsRow}>
        {dots.map((anim, i) => (
          <Animated.View key={i} style={[s.dot, { opacity: anim }]} />
        ))}
      </View>

      <View style={s.playersBox}>
        <View style={[s.playerRow, s.playerRowActive]}>
          <View style={[s.symbolBadge, { borderColor: colors.cyan }]}>
            <Text style={[s.symbolText, { color: colors.cyan }]}>○</Text>
          </View>
          <View style={s.playerInfo}>
            <Text style={[s.playerName, { color: colors.cyan }]}>JUGADOR 1</Text>
            <Text style={s.playerStatus}>Conectado · Esperando...</Text>
          </View>
          <Ionicons name="checkmark-circle" size={rs(18)} color={colors.success} />
        </View>

        <View style={s.playerDivider} />

        <View style={[s.playerRow, s.playerRowPending]}>
          <View style={[s.symbolBadge, { borderColor: colors.borderBright }]}>
            <Text style={[s.symbolText, { color: colors.gray }]}>✕</Text>
          </View>
          <View style={s.playerInfo}>
            <Text style={[s.playerName, { color: colors.gray }]}>JUGADOR 2</Text>
            <Text style={s.playerStatus}>Sin conectar</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={rs(18)} color={colors.gray} />
        </View>
      </View>
    </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: rs(28),
  },
  bgGrid: {
    position: 'absolute', top: hs(40), right: rs(16),
    flexDirection: 'row', flexWrap: 'wrap', width: rs(84), opacity: 0.06,
  },
  bgCell: { width: rs(28), height: rs(28), borderWidth: 0.5, borderColor: c.cyan },
  bgCellCenter: { backgroundColor: c.cyan },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: rs(6),
    backgroundColor: c.cyanGlow, borderWidth: 1, borderColor: c.cyanDim,
    paddingHorizontal: rs(14), paddingVertical: 6, borderRadius: 20, marginBottom: hs(28),
  },
  badgeText: { fontSize: rs(9), fontWeight: '800', letterSpacing: 2, color: c.cyan },
  codeLabel: { fontSize: rs(11), fontWeight: '800', letterSpacing: 4, color: c.gray, marginBottom: hs(14) },
  codeWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: hs(16) },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5, borderColor: c.cyan,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity, shadowRadius: 12, elevation: 6,
  },
  codeRow: { flexDirection: 'row', gap: rs(5) },
  charBox: {
    borderRadius: 10, borderWidth: 2, borderColor: c.cyan,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.cyanGlow,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.7, shadowRadius: 8, elevation: 6,
  },
  charText: { fontWeight: '900', fontFamily: 'Courier New', color: c.cyan },
  hint: {
    fontSize: rs(13), color: c.gray, textAlign: 'center',
    lineHeight: rs(20), marginBottom: hs(20), maxWidth: rs(260),
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: hs(32) },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.cyan },
  playersBox: {
    width: '100%', backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.border,
    borderRadius: 18, overflow: 'hidden',
  },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', gap: rs(12), padding: rs(14),
  },
  playerRowActive: { backgroundColor: c.cyanGlow },
  playerRowPending: { opacity: 0.5 },
  playerDivider: { height: 1, backgroundColor: c.border },
  symbolBadge: {
    width: rs(32), height: rs(32), borderRadius: rs(16),
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  symbolText: { fontSize: rs(14), fontWeight: '700' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: rs(11), fontWeight: '800', letterSpacing: 1.5 },
  playerStatus: { fontSize: rs(10), color: c.gray, marginTop: 2 },
});
