import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

const ASSETS = {
  tap:  require('../assets/sounds/tap.wav'),
  win:  require('../assets/sounds/win.wav'),
  lose: require('../assets/sounds/lose.wav'),
  draw: require('../assets/sounds/draw.wav'),
};

type SoundKey = keyof typeof ASSETS;

export function useSoundEffects() {
  const sounds = useRef<Partial<Record<SoundKey, Audio.Sound>>>({});

  useEffect(() => {
    const keys = Object.keys(ASSETS) as SoundKey[];
    keys.forEach(async key => {
      try {
        const { sound } = await Audio.Sound.createAsync(ASSETS[key], { shouldPlay: false, volume: 0.9 });
        sounds.current[key] = sound;
      } catch {}
    });
    return () => {
      Object.values(sounds.current).forEach(s => s?.unloadAsync().catch(() => {}));
    };
  }, []);

  const play = useCallback((key: SoundKey) => {
    const s = sounds.current[key];
    if (!s) return;
    s.setPositionAsync(0).then(() => s.playAsync()).catch(() => {});
  }, []);

  return {
    playTap:  () => play('tap'),
    playWin:  () => play('win'),
    playLose: () => play('lose'),
    playDraw: () => play('draw'),
  };
}
