import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, darkColors, lightColors } from './theme';

interface ThemeCtx {
  colors: ThemeColors;
  isDark: boolean;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ colors: darkColors, isDark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [isDark, setIsDark] = useState(scheme !== 'light');

  useEffect(() => {
    setIsDark(scheme !== 'light');
  }, [scheme]);

  return (
    <Ctx.Provider value={{ colors: isDark ? darkColors : lightColors, isDark, toggle: () => setIsDark(d => !d) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
