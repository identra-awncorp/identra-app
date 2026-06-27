import { Platform, StyleSheet } from 'react-native';

export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  navy: {
    900: '#0B0F1A',
    800: '#11172F',
    700: '#1F2937',
    600: '#263856',
  },
  slate: {
    700: '#42516E',
    600: '#596684',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#A5AFC4',
  },
  blue: {
    700: '#355CFF',
    600: '#4A5AF0',
    500: '#5B6CFF',
    400: '#60A5FA',
    300: '#8F9BFF',
    100: '#EEF3FF',
  },
  green: {
    600: '#12B76A',
    500: '#22C55E',
    100: '#EAFDF4',
  },
  orange: {
    500: '#F57900',
    400: '#FB923C',
    100: '#FFF3E8',
  },
  red: {
    500: '#FF3D47',
    400: '#FB7185',
    100: '#FFF0F1',
  },
  purple: {
    500: '#9747FF',
    400: '#B986FF',
    100: '#F4ECFF',
  },
  gray: {
    50: '#F7F8FC',
    100: '#F1F4FB',
    200: '#E5E9F2',
    300: '#E5E7EB',
    700: '#374151',
    800: '#1F2937',
  },
} as const;

export type ThemeColorScheme = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryDark: string;
  primaryHover: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  purple: string;
  gradientStart: string;
  gradientEnd: string;
  overlay: string;
};

export const lightColors: ThemeColorScheme = {
  background: palette.gray[50],
  surface: palette.white,
  surfaceMuted: palette.gray[100],
  surfaceElevated: palette.white,
  text: palette.navy[800],
  textSecondary: palette.slate[600],
  border: '#EEF2F7',
  primary: palette.blue[500],
  primaryDark: palette.blue[700],
  primaryHover: palette.blue[600],
  secondary: palette.blue[300],
  success: palette.green[600],
  warning: palette.orange[500],
  danger: palette.red[500],
  purple: palette.purple[500],
  gradientStart: palette.blue[500],
  gradientEnd: palette.blue[400],
  overlay: 'rgba(11, 15, 26, 0.78)',
};

export const darkColors: ThemeColorScheme = {
  background: palette.navy[900],
  surface: palette.gray[800],
  surfaceMuted: palette.gray[700],
  surfaceElevated: palette.navy[800],
  text: '#F4F6FB',
  textSecondary: palette.slate[300],
  border: 'rgba(165, 175, 196, 0.18)',
  primary: '#7C8CFF',
  primaryDark: '#6B7BFF',
  primaryHover: '#6B7BFF',
  secondary: palette.blue[300],
  success: palette.green[500],
  warning: palette.orange[400],
  danger: palette.red[400],
  purple: palette.purple[400],
  gradientStart: palette.blue[500],
  gradientEnd: '#3B82F6',
  overlay: 'rgba(0, 0, 0, 0.82)',
};

export type AppColors = ThemeColorScheme;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
} as const;

export const border = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  medium: 1.5,
  thick: 2,
} as const;

export const typography = {
  family: {
    base: 'Inter',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  lineHeight: {
    xs: 17,
    sm: 20,
    md: 23,
    lg: 28,
    xl: 36,
    xxl: 44,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },
} as const;

export const font = {
  screenTitle: typography.size.xl,
  sectionTitle: typography.size.lg,
  cardTitle: typography.size.md,
  body: typography.size.md,
  compact: typography.size.sm,
  meta: typography.size.xs,
} as const;

export const layout = {
  minWidth: 320,
  referenceWidth: 390,
  maxWidth: 430,
  screenPadding: spacing.lg,
  wideScreenPadding: spacing.xl,
  sectionGap: spacing.xl,
  relatedItemGap: spacing.md,
  bottomNavHeight: 72,
  appBarHeight: 56,
} as const;

export const touchTarget = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

export const motion = {
  pressMs: 120,
  feedbackMs: 180,
  screenMs: 250,
  sheetMs: 250,
} as const;

export const componentSize = {
  buttonHeight: 48,
  secondaryButtonHeight: 44,
  inputHeight: 48,
  listItemMinHeight: 56,
  cardMinRadius: radius.lg,
  cardMaxRadius: radius.xl,
} as const;

export const shadows = StyleSheet.create({
  subtle: Platform.select({
    ios: {
      shadowColor: '#27375F',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.025,
      shadowRadius: 5,
    },
    android: { elevation: 0 },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#27375F',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
    android: { elevation: 3 },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#27375F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.13,
      shadowRadius: 18,
    },
    android: { elevation: 7 },
    default: {},
  }),
});

export const theme = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  palette,
  spacing,
  radius,
  border,
  typography,
  font,
  layout,
  touchTarget,
  iconSize,
  motion,
  componentSize,
  shadows,
} as const;
