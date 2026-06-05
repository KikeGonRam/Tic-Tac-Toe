import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, Animated,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { rs, hs, ThemeColors, nativeDriver } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { Difficulty } from '../hooks/useSinglePlayerGame';
import ScaleBtn from './ScaleBtn';

interface Stats { wins: number; losses: number; draws: number }

interface LobbyScreenProps {
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (code: string) => Promise<void>;
  onStartSolo: (difficulty: Difficulty) => void;
  error: string | null;
  isLoading?: boolean;
  musicButton?: React.ReactNode;
  playerName?: string;
  onNameChange?: (name: string) => void;
  stats?: Stats;
}

type Screen = 'home' | 'multi' | 'join' | 'solo';

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const s = useMemo(() => makeSubHeaderStyles(colors), [colors, width, height]);
  return (
    <View style={s.row}>
      <ScaleBtn onPress={onBack} style={s.backBtn}>
        <Ionicons name="arrow-back-outline" size={rs(20)} color={colors.gray} />
      </ScaleBtn>
      <Text style={s.title}>{title}</Text>
      <View style={s.spacer} />
    </View>
  );
}

const makeSubHeaderStyles = (c: ThemeColors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: hs(22) },
  backBtn: {
    width: rs(36), height: rs(36), borderRadius: rs(18),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border,
  },
  title: { flex: 1, textAlign: 'center', fontSize: rs(11), fontWeight: '800', letterSpacing: 3, color: c.white },
  spacer: { width: rs(36) },
});

export default function LobbyScreen({
  onCreateRoom, onJoinRoom, onStartSolo, error, isLoading,
  musicButton, playerName = '', onNameChange, stats,
}: LobbyScreenProps) {
  const { colors, isDark, toggle } = useTheme();
  const { width, height } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors, width, height]);
  const [screen, setScreen] = useState<Screen>('home');
  const [joinCode, setJoinCode] = useState('');

  const anim = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const navigate = useCallback((to: Screen) => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 0, duration: 110, useNativeDriver: nativeDriver }),
      Animated.timing(slide, { toValue: -10, duration: 110, useNativeDriver: nativeDriver }),
    ]).start(() => {
      setScreen(to);
      slide.setValue(14);
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: nativeDriver }),
        Animated.spring(slide, { toValue: 0, tension: 120, friction: 14, useNativeDriver: nativeDriver }),
      ]).start();
    });
  }, []);

  const handleJoin = () => {
    if (joinCode.trim().length === 6) onJoinRoom(joinCode.trim());
  };

  const totalGames = (stats?.wins ?? 0) + (stats?.losses ?? 0) + (stats?.draws ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top row: music + theme toggle */}
        <View style={s.topRow}>
          <ScaleBtn onPress={toggle} style={s.topBtn}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={rs(20)}
              color={colors.gray}
            />
          </ScaleBtn>
          {musicButton && <View>{musicButton}</View>}
        </View>

        {/* Hero */}
        <View style={s.heroSection}>
          <View style={s.badge}>
            <Text style={s.badgeText}>MULTIJUGADOR EN TIEMPO REAL</Text>
          </View>
          <Text style={s.mainTitle}>TIC</Text>
          <View style={s.titleRow}>
            <View style={s.oSymbol}><Text style={s.oText}>○</Text></View>
            <Text style={s.dashTitle}>—</Text>
            <View style={s.xSymbol}><Text style={s.xText}>✕</Text></View>
          </View>
          <Text style={s.mainTitle}>TAC TOE</Text>
          <Text style={s.subtitle}>5 RONDAS · 2 DISPOSITIVOS · 1 CAMPEÓN</Text>
        </View>

        {screen === 'home' && (
          <View style={s.nameSection}>
            <Ionicons name="person-outline" size={rs(14)} color={colors.cyan} />
            <TextInput
              style={s.nameInput}
              value={playerName}
              onChangeText={onNameChange}
              placeholder="Tu nombre"
              placeholderTextColor={colors.cyanDim}
              maxLength={12}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        )}

        <View style={s.decorGrid}>
          {['○', '✕', '○'].map((sym, i) => (
            <View key={i} style={[s.decorCell, i === 1 && s.decorCellFilled]}>
              <Text style={i === 1 ? s.decorX : s.decorO}>{sym}</Text>
            </View>
          ))}
        </View>

        <Animated.View style={[s.contentArea, { opacity: anim, transform: [{ translateY: slide }] }]}>

          {screen === 'home' && (
            <View style={s.optionsSection}>
              <ScaleBtn style={[s.optionBtn, s.optionSolo]} onPress={() => navigate('solo')}>
                <Ionicons name="hardware-chip-outline" size={rs(26)} color={colors.gold} />
                <View style={s.optionTextGroup}>
                  <Text style={[s.optionTitle, { color: colors.gold }]}>MODO SOLO</Text>
                  <Text style={s.optionDesc}>Juega contra la IA</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={rs(16)} color={colors.gold} style={{ opacity: 0.5 }} />
              </ScaleBtn>

              <ScaleBtn style={[s.optionBtn, s.optionMulti]} onPress={() => navigate('multi')}>
                <Ionicons name="game-controller-outline" size={rs(26)} color={colors.cyan} />
                <View style={s.optionTextGroup}>
                  <Text style={[s.optionTitle, { color: colors.cyan }]}>MULTIJUGADOR</Text>
                  <Text style={s.optionDesc}>2 dispositivos en tiempo real</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={rs(16)} color={colors.cyan} style={{ opacity: 0.5 }} />
              </ScaleBtn>
            </View>
          )}

          {screen === 'solo' && (
            <View style={s.subSection}>
              <SubHeader title="DIFICULTAD" onBack={() => navigate('home')} />
              <View style={s.diffRow}>
                <ScaleBtn style={[s.diffBtn, s.diffEasy]} onPress={() => onStartSolo('easy')}>
                  <Ionicons name="happy-outline" size={rs(36)} color={colors.success} />
                  <Text style={[s.diffTitle, { color: colors.success }]}>FÁCIL</Text>
                  <Text style={s.diffDesc}>IA aleatoria</Text>
                </ScaleBtn>
                <ScaleBtn style={[s.diffBtn, s.diffHard]} onPress={() => onStartSolo('hard')}>
                  <Ionicons name="skull-outline" size={rs(36)} color={colors.error} />
                  <Text style={[s.diffTitle, { color: colors.error }]}>DIFÍCIL</Text>
                  <Text style={s.diffDesc}>IA Minimax</Text>
                </ScaleBtn>
              </View>
            </View>
          )}

          {screen === 'multi' && (
            <View style={s.subSection}>
              <SubHeader title="MULTIJUGADOR" onBack={() => navigate('home')} />

              <ScaleBtn style={[s.optionBtn, s.optionCreate]} onPress={onCreateRoom} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={colors.onCyan} /> : (
                  <>
                    <Ionicons name="add-circle-outline" size={rs(26)} color={colors.onCyan} />
                    <View style={s.optionTextGroup}>
                      <Text style={[s.optionTitle, { color: colors.onCyan }]}>CREAR SALA</Text>
                      <Text style={[s.optionDesc, { color: colors.onCyan, opacity: 0.65 }]}>
                        Genera un código y compártelo
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={rs(16)} color={colors.onCyan} style={{ opacity: 0.4 }} />
                  </>
                )}
              </ScaleBtn>

              <ScaleBtn style={[s.optionBtn, s.optionJoin]} onPress={() => navigate('join')} disabled={isLoading}>
                <Ionicons name="enter-outline" size={rs(26)} color={colors.orange} />
                <View style={s.optionTextGroup}>
                  <Text style={[s.optionTitle, { color: colors.orange }]}>UNIRSE A SALA</Text>
                  <Text style={s.optionDesc}>Ingresa el código del rival</Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={rs(16)} color={colors.orange} style={{ opacity: 0.5 }} />
              </ScaleBtn>
            </View>
          )}

          {screen === 'join' && (
            <View style={s.subSection}>
              <SubHeader title="UNIRSE A SALA" onBack={() => navigate('multi')} />
              <Text style={s.joinLabel}>CÓDIGO DE SALA</Text>
              <TextInput
                style={s.codeInput}
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX"
                placeholderTextColor={colors.orangeDim}
                maxLength={6}
                autoCapitalize="characters"
                autoFocus
              />
              <Text style={s.codeHint}>{joinCode.length}/6 caracteres</Text>
              <ScaleBtn
                style={[s.joinBtn, joinCode.length !== 6 && s.joinBtnDisabled]}
                onPress={handleJoin}
                disabled={joinCode.length !== 6 || isLoading}
              >
                <View style={s.joinBtnInner}>
                  {isLoading ? (
                    <ActivityIndicator color={colors.onCyan} />
                  ) : (
                    <>
                      <Text style={s.joinBtnText}>ENTRAR</Text>
                      <Ionicons name="arrow-forward-outline" size={rs(16)} color={colors.onCyan} />
                    </>
                  )}
                </View>
              </ScaleBtn>
            </View>
          )}

        </Animated.View>

        {error && (
          <View style={s.errorBox}>
            <Ionicons name="warning-outline" size={rs(14)} color={colors.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {totalGames > 0 && (
          <View style={s.statsBox}>
            <Text style={s.statsTitle}>ESTA SESIÓN</Text>
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: colors.success }]}>{stats!.wins}</Text>
                <Text style={s.statLabel}>VICTORIAS</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: colors.gold }]}>{stats!.draws}</Text>
                <Text style={s.statLabel}>EMPATES</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: colors.error }]}>{stats!.losses}</Text>
                <Text style={s.statLabel}>DERROTAS</Text>
              </View>
            </View>
          </View>
        )}

        <View style={s.rulesBox}>
          <View style={s.rulesHeader}>
            <Ionicons name="information-circle-outline" size={rs(14)} color={colors.gold} />
            <Text style={s.rulesTitle}>REGLAS</Text>
          </View>
          <Text style={s.ruleItem}>● Jugador 1 juega con ○ · Jugador 2 / IA con ✕</Text>
          <Text style={s.ruleItem}>● Se juegan 5 rondas en total</Text>
          <Text style={s.ruleItem}>● Gana quien llegue primero a 3 victorias</Text>
          <Text style={s.ruleItem}>● Tienes 15 segundos por turno</Text>
          <Text style={s.ruleItem}>● En modo difícil la IA usa el algoritmo Minimax</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: {
    paddingHorizontal: rs(24),
    paddingTop: hs(12),
    paddingBottom: hs(40),
    alignItems: 'center',
    minHeight: '100%',
  },
  topRow: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: rs(6), marginBottom: hs(8) },
  topBtn: { padding: rs(8), borderRadius: rs(20) },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: hs(20) },
  badge: {
    backgroundColor: c.cyanGlow, borderWidth: 1, borderColor: c.cyanDim,
    paddingHorizontal: rs(12), paddingVertical: 5,
    borderRadius: 20, marginBottom: hs(14),
  },
  badgeText: { fontSize: rs(9), fontWeight: '800', letterSpacing: 3, color: c.cyan },
  mainTitle: {
    fontSize: rs(44), fontWeight: '900', color: c.white,
    letterSpacing: rs(10), fontFamily: 'Courier New', lineHeight: rs(54),
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(10), marginVertical: rs(6) },
  oSymbol: {
    width: rs(40), height: rs(40), borderRadius: rs(20), borderWidth: 3,
    borderColor: c.cyan, alignItems: 'center', justifyContent: 'center',
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity, shadowRadius: 8, elevation: 8,
  },
  oText: { fontSize: rs(20), color: c.cyan, fontWeight: '300', lineHeight: rs(24) },
  dashTitle: { fontSize: rs(24), color: c.gray },
  xSymbol: {
    width: rs(40), height: rs(40), borderRadius: 10, borderWidth: 3,
    borderColor: c.orange, alignItems: 'center', justifyContent: 'center',
    shadowColor: c.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity, shadowRadius: 8, elevation: 8,
  },
  xText: { fontSize: rs(20), color: c.orange, fontWeight: '900' },
  subtitle: { fontSize: rs(9), fontWeight: '700', letterSpacing: 2, color: c.gray, marginTop: rs(12), textAlign: 'center' },

  // Name input
  nameSection: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: rs(10),
    marginBottom: hs(14), backgroundColor: c.cyanGlow,
    borderWidth: 1, borderColor: c.cyanDim,
    borderRadius: 14, paddingHorizontal: rs(14), paddingVertical: rs(12),
  },
  nameInput: { flex: 1, fontSize: rs(14), fontWeight: '700', color: c.white, padding: 0 },

  // Decor
  decorGrid: { flexDirection: 'row', gap: 8, marginBottom: hs(20), opacity: 0.4 },
  decorCell: {
    width: rs(32), height: rs(32), borderRadius: 8, borderWidth: 1,
    borderColor: c.cyanDim, alignItems: 'center', justifyContent: 'center',
  },
  decorCellFilled: { backgroundColor: c.orangeGlow, borderColor: c.orangeDim },
  decorO: { fontSize: rs(16), color: c.cyan },
  decorX: { fontSize: rs(14), color: c.orange, fontWeight: '900' },

  contentArea: { width: '100%', marginBottom: hs(20) },

  // Home options
  optionsSection: { gap: rs(14) },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: rs(14),
    paddingHorizontal: rs(18), paddingVertical: rs(18), borderRadius: 18, borderWidth: 1.5,
  },
  optionSolo: {
    backgroundColor: c.goldGlow, borderColor: c.gold,
    shadowColor: c.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.35, shadowRadius: 10, elevation: 6,
  },
  optionMulti: {
    backgroundColor: c.cyanGlow, borderColor: c.cyan,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.35, shadowRadius: 10, elevation: 6,
  },
  optionCreate: {
    backgroundColor: c.cyan, borderColor: c.cyan,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.65, shadowRadius: 14, elevation: 10,
  },
  optionJoin: {
    backgroundColor: c.orangeGlow, borderColor: c.orange,
    shadowColor: c.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.35, shadowRadius: 10, elevation: 6,
  },
  optionTextGroup: { flex: 1 },
  optionTitle: { fontSize: rs(13), fontWeight: '900', letterSpacing: 2 },
  optionDesc: { fontSize: rs(11), color: c.gray, marginTop: 2 },

  subSection: { gap: rs(12) },

  // Difficulty
  diffRow: { flexDirection: 'row', gap: rs(14) },
  diffBtn: {
    flex: 1, alignItems: 'center', paddingVertical: rs(26),
    borderRadius: 18, borderWidth: 1.5, gap: rs(10),
  },
  diffEasy: {
    backgroundColor: c.successGlow, borderColor: c.success,
    shadowColor: c.success, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.45, shadowRadius: 12, elevation: 6,
  },
  diffHard: {
    backgroundColor: c.errorGlow, borderColor: c.error,
    shadowColor: c.error, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.45, shadowRadius: 12, elevation: 6,
  },
  diffTitle: { fontSize: rs(13), fontWeight: '900', letterSpacing: 2 },
  diffDesc: { fontSize: rs(10), color: c.gray },

  // Join
  joinLabel: { fontSize: rs(10), fontWeight: '800', letterSpacing: 4, color: c.orange, marginBottom: rs(14), alignSelf: 'flex-start' },
  codeInput: {
    width: '100%', height: rs(60), borderWidth: 2, borderColor: c.orange, borderRadius: 16,
    textAlign: 'center', fontSize: rs(28), fontWeight: '900', fontFamily: 'Courier New',
    color: c.orange, backgroundColor: c.orangeGlow, letterSpacing: 8,
    shadowColor: c.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.45, shadowRadius: 8, elevation: 6,
  },
  codeHint: { fontSize: rs(11), color: c.gray, marginTop: 8, marginBottom: rs(18), alignSelf: 'flex-start' },
  joinBtn: {
    width: '100%', borderRadius: 14, backgroundColor: c.orange,
    shadowColor: c.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.7, shadowRadius: 10, elevation: 8,
  },
  joinBtnDisabled: { opacity: 0.4, shadowOpacity: 0, elevation: 0 },
  joinBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(8), paddingVertical: rs(16),
  },
  joinBtnText: { fontSize: rs(15), fontWeight: '900', color: c.onCyan, letterSpacing: 3 },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8),
    backgroundColor: c.errorGlow, borderWidth: 1, borderColor: c.error,
    borderRadius: 12, paddingHorizontal: rs(16), paddingVertical: rs(12),
    marginBottom: hs(16), width: '100%',
  },
  errorText: { color: c.error, fontSize: rs(13), flex: 1 },

  // Stats
  statsBox: {
    width: '100%', backgroundColor: c.goldGlow,
    borderWidth: 1, borderColor: c.goldDim,
    borderRadius: 16, padding: rs(16), marginBottom: hs(14), alignItems: 'center',
  },
  statsTitle: { fontSize: rs(9), fontWeight: '800', letterSpacing: 3, color: c.gold, marginBottom: rs(12) },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: rs(26), fontWeight: '900', fontFamily: 'Courier New', color: c.white },
  statLabel: { fontSize: rs(8), fontWeight: '700', letterSpacing: 1.5, color: c.gray, marginTop: 3 },
  statDivider: { width: 1, height: rs(32), backgroundColor: c.border },

  // Rules
  rulesBox: {
    width: '100%', backgroundColor: c.surface, borderWidth: 1,
    borderColor: c.border, borderRadius: 16, padding: rs(16), gap: 8,
  },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginBottom: 8 },
  rulesTitle: { fontSize: rs(10), fontWeight: '800', letterSpacing: 3, color: c.gold },
  ruleItem: { fontSize: rs(11), color: c.gray, lineHeight: rs(20) },
});
