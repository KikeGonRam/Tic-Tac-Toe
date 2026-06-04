import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScaleBtn from '../components/ScaleBtn';
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';
import { useSinglePlayerGame } from '../hooks/useSinglePlayerGame';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { useTheme } from '../utils/ThemeContext';
import { Difficulty } from '../hooks/useSinglePlayerGame';
import { rs } from '../utils/theme';
import LobbyScreen from '../components/LobbyScreen';
import WaitingScreen from '../components/WaitingScreen';
import GameScreen from '../components/GameScreen';

type AppMode = 'lobby' | 'multiplayer' | 'solo';

interface Stats {
  wins: number;
  losses: number;
  draws: number;
}

export default function Index() {
  const { colors, isDark } = useTheme();
  const [appMode, setAppMode] = useState<AppMode>('lobby');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isLoading, setIsLoading] = useState(false);
  const [playerName, setPlayerName] = useState('Jugador');
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, draws: 0 });

  const multi = useMultiplayerGame();
  const solo = useSinglePlayerGame(difficulty);
  const music = useBackgroundMusic();

  const soloResultCounted = useRef(false);
  useEffect(() => {
    if (appMode !== 'solo') return;
    if (
      solo.gameState.phase === 'playing' &&
      solo.gameState.round === 1 &&
      solo.gameState.scores.player1 === 0 &&
      solo.gameState.scores.player2 === 0
    ) {
      soloResultCounted.current = false;
    }
    if (solo.gameState.phase === 'game_over' && !soloResultCounted.current) {
      soloResultCounted.current = true;
      const w = solo.gameState.gameWinner;
      setStats(prev => ({
        wins:   prev.wins   + (w === 'player1' ? 1 : 0),
        losses: prev.losses + (w === 'player2' ? 1 : 0),
        draws:  prev.draws  + (w === null ? 1 : 0),
      }));
    }
  }, [solo.gameState.phase, solo.gameState.round, solo.gameState.scores, appMode]);

  const handleCreate = async () => {
    setIsLoading(true);
    await multi.createRoom();
    setIsLoading(false);
    setAppMode('multiplayer');
  };

  const handleJoin = async (code: string) => {
    setIsLoading(true);
    await multi.joinRoom(code);
    setIsLoading(false);
    setAppMode('multiplayer');
  };

  const handleStartSolo = (diff: Difficulty) => {
    setDifficulty(diff);
    solo.resetGame();
    soloResultCounted.current = false;
    setAppMode('solo');
  };

  const handleLeaveSolo = () => {
    solo.resetGame();
    setAppMode('lobby');
  };

  const handleLeaveMulti = () => {
    multi.leaveRoom();
    setAppMode('lobby');
  };

  const musicButton = music.available ? (
    <ScaleBtn onPress={music.toggle} style={{ padding: rs(8), borderRadius: rs(20) }}>
      <Ionicons
        name={music.isPlaying ? 'volume-high' : 'volume-mute'}
        size={rs(22)}
        color={music.isPlaying ? colors.cyan : colors.gray}
      />
    </ScaleBtn>
  ) : null;

  if (appMode === 'solo') {
    return (
      <GameScreen
        gameState={solo.gameState}
        myRole="player1"
        isMyTurn={solo.isMyTurn}
        winningCombo={solo.winningCombo}
        roomCode={null}
        onMove={solo.makeMove}
        onNextRound={solo.nextRound}
        onReset={() => {
          soloResultCounted.current = false;
          solo.resetGame();
        }}
        onLeave={handleLeaveSolo}
        isAIThinking={solo.isAIThinking}
        musicButton={musicButton}
        playerName={playerName}
      />
    );
  }

  if (appMode === 'multiplayer') {
    if (!multi.gameState || multi.gameState.phase === 'waiting') {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
          <WaitingScreen roomCode={multi.roomCode ?? ''} />
        </SafeAreaView>
      );
    }
    return (
      <GameScreen
        gameState={multi.gameState}
        myRole={multi.myRole ?? 'player1'}
        isMyTurn={multi.isMyTurn}
        winningCombo={multi.winningCombo}
        roomCode={multi.roomCode}
        onMove={multi.makeMove}
        onNextRound={multi.nextRound}
        onReset={multi.resetGame}
        onLeave={handleLeaveMulti}
        musicButton={musicButton}
        playerName={playerName}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <LobbyScreen
        onCreateRoom={handleCreate}
        onJoinRoom={handleJoin}
        onStartSolo={handleStartSolo}
        error={multi.error}
        isLoading={isLoading}
        musicButton={musicButton}
        playerName={playerName}
        onNameChange={setPlayerName}
        stats={stats}
      />
    </SafeAreaView>
  );
}
