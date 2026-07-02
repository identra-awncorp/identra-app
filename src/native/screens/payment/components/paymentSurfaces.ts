import { StyleSheet } from 'react-native';

import { border, shadows } from '../../../theme';

export const paymentSurfaces = StyleSheet.create({
  card: {
    borderWidth: border.hairline,
    ...shadows.subtle,
  },
  hero: {
    borderWidth: border.hairline,
    ...shadows.subtle,
  },
  control: {
    borderWidth: border.hairline,
    ...shadows.subtle,
  },
  sheet: {
    borderWidth: border.hairline,
    ...shadows.subtle,
  },
});
