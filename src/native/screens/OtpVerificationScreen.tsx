import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MessageSquareText } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { LoadingOverlay } from '../components/LoadingOverlay';
import type { AppColors } from '../theme';

const OTP_LENGTH = 6;
const OTP_LIFETIME_SECONDS = 5 * 60;

interface Props {
  colors: AppColors;
  phoneNumber: string;
  onBack: () => void;
  onChangePhone: () => void;
  onVerified: () => void;
}

export function OtpVerificationScreen({ colors, phoneNumber, onBack, onChangePhone, onVerified }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [focused, setFocused] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(OTP_LIFETIME_SECONDS);
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
    setRemainingSeconds(OTP_LIFETIME_SECONDS);
    inputRef.current?.focus();
  };

  const verify = () => {
    if (processing) return;
    if (otp.length !== OTP_LENGTH) {
      Alert.alert('Mã xác thực chưa đầy đủ', 'Vui lòng nhập đủ 6 chữ số để tiếp tục.');
      return;
    }
    if (remainingSeconds === 0) {
      Alert.alert('Mã xác thực đã hết hạn', 'Vui lòng gửi lại mã xác thực mới.');
      return;
    }
    Keyboard.dismiss();
    setProcessing(true);
    verificationTimer.current = setTimeout(() => {
      setProcessing(false);
      onVerified();
    }, 1200);
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
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.55 : 1 }]}
          >
            <ArrowLeft color={colors.text} size={27} strokeWidth={1.9} />
          </Pressable>
          <Text accessibilityRole="header" style={[styles.headerTitle, { color: colors.text }]}>
            Nhập mã xác thực
          </Text>
          {/* <View style={styles.headerSpacer} /> */}
        </View>

        <View style={styles.intro}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Nhập mã gồm 6 chữ số Identra đã gửi qua số
          </Text>
          <Text style={[styles.phoneNumber, { color: colors.text }]}>{formatPhoneNumber(phoneNumber)}</Text>
        </View>

        <View style={[styles.otpCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            accessibilityLabel="Nhập mã xác thực gồm 6 chữ số"
            accessibilityRole="button"
            onPress={() => inputRef.current?.focus()}
            style={styles.otpBoxes}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, index) => {
              const active = focused && index === Math.min(otp.length, OTP_LENGTH - 1);
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
          </Pressable>
          <TextInput
            ref={inputRef}
            accessibilityLabel="Mã xác thực"
            autoFocus
            caretHidden
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            onBlur={() => setFocused(false)}
            onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
            onFocus={() => setFocused(true)}
            onSubmitEditing={verify}
            style={styles.hiddenInput}
            value={otp}
          />

          <View style={[styles.expiryRow, { backgroundColor: colors.surfaceMuted }]}>
            <MessageSquareText color={colors.primaryDark} size={21} strokeWidth={1.9} />
            <Text style={[styles.expiryText, { color: colors.textSecondary }]}>
              Mã có hiệu lực trong <Text style={{ color: colors.primaryDark, fontWeight: '700' }}>{formatCountdown(remainingSeconds)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.resendRow}>
            <Text style={[styles.actionPrompt, { color: colors.textSecondary }]}>Chưa nhận được mã? </Text>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={resendCode}>
              <Text style={[styles.actionLink, { color: colors.primaryDark }]}>Gửi lại mã</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onChangePhone}>
            <Text style={[styles.changePhone, { color: colors.primaryDark }]}>Đổi số điện thoại</Text>
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
            <Text style={styles.verifyText}>Xác thực</Text>
          </LinearGradient>
        </Pressable>

        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
          Bằng việc tiếp tục, bạn xác nhận số điện thoại này thuộc quyền sử dụng của bạn.
        </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay
        colors={colors}
        description="Vui lòng chờ trong giây lát, Identra đang xác thực số điện thoại của bạn."
        visible={processing}
      />
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
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 30 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 30, fontWeight: '800', textAlign: 'center', letterSpacing: -0.9 },
  headerSpacer: { width: 44, height: 44 },
  intro: { alignItems: 'center', marginTop: 48, marginBottom: 34, paddingHorizontal: 8 },
  description: { fontSize: 16, lineHeight: 24, fontWeight: '400', textAlign: 'center' },
  phoneNumber: { marginTop: 10, fontSize: 20, lineHeight: 27, fontWeight: '800', letterSpacing: 0.3 },
  otpCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 24,
    shadowColor: '#415A91',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  otpBoxes: { flexDirection: 'row', justifyContent: 'space-between', gap: 7 },
  otpBox: { flex: 1, maxWidth: 48, aspectRatio: 0.82, borderWidth: 1.25, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  otpDigit: { fontSize: 24, lineHeight: 30, fontWeight: '800' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  expiryRow: { minHeight: 54, marginTop: 24, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  expiryText: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  actions: { alignItems: 'center', gap: 20, marginTop: 28 },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionPrompt: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  actionLink: { fontSize: 15, lineHeight: 22, fontWeight: '700' },
  changePhone: { fontSize: 15, lineHeight: 22, fontWeight: '700' },
  verifyButton: { minHeight: 58, borderRadius: 16, overflow: 'hidden', marginTop: 34 },
  verifyGradient: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center' },
  verifyText: { color: '#FFFFFF', fontSize: 18, lineHeight: 24, fontWeight: '700' },
  legalText: { marginTop: 'auto', paddingTop: 46, textAlign: 'center', fontSize: 13, lineHeight: 21, fontWeight: '400' },
});
