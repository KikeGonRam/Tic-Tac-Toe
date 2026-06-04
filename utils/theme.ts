import { Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const BASE_W = 375;
const BASE_H = 812;

export const rs = (n: number) => Math.round((Math.min(W, 430) / BASE_W) * n);
export const hs = (n: number) => Math.round((Math.min(H, 900) / BASE_H) * n);
export const SCREEN = { W, H };

export interface ThemeColors {
  // Backgrounds
  bg: string;
  surface: string;
  surface2: string;
  overlayBg: string;
  cardBg: string;

  // Text
  white: string;       // primary text
  gray: string;        // secondary text
  grayMuted: string;   // muted/disabled

  // Borders
  border: string;
  borderBright: string;

  // Primary — cyan / blue
  cyan: string;
  cyanDim: string;
  cyanGlow: string;
  onCyan: string;      // text color placed on cyan backgrounds

  // Secondary — orange
  orange: string;
  orangeDim: string;
  orangeGlow: string;

  // Accent — gold / amber
  gold: string;
  goldDim: string;
  goldGlow: string;

  // Status
  success: string;
  successGlow: string;
  error: string;
  errorGlow: string;

  // Misc
  glowIntensity: number; // shadow/glow opacity multiplier
}

export const darkColors: ThemeColors = {
  bg:         '#070D1A',
  surface:    '#0D1426',
  surface2:   '#131D35',
  overlayBg:  'rgba(4,8,20,0.93)',
  cardBg:     '#0B1224',

  white:      '#E8F0FF',
  gray:       '#7A8BA8',
  grayMuted:  '#3D4E66',

  border:       'rgba(255,255,255,0.08)',
  borderBright: 'rgba(255,255,255,0.16)',

  cyan:     '#22D3EE',
  cyanDim:  'rgba(34,211,238,0.22)',
  cyanGlow: 'rgba(34,211,238,0.07)',
  onCyan:   '#070D1A',

  orange:     '#FB923C',
  orangeDim:  'rgba(251,146,60,0.22)',
  orangeGlow: 'rgba(251,146,60,0.07)',

  gold:     '#FCD34D',
  goldDim:  'rgba(252,211,77,0.30)',
  goldGlow: 'rgba(252,211,77,0.07)',

  success:     '#4ADE80',
  successGlow: 'rgba(74,222,128,0.12)',
  error:       '#F87171',
  errorGlow:   'rgba(248,113,113,0.12)',

  glowIntensity: 0.70,
};

export const lightColors: ThemeColors = {
  bg:         '#EEF4FF',
  surface:    '#FFFFFF',
  surface2:   '#F3F7FF',
  overlayBg:  'rgba(10,18,40,0.72)',
  cardBg:     '#FFFFFF',

  white:      '#0F172A',
  gray:       '#5A6A85',
  grayMuted:  '#A0AFCA',

  border:       'rgba(15,23,42,0.10)',
  borderBright: 'rgba(15,23,42,0.20)',

  cyan:     '#0284C7',
  cyanDim:  'rgba(2,132,199,0.18)',
  cyanGlow: 'rgba(2,132,199,0.07)',
  onCyan:   '#FFFFFF',

  orange:     '#EA580C',
  orangeDim:  'rgba(234,88,12,0.18)',
  orangeGlow: 'rgba(234,88,12,0.07)',

  gold:     '#D97706',
  goldDim:  'rgba(217,119,6,0.24)',
  goldGlow: 'rgba(217,119,6,0.07)',

  success:     '#16A34A',
  successGlow: 'rgba(22,163,74,0.10)',
  error:       '#DC2626',
  errorGlow:   'rgba(220,38,38,0.10)',

  glowIntensity: 0.20,
};

// Static fallback for non-component contexts (kept for compatibility)
export const COLORS = darkColors;
