// components/LobbyScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS } from '../utils/theme';

interface LobbyScreenProps {
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (code: string) => Promise<void>;
  error: string | null;
  isLoading?: boolean;
}

export default function LobbyScreen({ onCreateRoom, onJoinRoom, error, isLoading }: LobbyScreenProps) {
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'select' | 'join'>('select');

  const handleJoin = () => {
    if (joinCode.trim().length === 6) {
      onJoinRoom(joinCode.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Title */}
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MULTIJUGADOR EN TIEMPO REAL</Text>
          </View>
          <Text style={styles.mainTitle}>TIC</Text>
          <View style={styles.titleRow}>
            <View style={styles.oSymbol}>
              <Text style={styles.oText}>○</Text>
            </View>
            <Text style={styles.dashTitle}>—</Text>
            <View style={styles.xSymbol}>
              <Text style={styles.xText}>✕</Text>
            </View>
          </View>
          <Text style={styles.mainTitle}>TAC TOE</Text>
          <Text style={styles.subtitle}>5 RONDAS · 2 DISPOSITIVOS · 1 CAMPEÓN</Text>
        </View>

        {/* Decorative grid */}
        <View style={styles.decorGrid}>
          <View style={styles.decorCell}>
            <Text style={styles.decorO}>○</Text>
          </View>
          <View style={[styles.decorCell, styles.decorCellFilled]}>
            <Text style={styles.decorX}>✕</Text>
          </View>
          <View style={styles.decorCell}>
            <Text style={styles.decorO}>○</Text>
          </View>
        </View>

        {/* Mode selector */}
        {mode === 'select' && (
          <View style={styles.optionsSection}>
            {/* Create Room */}
            <TouchableOpacity
              style={[styles.optionBtn, styles.optionCreate]}
              onPress={onCreateRoom}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#050A1E" />
              ) : (
                <>
                  <Text style={styles.optionIcon}>⊕</Text>
                  <View>
                    <Text style={styles.optionTitle}>CREAR SALA</Text>
                    <Text style={styles.optionDesc}>Genera un código y compártelo</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* Join Room */}
            <TouchableOpacity
              style={[styles.optionBtn, styles.optionJoin]}
              onPress={() => setMode('join')}
              disabled={isLoading}
            >
              <Text style={styles.optionIconJ}>⊞</Text>
              <View>
                <Text style={[styles.optionTitle, { color: COLORS.orange }]}>UNIRSE A SALA</Text>
                <Text style={styles.optionDesc}>Ingresa el código del rival</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Join form */}
        {mode === 'join' && (
          <View style={styles.joinSection}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setMode('select')}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.joinLabel}>CÓDIGO DE SALA</Text>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase().slice(0, 6))}
              placeholder="XXXXXX"
              placeholderTextColor="rgba(255,107,53,0.3)"
              maxLength={6}
              autoCapitalize="characters"
              keyboardType="default"
              autoFocus
            />
            <Text style={styles.codeHint}>{joinCode.length}/6 caracteres</Text>
            <TouchableOpacity
              style={[
                styles.joinBtn,
                joinCode.length !== 6 && styles.joinBtnDisabled,
              ]}
              onPress={handleJoin}
              disabled={joinCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#050A1E" />
              ) : (
                <Text style={styles.joinBtnText}>ENTRAR →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {/* Rules */}
        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>REGLAS</Text>
          <Text style={styles.ruleItem}>● Jugador 1 juega con ○ · Jugador 2 con ✕</Text>
          <Text style={styles.ruleItem}>● Se juegan 5 rondas en total</Text>
          <Text style={styles.ruleItem}>● Gana quien llegue primero a 3 victorias</Text>
          <Text style={styles.ruleItem}>● Si al final de la Ronda 5 hay empate, gana el último en ganar</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    minHeight: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.cyan,
  },
  mainTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 12,
    fontFamily: 'Courier New',
    lineHeight: 60,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  oSymbol: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  oText: {
    fontSize: 24,
    color: COLORS.cyan,
    fontWeight: '300',
    lineHeight: 28,
  },
  dashTitle: {
    fontSize: 28,
    color: COLORS.gray,
  },
  xSymbol: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  xText: {
    fontSize: 22,
    color: COLORS.orange,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.gray,
    marginTop: 12,
    textAlign: 'center',
  },
  decorGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    opacity: 0.4,
  },
  decorCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCellFilled: {
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderColor: 'rgba(255,107,53,0.3)',
  },
  decorO: { fontSize: 18, color: COLORS.cyan },
  decorX: { fontSize: 16, color: COLORS.orange, fontWeight: '900' },
  optionsSection: {
    width: '100%',
    gap: 14,
    marginBottom: 24,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  optionCreate: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  optionJoin: {
    backgroundColor: 'rgba(255,107,53,0.06)',
    borderColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  optionIcon: {
    fontSize: 28,
    color: '#050A1E',
    fontWeight: '300',
  },
  optionIconJ: {
    fontSize: 28,
    color: COLORS.orange,
    fontWeight: '300',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#050A1E',
    letterSpacing: 2,
  },
  optionDesc: {
    fontSize: 11,
    color: 'rgba(5,10,30,0.6)',
    marginTop: 2,
  },
  joinSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  joinLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.orange,
    marginBottom: 12,
  },
  codeInput: {
    width: '100%',
    height: 64,
    borderWidth: 2,
    borderColor: COLORS.orange,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'Courier New',
    color: COLORS.orange,
    backgroundColor: 'rgba(255,107,53,0.05)',
    letterSpacing: 8,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  codeHint: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 6,
    marginBottom: 16,
  },
  joinBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  joinBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#050A1E',
    letterSpacing: 3,
  },
  errorBox: {
    backgroundColor: 'rgba(255,68,102,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,102,0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#FF4466',
    fontSize: 13,
    textAlign: 'center',
  },
  rulesBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  rulesTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    color: COLORS.gold,
    marginBottom: 8,
  },
  ruleItem: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
  },
});
