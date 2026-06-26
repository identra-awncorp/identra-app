import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { AppColors } from '../theme';
import { spacing, typography } from '../theme';

const identraLogo = require('../../assets/images/identra-logo.png');

export function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      accessibilityLabel="Logo Identra"
      resizeMode="contain"
      source={identraLogo}
      style={{ width: size, height: size }}
    />
  );
}

export function AppBrandLogo({
  colors,
  logoSize = 28,
  wordmarkSize = 20,
  vertical = false,
  style,
}: {
  colors: AppColors;
  logoSize?: number;
  wordmarkSize?: number;
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View accessibilityLabel="Identra" style={[styles.brand, vertical && styles.brandVertical, style]}>
      <AppLogo size={logoSize} />
      <Text
        style={[
          styles.wordmark,
          {
            color: colors.text,
            fontSize: wordmarkSize,
            letterSpacing: -wordmarkSize * 0.035,
          },
        ]}
      >
        Identra
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm - 1 },
  brandVertical: { flexDirection: 'column', gap: spacing.md + spacing.xxs },
  wordmark: { fontWeight: typography.weight.black },
});
