// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#050A1E' }}>
      <StatusBar style="light" backgroundColor="#050A1E" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050A1E' },
          animation: 'fade',
        }}
      />
    </View>
  );
}
