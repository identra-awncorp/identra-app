import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MessageSquareText } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, typography } from '../../theme';
import { AuthNoticeModal, type AuthNotice } from './AuthNoticeModal';
import {
  AUTH_OTP_LENGTH,
  AUTH_OTP_LIFETIME_SECONDS,
  getOtpVerificationResult,
  sanitizeOtpInput,
} from './authLogic';

interface Props {
  colors: AppColors;
  phoneNumber: string;
  onBack: () => void;
  onChangePhone: () => void;
  onVerified: () => void;
}

export function OtpVerificationScreen({ colors, phoneNumber, onBack, onChangePhone, onVerified }: Props) {
  const { t } = useI18n();
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [focused, setFocused] = useState(false);
  const [notice, setNotice] = useState<(AuthNotice & { refocusInput?: boolean }) | null>(null);
  const [processing, setProcessing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(AUTH_OTP_LIFETIME_SECONDS);
  const verificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (verificationTimer.current) clearTimeout(verificationTimer.current);
  }, []);

  const resendCode = () => {
    setOtp('');
    setRemainingSeconds(AUTH_OTP_LIFETIME_SECONDS);
    inputRef.current?.focus();
  };

  const verify = () => {
    if (processing) return;
    const result = getOtpVerificationResult(otp, remainingSeconds);

    if (result === 'incomplete') {
      setNotice({
        title: t('auth.otp.incompleteTitle'),
        description: t('auth.otp.incompleteDescription'),
        tone: 'warning',
        refocusInput: true,
      });
      return;
    }
    if (result === 'expired') {
      setNotice({
        title: t('auth.otp.expiredTitle'),
        description: t('auth.otp.expiredDescription'),
        tone: 'warning',
        refocusInput: true,
      });
      return;
    }
    Keyboard.dismiss();
    setProcessing(true);
    verificationTimer.current = setTimeout(() => {
      setProcessing(false);
      if (result === 'invalid') {
        setNotice({
          title: t('auth.otp.invalidTitle'),
          description: t('auth.otp.invalidDescription'),
          tone: 'danger',
          refocusInput: true,
        });
        return;
      }
      onVerified();
    }, 1200);
  };

  const closeNotice = () => {
    const shouldRefocus = notice?.refocusInput;
    setNotice(null);
    if (shouldRefocus) requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        nativeID="screen-otp-verification"
        testID="screen-otp-verification"
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <View style={[styles.glow, styles.glowTop, { backgroundColor: colors.primary }]} />
        <View style={[styles.glow, styles.glowBottom, { backgroundColor: colors.primaryDark }]} />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.55 : 1 }]}
          >
            <ArrowLeft color={colors.text} size={27} strokeWidth={1.9} />
          </Pressable>
          <Text accessibilityRole="header" style={[styles.headerTitle, { color: colors.text }]}>
            {t('auth.otp.title')}
          </Text>
          {/* <View style={styles.headerSpacer} /> */}
        </View>

        <View style={styles.intro}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('auth.otp.description')}
          </Text>
          <Text style={[styles.phoneNumber, { color: colors.text }]}>{formatPhoneNumber(phoneNumber)}</Text>
        </View>

        <View style={[styles.otpCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.otpInputArea}>
            <View pointerEvents="none" style={styles.otpBoxes}>
              {Array.from({ length: AUTH_OTP_LENGTH }).map((_, index) => {
                const active = focused && index === Math.min(otp.length, AUTH_OTP_LENGTH - 1);
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: colors.surface,
                        borderColor: active ? colors.primaryDark : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.otpDigit, { color: colors.text }]}>{otp[index] ?? ''}</Text>
                  </View>
                );
              })}
            </View>
            <TextInput
              ref={inputRef}
              accessibilityLabel={t('auth.otp.codeLabel')}
              autoComplete="sms-otp"
              autoFocus
              caretHidden
              keyboardType="number-pad"
              maxLength={AUTH_OTP_LENGTH}
              onBlur={() => setFocused(false)}
              onChangeText={(value) => setOtp(sanitizeOtpInput(value))}
              onFocus={() => setFocused(true)}
              onSubmitEditing={verify}
              showSoftInputOnFocus
              style={styles.hiddenInput}
              textContentType="oneTimeCode"
              value={otp}
            />
          </View>

          <View style={[styles.expiryRow, { backgroundColor: colors.surfaceMuted }]}>
            <MessageSquareText color={colors.primaryDark} size={21} strokeWidth={1.9} />
            <Text style={[styles.expiryText, { color: colors.textSecondary }]}>
              {t('auth.otp.validFor')} <Text style={{ color: colors.primaryDark, fontWeight: '700' }}>{formatCountdown(remainingSeconds)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.resendRow}>
            <Text style={[styles.actionPrompt, { color: colors.textSecondary }]}>{t('auth.otp.resendPrompt')} </Text>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={resendCode}>
              <Text style={[styles.actionLink, { color: colors.primaryDark }]}>{t('auth.otp.resend')}</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onChangePhone}>
            <Text style={[styles.changePhone, { color: colors.primaryDark }]}>{t('auth.otp.changePhone')}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={verify}
          style={({ pressed }) => [styles.verifyButton, { opacity: pressed ? 0.78 : 1 }]}
        >
          <LinearGradient
            colors={[colors.primaryDark, '#4B86FF', colors.primaryDark]}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={styles.verifyGradient}
          >
            <Text style={styles.verifyText}>{t('auth.otp.verify')}</Text>
          </LinearGradient>
        </Pressable>

        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
          {t('auth.otp.legal')}
        </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay
        colors={colors}
        description={t('auth.otp.loadingDescription')}
        visible={processing}
      />
      <AuthNoticeModal actionLabel={t('common.close')} colors={colors} notice={notice} onClose={closeNotice} />
    </>
  );
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
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
  screen: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, opacity: 0.06 },
  glowTop: { top: -130, right: -110 },
  glowBottom: { bottom: -150, left: -120 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xl + spacing.xs + spacing.xxs },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 30, fontWeight: typography.weight.extraBold, textAlign: 'center', letterSpacing: -0.9 },
  headerSpacer: { width: 44, height: 44 },
  intro: { alignItems: 'center', marginTop: 48, marginBottom: 34, paddingHorizontal: 8 },
  description: { fontSize: typography.size.md, lineHeight: spacing.xl, fontWeight: typography.weight.regular, textAlign: 'center' },
  phoneNumber: { marginTop: spacing.sm + spacing.xxs, fontSize: typography.size.lg, lineHeight: 27, fontWeight: typography.weight.extraBold, letterSpacing: 0.3 },
  otpCard: {
    borderWidth: border.thin,
    borderRadius: radius.xxl - spacing.xxs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    shadowColor: '#415A91',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  otpInputArea: { position: 'relative' },
  otpBoxes: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm - 1 },
  otpBox: { flex: 1, maxWidth: 48, aspectRatio: 0.82, borderWidth: border.medium, borderRadius: radius.md + 1, alignItems: 'center', justifyContent: 'center' },
  otpDigit: { fontSize: spacing.xl, lineHeight: 30, fontWeight: typography.weight.extraBold },
  hiddenInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    bottom: 0,
    color: 'transparent',
    fontSize: 1,
    left: 0,
    lineHeight: 1,
    padding: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  expiryRow: { minHeight: 54, marginTop: 24, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  expiryText: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.regular },
  actions: { alignItems: 'center', gap: 20, marginTop: 28 },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionPrompt: { fontSize: 15, lineHeight: 22, fontWeight: typography.weight.regular },
  actionLink: { fontSize: 15, lineHeight: 22, fontWeight: typography.weight.bold },
  changePhone: { fontSize: 15, lineHeight: 22, fontWeight: typography.weight.bold },
  verifyButton: { minHeight: 58, borderRadius: radius.lg, overflow: 'hidden', marginTop: 34 },
  verifyGradient: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center' },
  verifyText: { color: palette.white, fontSize: 18, lineHeight: spacing.xl, fontWeight: typography.weight.bold },
  legalText: { marginTop: 'auto', paddingTop: 46, textAlign: 'center', fontSize: 13, lineHeight: 21, fontWeight: typography.weight.regular },
});
