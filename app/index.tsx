// app/index.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';
import LobbyScreen from '../components/LobbyScreen';
import WaitingScreen from '../components/WaitingScreen';
import GameScreen from '../components/GameScreen';
import { COLORS } from '../utils/theme';

export default function Index() {
  const {
    gameState,
    myRole,
    roomCode,
    isConnected,
    error,
    createRoom,
    joinRoom,
    makeMove,
    nextRound,
    resetGame,
    leaveRoom,
    isMyTurn,
    winningCombo,
  } = useMultiplayerGame();

  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    await createRoom();
    setIsLoading(false);
  };

  const handleJoin = async (code: string) => {
    setIsLoading(true);
    await joinRoom(code);
    setIsLoading(false);
  };

  // No room yet → Lobby
  if (!roomCode || !myRole) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <LobbyScreen
          onCreateRoom={handleCreate}
          onJoinRoom={handleJoin}
          error={error}
          isLoading={isLoading}
        />
      </SafeAreaView>
    );
  }

  // Waiting for second player
  if (!gameState || gameState.phase === 'waiting') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <WaitingScreen roomCode={roomCode} />
      </SafeAreaView>
    );
  }

  // Active game
  return (
    <GameScreen
      gameState={gameState}
      myRole={myRole}
      isMyTurn={isMyTurn}
      winningCombo={winningCombo}
      roomCode={roomCode}
      onMove={makeMove}
      onNextRound={nextRound}
      onReset={resetGame}
      onLeave={leaveRoom}
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
