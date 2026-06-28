import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquareText, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, typography } from '../../theme';
import { OtpVerificationScreen } from './OtpVerificationScreen';
import { PhoneAuthScreen } from './PhoneAuthScreen';

interface Props {
  colors: AppColors;
  onBack: () => void;
  onContinue: (phoneNumber: string) => void;
  onLogin: () => void;
}

export function RegisterScreen({ colors, onBack, onContinue, onLogin }: Props) {
  const { t } = useI18n();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const requestVerification = (value: string) => {
    setPhoneNumber(value);
    setConfirmationVisible(true);
  };

  if (step === 'otp') {
    return (
      <OtpVerificationScreen
        colors={colors}
        phoneNumber={phoneNumber}
        onBack={() => setStep('phone')}
        onChangePhone={() => setStep('phone')}
        onVerified={() => onContinue(phoneNumber)}
      />
    );
  }

  return (
    <>
      <PhoneAuthScreen
        colors={colors}
        description={t('auth.register.description')}
        initialPhoneNumber={phoneNumber}
        mode="register"
        onBack={onBack}
        onContinue={requestVerification}
        onSwitch={onLogin}
        switchAction={t('auth.register.switchAction')}
        switchPrompt={t('auth.register.switchPrompt')}
        title={t('auth.register.title')}
      />
      <PhoneConfirmationModal
        colors={colors}
        phoneNumber={phoneNumber}
        visible={confirmationVisible}
        onChangeNumber={() => setConfirmationVisible(false)}
        onContinue={() => {
          setConfirmationVisible(false);
          setStep('otp');
        }}
      />
    </>
  );
}

function PhoneConfirmationModal({
  colors,
  phoneNumber,
  visible,
  onChangeNumber,
  onContinue,
}: {
  colors: AppColors;
  phoneNumber: string;
  visible: boolean;
  onChangeNumber: () => void;
  onContinue: () => void;
}) {
  const { t } = useI18n();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onChangeNumber}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel={t('auth.register.closeConfirmation')} onPress={onChangeNumber} style={styles.backdrop} />
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.modalIcon, { backgroundColor: colors.surfaceMuted }]}>
            <MessageSquareText color={colors.primaryDark} size={28} strokeWidth={1.9} />
          </View>
          <Text accessibilityRole="header" style={[styles.modalTitle, { color: colors.text }]}>
            {t('auth.register.confirmTitle')}
          </Text>
          <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
            {t('auth.register.confirmDescription')}
          </Text>
          <View style={[styles.phonePill, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Phone color={colors.primaryDark} size={20} strokeWidth={1.9} />
            <Text style={[styles.phoneNumber, { color: colors.text }]}>{formatPhoneNumber(phoneNumber)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.78 : 1 }]}
          >
            <LinearGradient
              colors={[colors.primaryDark, '#4B86FF', colors.primaryDark]}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
              style={styles.primaryGradient}
            >
              <Text style={styles.primaryText}>{t('common.continue')}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onChangeNumber}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.primaryDark, opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Text style={[styles.secondaryText, { color: colors.primaryDark }]}>{t('auth.register.changeNumber')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function formatPhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.startsWith('84')) {
    const local = digits.slice(2);
    return `+84 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`.trim();
  }
  return phoneNumber;
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 15, 42, 0.55)' },
  modalCard: {
    width: '100%',
    maxWidth: 350,
    borderWidth: border.thin,
    borderRadius: radius.xxl,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: 'center',
    shadowColor: '#07102A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 12,
  },
  modalIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 22, lineHeight: 28, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  modalDescription: { marginTop: spacing.sm, fontSize: typography.size.sm, lineHeight: 21, fontWeight: typography.weight.regular, textAlign: 'center' },
  phonePill: {
    width: '100%',
    minHeight: 56,
    marginTop: 18,
    borderWidth: border.thin,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  phoneNumber: { fontSize: 17, lineHeight: 23, fontWeight: typography.weight.bold, letterSpacing: 0.2 },
  primaryButton: { width: '100%', minHeight: 52, marginTop: 24, borderRadius: 15, overflow: 'hidden' },
  primaryGradient: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: palette.white, fontSize: typography.size.md, lineHeight: 22, fontWeight: typography.weight.bold },
  secondaryButton: { width: '100%', minHeight: 52, marginTop: spacing.md, borderWidth: border.thin, borderRadius: radius.lg - 1, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: typography.size.md, lineHeight: 22, fontWeight: typography.weight.bold },
});
