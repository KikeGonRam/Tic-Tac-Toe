import { Stack } from 'expo-router';
import { View, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../utils/ThemeContext';

// Suppress web-only deprecation warnings that don't affect mobile behavior.
// shadow* props work correctly on Android/iOS; expo-av is functional in SDK 56.
if (Platform.OS === 'web') {
  const _warn = console.warn.bind(console);
  console.warn = (...args: any[]) => {
    const m = String(args[0] ?? '');
    if (m.includes('"shadow*"') || m.includes('Expo AV has been deprecated')) return;
    _warn(...args);
  };
}

const MAX_WEB_WIDTH = 430;

function LayoutInner() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > MAX_WEB_WIDTH;
  return (
    <View style={{ flex: 1, backgroundColor: isWide ? '#000' : colors.bg, alignItems: isWide ? 'center' : undefined }}>
      <View style={{ flex: 1, width: isWide ? MAX_WEB_WIDTH : '100%', backgroundColor: colors.bg }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
          }}
        />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LayoutInner />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
