import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { assetManifest } from '../assets/assetManifest';
import { useI18n } from '../i18n';
import type { AppColors } from '../theme';
import { spacing, typography } from '../theme';

const identraLogo = assetManifest.app.identraLogo;

export function AppLogo({ size = 32 }: { size?: number }) {
  const { t } = useI18n();

  return (
    <Image
      accessibilityLabel={t('app.logo.accessibility')}
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
  const { t } = useI18n();

  return (
    <View accessibilityLabel={t('app.logo.brandAccessibility')} style={[styles.brand, vertical && styles.brandVertical, style]}>
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
