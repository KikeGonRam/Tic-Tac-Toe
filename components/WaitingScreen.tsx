// components/WaitingScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/theme';

interface WaitingScreenProps {
  roomCode: string;
}

export default function WaitingScreen({ roomCode }: WaitingScreenProps) {
  const dotOpacity = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const animations = dotOpacity.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 250),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay((dotOpacity.length - i - 1) * 250),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.container}>
      {/* Grid decoration */}
      <View style={styles.gridDecor}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={[styles.gridCell, i === 4 && styles.gridCellCenter]} />
        ))}
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>SALA CREADA · ESPERANDO RIVAL</Text>
      </View>

      <Text style={styles.title}>TU CÓDIGO</Text>
      <View style={styles.codeContainer}>
        {roomCode.split('').map((char, i) => (
          <View key={i} style={styles.charBox}>
            <Text style={styles.charText}>{char}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>
        Comparte este código con tu rival para que se una
      </Text>

      {/* Animated dots */}
      <View style={styles.dotsRow}>
        {dotOpacity.map((anim, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { opacity: anim }]}
          />
        ))}
      </View>

      {/* Player info */}
      <View style={styles.playerInfo}>
        <View style={[styles.playerBadge, { borderColor: COLORS.cyan }]}>
          <Text style={styles.playerBadgeSymbol}>○</Text>
          <Text style={[styles.playerBadgeLabel, { color: COLORS.cyan }]}>JUGADOR 1 · TÚ</Text>
        </View>
        <View style={[styles.playerBadge, styles.playerBadgeWait]}>
          <Text style={styles.playerBadgeSymbol}>✕</Text>
          <Text style={styles.playerBadgeLabelWait}>JUGADOR 2 · ESPERANDO...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
  },
  gridDecor: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 90,
    opacity: 0.08,
    gap: 0,
  },
  gridCell: {
    width: 30,
    height: 30,
    borderWidth: 0.5,
    borderColor: COLORS.cyan,
  },
  gridCellCenter: {
    backgroundColor: COLORS.cyan,
  },
  badge: {
    backgroundColor: 'rgba(0,212,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 36,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.cyan,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.gray,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  charBox: {
    width: 44,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,212,255,0.05)',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  charText: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'Courier New',
    color: COLORS.cyan,
  },
  hint: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 240,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cyan,
  },
  playerInfo: {
    width: '100%',
    gap: 10,
  },
  playerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  playerBadgeWait: {
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.5,
  },
  playerBadgeSymbol: {
    fontSize: 20,
    color: COLORS.gray,
  },
  playerBadgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  playerBadgeLabelWait: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    letterSpacing: 0.5,
  },
});
