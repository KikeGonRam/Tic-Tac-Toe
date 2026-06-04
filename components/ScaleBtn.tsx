import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';

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
      Animated.spring(scale, { toValue: 0.95, speed: 80, bounciness: 0, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.85, duration: 80, useNativeDriver: true }),
    ]).start();

  const pressOut = () =>
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, speed: 60, bounciness: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

  return (
    <TouchableWithoutFeedback
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
