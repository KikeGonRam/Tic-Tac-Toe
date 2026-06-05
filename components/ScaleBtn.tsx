import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { nativeDriver } from '../utils/theme';

interface Props {
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function ScaleBtn({ onPress, style, disabled = false, children }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.95, speed: 80, bounciness: 0, useNativeDriver: nativeDriver }),
      Animated.timing(opacity, { toValue: 0.85, duration: 80, useNativeDriver: nativeDriver }),
    ]).start();

  const pressOut = () =>
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, speed: 60, bounciness: 6, useNativeDriver: nativeDriver }),
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: nativeDriver }),
    ]).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      android_ripple={null}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
