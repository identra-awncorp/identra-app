import { ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import type { AppColors } from '../theme';
import { border, radius, spacing, typography } from '../theme';

interface Props {
  colors: AppColors;
  description?: string;
  title?: string;
  visible: boolean;
}

export function LoadingOverlay({
  colors,
  description,
  title,
  visible,
}: Props) {
  const { t } = useI18n();
  const overlayTitle = title ?? t('loadingOverlay.title');
  const overlayDescription = description ?? t('loadingOverlay.description');
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!visible) {
      rotation.setValue(0);
      pulse.setValue(0.88);
      return;
    }

    const rotateAnimation = Animated.loop(
      Animated.timing(rotation, {
        duration: 1050,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.88,
          useNativeDriver: true,
        }),
      ]),
    );

    rotateAnimation.start();
    pulseAnimation.start();
    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, [pulse, rotation, visible]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        accessibilityLabel={`${overlayTitle}. ${overlayDescription}`}
        accessibilityLiveRegion="assertive"
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
        nativeID="loading-overlay"
        testID="loading-overlay"
        style={[styles.root, { backgroundColor: colors.overlay }]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.loader}>
            <Animated.View style={[styles.loaderRing, { borderColor: `${colors.primaryDark}24`, transform: [{ rotate: spin }] }]}>
              <View style={[styles.loaderAccent, { borderTopColor: colors.primaryDark, borderRightColor: colors.primaryDark }]} />
            </Animated.View>
            <Animated.View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: `${colors.primaryDark}12`,
                  borderColor: `${colors.primaryDark}26`,
                  opacity: pulse,
                  transform: [{ scale: pulse }],
                },
              ]}
            >
              <ShieldCheck color={colors.primaryDark} size={30} strokeWidth={1.9} />
            </Animated.View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{overlayTitle}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{overlayDescription}</Text>

          <View style={[styles.notice, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <ShieldCheck color={colors.primaryDark} size={18} strokeWidth={1.9} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{t('loadingOverlay.keepOpen')}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  card: {
    width: '100%',
    maxWidth: 318,
    borderWidth: border.thin,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    shadowColor: '#07102A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 12,
  },
  loader: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  loaderRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderWidth: 3,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderAccent: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderWidth: 3,
    borderRadius: 38,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  iconBadge: {
    width: 54,
    height: 54,
    borderWidth: border.thin,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: spacing.lg, fontSize: typography.size.lg + 1, lineHeight: typography.lineHeight.lg, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  description: { marginTop: spacing.sm, fontSize: typography.size.sm, lineHeight: typography.lineHeight.md, fontWeight: typography.weight.regular, textAlign: 'center' },
  notice: {
    minHeight: 42,
    marginTop: spacing.xl,
    borderWidth: border.thin,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  noticeText: { fontSize: typography.size.xs + 1, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.semibold },
});
