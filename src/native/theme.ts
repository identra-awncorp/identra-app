import { Platform, StyleSheet } from 'react-native';

export const lightColors = {
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F4FB',
  text: '#11172F',
  textSecondary: '#596684',
  border: '#E5E9F2',
  primary: '#5B6CFF',
  primaryDark: '#355CFF',
  success: '#12B76A',
  warning: '#F57900',
  danger: '#FF3D47',
  purple: '#9747FF',
  overlay: 'rgba(11, 15, 26, 0.78)',
};

export const darkColors = {
  background: '#0B0F1A',
  surface: '#111827',
  surfaceMuted: '#1F2937',
  text: '#F4F6FB',
  textSecondary: '#A5AFC4',
  border: '#374151',
  primary: '#7C8CFF',
  primaryDark: '#6B7BFF',
  success: '#22C55E',
  warning: '#FB923C',
  danger: '#FB7185',
  purple: '#B986FF',
  overlay: 'rgba(0, 0, 0, 0.82)',
};

export type AppColors = typeof lightColors;

export const shadows = StyleSheet.create({
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

export const font = {
  screenTitle: 28,
  sectionTitle: 20,
  cardTitle: 16,
  body: 16,
  compact: 14,
  meta: 12,
};
