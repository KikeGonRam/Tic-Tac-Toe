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

        // Create the sound without autoplay first
        const { sound } = await Audio.Sound.createAsync(
          MUSIC_ASSET,
          { isLooping: true, volume: 0.6, shouldPlay: false }
        );

        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        setAvailable(true);

        // Try autoplay — may be blocked by browser on web (expected, silent)
        try {
          await sound.playAsync();
          setIsPlaying(true);
        } catch {
          // Browser autoplay blocked until user interaction — button still shows
        }
      } catch {
        // Sound file unavailable
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
    } catch {}
  }, []);

  return { isPlaying, available, toggle };
}
