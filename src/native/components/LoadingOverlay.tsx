import { LinearGradient } from 'expo-linear-gradient';
import { Shield, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import type { AppColors } from '../theme';
import { border, palette, radius, spacing, typography } from '../theme';

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
  const pulse = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    if (!visible) {
      rotation.setValue(0);
      pulse.setValue(0.75);
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
          toValue: 0.75,
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
          <Animated.View style={[styles.securityGlow, { backgroundColor: colors.surfaceMuted, opacity: pulse }]}>
            <LinearGradient
              colors={['#63B1FF', colors.primaryDark, '#4639F5']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.securityShield}
            >
              <Shield color={palette.white} fill="rgba(255,255,255,0.12)" size={39} strokeWidth={1.8} />
            </LinearGradient>
            <View style={[styles.securityDot, styles.dotTopLeft, { backgroundColor: colors.primary }]} />
            <View style={[styles.securityDot, styles.dotTopRight, { backgroundColor: colors.primary }]} />
            <View style={[styles.securityDot, styles.dotBottomLeft, { backgroundColor: colors.primary }]} />
            <View style={[styles.securityDot, styles.dotBottomRight, { backgroundColor: colors.primary }]} />
          </Animated.View>

          <Animated.View style={[styles.spinner, { borderColor: `${colors.primaryDark}35`, transform: [{ rotate: spin }] }]}>
            <View style={[styles.spinnerAccent, { borderTopColor: colors.primaryDark, borderRightColor: colors.primaryDark }]} />
          </Animated.View>

          <Text style={[styles.title, { color: colors.text }]}>{overlayTitle}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{overlayDescription}</Text>

          <View style={styles.steps} accessibilityElementsHidden>
            <View style={[styles.activeStep, { backgroundColor: colors.primaryDark }]} />
            <View style={[styles.step, { backgroundColor: colors.border }]} />
            <View style={[styles.step, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.notice}>
            <ShieldCheck color={colors.primaryDark} size={21} strokeWidth={1.9} />
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
    maxWidth: 340,
    borderWidth: border.thin,
    borderRadius: radius.xxl + 2,
    paddingHorizontal: spacing.xl + spacing.xs,
    paddingTop: spacing.xl + spacing.sm - spacing.xxs,
    paddingBottom: spacing.xl + spacing.xs,
    alignItems: 'center',
    shadowColor: '#07102A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 34,
    elevation: 16,
  },
  securityGlow: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  securityShield: { width: 58, height: 64, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  securityDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, opacity: 0.42 },
  dotTopLeft: { top: 9, left: 6 },
  dotTopRight: { top: 4, right: 4 },
  dotBottomLeft: { bottom: 10, left: -3 },
  dotBottomRight: { bottom: 5, right: -4 },
  spinner: {
    width: 76,
    height: 76,
    borderWidth: 7,
    borderRadius: 38,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerAccent: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderWidth: 7,
    borderRadius: 38,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  title: { marginTop: spacing.xl + spacing.xs, fontSize: 25, lineHeight: spacing.xxl, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  description: { marginTop: spacing.sm + spacing.xxs, fontSize: 15, lineHeight: typography.lineHeight.md, fontWeight: typography.weight.regular, textAlign: 'center' },
  steps: { marginTop: spacing.xl + spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.xs + spacing.xxs },
  activeStep: { width: 34, height: 4, borderRadius: 2 },
  step: { width: 34, height: 4, borderRadius: 2 },
  notice: { marginTop: spacing.xl - spacing.xxs, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm + 1 },
  noticeText: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.medium },
});
