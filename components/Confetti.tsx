import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { nativeDriver } from '../utils/theme';

const PALETTE = ['#00D4FF', '#FF6B35', '#FFD700', '#00FF88', '#FF4466', '#C084FC', '#FFFFFF'];
const COUNT = 55;

interface Particle {
  x: number;
  aY: Animated.Value;
  aOp: Animated.Value;
  aRot: Animated.Value;
  color: string;
  w: number;
  h: number;
  isCircle: boolean;
  delay: number;
  dur: number;
}

export default function Confetti({ active }: { active: boolean }) {
  const { width, height } = useWindowDimensions();

  const particles = useRef<Particle[]>(
    Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random() * width,
      aY: new Animated.Value(0),
      aOp: new Animated.Value(0),
      aRot: new Animated.Value(0),
      color: PALETTE[i % PALETTE.length],
      w: 7 + Math.random() * 8,
      h: 8 + Math.random() * 6,
      isCircle: Math.random() > 0.45,
      delay: Math.random() * 700,
      dur: 1700 + Math.random() * 1200,
    }))
  ).current;

  useEffect(() => {
    if (!active) return;

    particles.forEach(p => {
      p.aY.setValue(0);
      p.aOp.setValue(0);
      p.aRot.setValue(0);

      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.aY, { toValue: height + 40, duration: p.dur, useNativeDriver: nativeDriver }),
          Animated.timing(p.aRot, { toValue: 6 + Math.random() * 4, duration: p.dur, useNativeDriver: nativeDriver }),
          Animated.sequence([
            Animated.timing(p.aOp, { toValue: 1, duration: 120, useNativeDriver: nativeDriver }),
            Animated.delay(p.dur - 550),
            Animated.timing(p.aOp, { toValue: 0, duration: 430, useNativeDriver: nativeDriver }),
          ]),
        ]),
      ]).start();
    });
  }, [active, height]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const spin = p.aRot.interpolate({ inputRange: [0, 10], outputRange: ['0deg', '900deg'] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: -20,
              width: p.w,
              height: p.h,
              borderRadius: p.isCircle ? p.w / 2 : 2,
              backgroundColor: p.color,
              opacity: p.aOp,
              transform: [{ translateY: p.aY }, { rotate: spin }],
            }}
          />
        );
      })}
    </View>
  );
}
