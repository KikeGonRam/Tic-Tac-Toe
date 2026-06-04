import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';

const MUSIC_ASSET = require('../assets/music/background.mp3');

export function useBackgroundMusic() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          MUSIC_ASSET,
          { isLooping: true, volume: 0.6, shouldPlay: true }
        );

        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        setAvailable(true);
        setIsPlaying(true);
      } catch (e) {
        console.warn('[Music] Failed to load:', e);
      }
    }

    load();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  const toggle = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('[Music] Toggle error:', e);
    }
  }, []);

  return { isPlaying, available, toggle };
}
