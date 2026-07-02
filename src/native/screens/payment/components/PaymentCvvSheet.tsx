import { LockKeyhole, ShieldCheck, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, palette, radius, spacing, typography } from '../../../theme';
import { paymentT } from '../paymentI18n';
import type { PaymentCard } from '../paymentTypes';
import { paymentSurfaces } from './paymentSurfaces';

type CvvStep = 'auth' | 'reveal';

export function PaymentCvvSheet({
  card,
  colors,
  onClose,
}: {
  card: PaymentCard | null;
  colors: AppColors;
  onClose: () => void;
}) {
  const [step, setStep] = useState<CvvStep>('auth');
  const [secondsLeft, setSecondsLeft] = useState(30);
  const { t } = useI18n();

  useEffect(() => {
    setStep('auth');
    setSecondsLeft(30);
  }, [card?.id]);

  useEffect(() => {
    if (!card || step !== 'reveal') return undefined;
    setSecondsLeft(30);
    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [card, onClose, step]);

  if (!card) return null;

  const maskedCard = card.cardNumber.slice(-4);

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible>
      <View style={[styles.layer, { backgroundColor: colors.overlay }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={paymentT(t, 'cvv.closeBackdrop')} onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, paymentSurfaces.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceMuted }]}>
              {step === 'auth' ? (
                <LockKeyhole color={colors.primaryDark} size={27} strokeWidth={2.1} />
              ) : (
                <ShieldCheck color={colors.success} size={27} strokeWidth={2.1} />
              )}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} hitSlop={8} style={styles.closeButton}>
              <X color={colors.textSecondary} size={24} strokeWidth={2} />
            </Pressable>
          </View>

          {step === 'auth' ? (
            <CardCvvAuthSheet colors={colors} maskedCard={maskedCard} onAuthenticated={() => setStep('reveal')} onClose={onClose} />
          ) : (
            <CardCvvRevealSheet colors={colors} onClose={onClose} secondsLeft={secondsLeft} />
          )}
        </View>
      </View>
    </Modal>
  );
}

function CardCvvAuthSheet({
  colors,
  maskedCard,
  onAuthenticated,
  onClose,
}: {
  colors: AppColors;
  maskedCard: string;
  onAuthenticated: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      <Text style={[styles.title, { color: colors.text }]}>{paymentT(t, 'cvv.authTitle')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {paymentT(t, 'cvv.authDescription', { maskedCard })}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={paymentT(t, 'cvv.authAction')}
        onPress={onAuthenticated}
        style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primaryDark, opacity: pressed ? 0.78 : 1 }]}
      >
        <Text style={styles.primaryButtonText}>{paymentT(t, 'cvv.authAction')}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
        onPress={onClose}
        style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('common.cancel')}</Text>
      </Pressable>
    </>
  );
}

function CardCvvRevealSheet({
  colors,
  onClose,
  secondsLeft,
}: {
  colors: AppColors;
  onClose: () => void;
  secondsLeft: number;
}) {
  const { t } = useI18n();
  const cvv = '742';

  return (
    <>
      <Text style={[styles.title, { color: colors.text }]}>{paymentT(t, 'cvv.revealTitle')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {paymentT(t, 'cvv.revealDescription', { secondsLeft })}
      </Text>
      <View style={[styles.cvvBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
        <Text accessibilityLabel={paymentT(t, 'cvv.codeAccessibility', { cvv })} style={[styles.cvvText, { color: colors.text }]}>{cvv}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={paymentT(t, 'cvv.hideAction')}
        onPress={onClose}
        style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primaryDark, opacity: pressed ? 0.78 : 1 }]}
      >
        <Text style={styles.primaryButtonText}>{paymentT(t, 'cvv.hideAction')}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  layer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: radius.round,
    backgroundColor: palette.gray[200],
  },
  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.black,
  },
  description: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },
  cvvBox: {
    marginTop: spacing.xl,
    minHeight: 86,
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvvText: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: typography.weight.black,
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
  },
  primaryButton: {
    minHeight: 50,
    marginTop: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.black,
  },
  secondaryButton: {
    minHeight: 48,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.extraBold,
  },
});
