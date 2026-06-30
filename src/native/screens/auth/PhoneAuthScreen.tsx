import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  LockKeyhole,
  MessageSquareText,
  Phone,
  X,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppColors } from '../../theme';
import { border, palette, radius, shadows, spacing, typography } from '../../theme';
import { useI18n } from '../../i18n';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { AuthNoticeModal, type AuthNotice } from './AuthNoticeModal';

interface Props {
  colors: AppColors;
  description: string;
  initialPhoneNumber?: string;
  mode: 'login' | 'register';
  onBack: () => void;
  onContinue: (phoneNumber: string, password: string) => void;
  onSwitch: () => void;
  submitting?: boolean;
  switchAction: string;
  switchPrompt: string;
  title: string;
}

export function PhoneAuthScreen({
  colors,
  description,
  initialPhoneNumber = '',
  mode,
  onBack,
  onContinue,
  onSwitch,
  submitting = false,
  switchAction,
  switchPrompt,
  title,
}: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compactWidth = width <= 360;
  const [phoneNumber, setPhoneNumber] = useState(() =>
    initialPhoneNumber.replace(/^\+84/, '0').replace(/\D/g, '').slice(0, 10),
  );
  const [focused, setFocused] = useState(false);
  const [acceptedUsageTerms, setAcceptedUsageTerms] = useState(false);
  const [acceptedSocialTerms, setAcceptedSocialTerms] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(0, 10);
  const validPhone = normalizedPhone.length >= 9;
  const contentBottomPadding = insets.bottom + (mode === 'register' ? 34 : spacing.xl + spacing.xxs);

  const submit = () => {
    if (submitting) return;
    if (!validPhone) {
      setNotice({
        title: t('auth.phone.invalidTitle'),
        description: t('auth.phone.invalidDescription'),
        tone: 'warning',
      });
      return;
    }
    if (mode === 'login' && !password.trim()) {
      setNotice({
        title: t('auth.login.passwordMissingTitle'),
        description: t('auth.login.passwordMissingDescription'),
        tone: 'warning',
      });
      return;
    }
    if (mode === 'register' && (!acceptedUsageTerms || !acceptedSocialTerms)) {
      setNotice({
        title: t('auth.phone.termsMissingTitle'),
        description: t('auth.phone.termsMissingDescription'),
        tone: 'warning',
      });
      return;
    }
    onContinue(`+84${normalizedPhone.replace(/^0/, '')}`, password);
  };

  return (
    <>
      <KeyboardAvoidingView
        nativeID={`screen-${mode}`}
        testID={`screen-${mode}`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <View style={[styles.glow, styles.glowTop, { backgroundColor: colors.primary }]} />
        <View style={[styles.glow, styles.glowBottom, { backgroundColor: colors.primaryDark }]} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            compactWidth && styles.contentCompact,
            mode === 'register' && styles.registerContent,
            { paddingTop: insets.top + spacing.xl, paddingBottom: contentBottomPadding },
          ]}
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
            <View style={{ flex: 1, justifyContent: 'center' }} pointerEvents="none">
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.intro}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
          </View>

          <PhoneNumberCard
            colors={colors}
            compactWidth={compactWidth}
            focused={focused}
            phoneNumber={phoneNumber}
            onCountryPress={() => setNotice({
              title: t('auth.phone.countryTitle'),
              description: t('auth.phone.countryVietnam'),
              tone: 'info',
            })}
            onFocusChange={setFocused}
            onPhoneNumberChange={setPhoneNumber}
            showSmsHint={mode === 'register'}
            showCountrySelector={mode === 'register'}
            onSubmit={submit}
          >
            {mode === 'login' ? (
              <LoginPasswordCard
                colors={colors}
                focused={passwordFocused}
                password={password}
                passwordVisible={passwordVisible}
                onFocusChange={setPasswordFocused}
                onPasswordChange={setPassword}
                onSubmit={submit}
                onTogglePasswordVisible={() => setPasswordVisible((value) => !value)}
              />
            ) : null}
          </PhoneNumberCard>

          {mode === 'register' ? (
            <View style={styles.consentList}>
              <ConsentRow
                checked={acceptedUsageTerms}
                colors={colors}
                linkText={t('auth.phone.usageTerms')}
                onPress={() => setAcceptedUsageTerms((value) => !value)}
                suffix={t('auth.phone.identraSuffix')}
              />
              <ConsentRow
                checked={acceptedSocialTerms}
                colors={colors}
                linkText={t('auth.phone.socialTerms')}
                onPress={() => setAcceptedSocialTerms((value) => !value)}
                suffix={t('auth.phone.identraSuffix')}
              />
            </View>
          ) : null}

          <Pressable
            accessibilityLabel={t('common.continue')}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={submit}
            style={({ pressed }) => [styles.continueButton, { opacity: submitting ? 0.55 : pressed ? 0.78 : 1 }]}
          >
            <LinearGradient
              colors={[colors.primaryDark, '#4B86FF', colors.primaryDark]}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>{t('common.continue')}</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>{switchPrompt} </Text>
            <Pressable accessibilityLabel={switchAction} accessibilityRole="button" hitSlop={8} onPress={onSwitch}>
              <Text style={[styles.switchLink, { color: colors.primaryDark }]}>{switchAction}</Text>
            </Pressable>
          </View>

          {mode === 'login' ? <LoginFooter colors={colors} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay
        colors={colors}
        description={mode === 'login' ? t('auth.login.loadingDescription') : t('auth.register.loadingDescription')}
        visible={submitting}
      />
      <AuthNoticeModal actionLabel={t('common.close')} colors={colors} notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}

function PhoneNumberCard({
  children,
  colors,
  compactWidth,
  focused,
  phoneNumber,
  onCountryPress,
  onFocusChange,
  onPhoneNumberChange,
  showCountrySelector,
  showSmsHint,
  onSubmit,
}: {
  children?: ReactNode;
  colors: AppColors;
  compactWidth: boolean;
  focused: boolean;
  phoneNumber: string;
  onCountryPress: () => void;
  onFocusChange: (focused: boolean) => void;
  onPhoneNumberChange: (value: string) => void;
  showCountrySelector: boolean;
  showSmsHint: boolean;
  onSubmit: () => void;
}) {
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.formCard,
        shadows.subtle,
        {
          backgroundColor: colors.surface,
          borderColor: colors.background === '#F7F8FC' ? '#EBEEF6' : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{t('auth.phone.phoneLabel')}</Text>
      <View
        style={[
          styles.phoneField,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primaryDark : colors.border,
          },
        ]}
      >
        {showCountrySelector ? (
          <Pressable
          accessibilityLabel={t('auth.phone.countryPicker')}
          accessibilityRole="button"
          onPress={onCountryPress}
          style={({ pressed }) => [
            styles.country,
            compactWidth && styles.countryCompact,
            { opacity: pressed ? 0.68 : 1 },
          ]}
        >
          <View style={styles.flag}>
            <Text style={styles.flagStar}>★</Text>
          </View>
          <Text style={[styles.countryCode, { color: colors.text }]}>+84</Text>
          <ChevronDown color={colors.textSecondary} size={compactWidth ? 16 : 18} strokeWidth={2} />
          </Pressable>
        ) : null}
        {showCountrySelector ? <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} /> : null}
        <View style={[styles.inputWrap, compactWidth && styles.inputWrapCompact]}>
          <Phone color={focused ? colors.primaryDark : colors.textSecondary} size={compactWidth ? 19 : 21} strokeWidth={1.8} />
          <TextInput
            accessibilityLabel={t('auth.phone.phoneLabel')}
            autoComplete="tel"
            keyboardType="phone-pad"
            maxLength={10}
            onBlur={() => onFocusChange(false)}
            onChangeText={(value) => onPhoneNumberChange(value.replace(/\D/g, '').slice(0, 10))}
            onFocus={() => onFocusChange(true)}
            onSubmitEditing={onSubmit}
            placeholder={t('auth.phone.phonePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            returnKeyType="done"
            style={[styles.input, compactWidth && styles.inputCompact, { color: colors.text }]}
            value={phoneNumber}
          />
          {phoneNumber ? (
            <Pressable
              accessibilityLabel={t('auth.phone.clearPhone')}
              accessibilityRole="button"
              hitSlop={7}
              onPress={() => onPhoneNumberChange('')}
              style={({ pressed }) => [styles.clearButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <X color={colors.textSecondary} size={20} strokeWidth={1.9} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {showSmsHint ? (
        <View style={styles.smsHint}>
          <View style={[styles.hintIcon, { backgroundColor: colors.surfaceMuted }]}>
            <MessageSquareText color={colors.primaryDark} size={21} strokeWidth={1.9} />
          </View>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>{t('auth.phone.smsHint')}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

function LoginPasswordCard({
  colors,
  focused,
  onFocusChange,
  onPasswordChange,
  onSubmit,
  onTogglePasswordVisible,
  password,
  passwordVisible,
}: {
  colors: AppColors;
  focused: boolean;
  onFocusChange: (focused: boolean) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onTogglePasswordVisible: () => void;
  password: string;
  passwordVisible: boolean;
}) {
  const { t } = useI18n();
  const VisibilityIcon = passwordVisible ? EyeOff : Eye;

  return (
    <View style={styles.passwordSection}>
      <Text style={[styles.label, { color: colors.text }]}>{t('auth.login.passwordLabel')}</Text>
      <View
        style={[
          styles.passwordField,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primaryDark : colors.border,
          },
        ]}
      >
        <LockKeyhole color={focused ? colors.primaryDark : colors.textSecondary} size={21} strokeWidth={1.8} />
        <TextInput
          accessibilityLabel={t('auth.login.passwordLabel')}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          onBlur={() => onFocusChange(false)}
          onChangeText={onPasswordChange}
          onFocus={() => onFocusChange(true)}
          onSubmitEditing={onSubmit}
          placeholder={t('auth.login.passwordPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          secureTextEntry={!passwordVisible}
          style={[styles.passwordInput, { color: colors.text }]}
          textContentType="password"
          value={password}
        />
        <Pressable
          accessibilityLabel={passwordVisible ? t('auth.password.hidePassword') : t('auth.password.showPassword')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onTogglePasswordVisible}
          style={styles.passwordEyeButton}
        >
          <VisibilityIcon color={colors.textSecondary} size={20} strokeWidth={1.9} />
        </Pressable>
      </View>
    </View>
  );
}

function ConsentRow({
  checked,
  colors,
  linkText,
  onPress,
  suffix,
}: {
  checked: boolean;
  colors: AppColors;
  linkText: string;
  onPress: () => void;
  suffix: string;
}) {
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.consentRow,
        shadows.subtle,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? colors.primaryDark : colors.surface,
            borderColor: checked ? colors.primaryDark : colors.textSecondary,
          },
        ]}
      >
        {checked ? <Check color="#FFFFFF" size={18} strokeWidth={2.6} /> : null}
      </View>
      <Text style={[styles.consentText, { color: colors.textSecondary }]}>
        {t('auth.phone.agreePrefix')} <Text style={{ color: colors.primaryDark }}>{linkText}</Text> {suffix}
      </Text>
    </Pressable>
  );
}

function LoginFooter({ colors }: { colors: AppColors }) {
  const { t } = useI18n();

  return (
    <>
      <View style={[styles.securityCard, { borderColor: `${colors.primaryDark}30`, backgroundColor: colors.surface }]}>
        <View style={[styles.securityIllustration, { backgroundColor: `${colors.primaryDark}0E` }]}>
          <LinearGradient colors={['#72B7FF', colors.primaryDark]} style={styles.securityShield}>
            <LockKeyhole color="#FFFFFF" size={25} strokeWidth={2.2} />
          </LinearGradient>
        </View>
        <View style={[styles.securityDivider, { backgroundColor: colors.border }]} />
        <View style={styles.securityCopy}>
          <Text style={[styles.securityTitle, { color: colors.text }]}>{t('auth.phone.secureTitle')}</Text>
          <Text style={[styles.securityDescription, { color: colors.textSecondary }]}>
            {t('auth.phone.secureDescription')}
          </Text>
        </View>
      </View>

      <Text style={[styles.legalText, { color: colors.textSecondary }]}>
        {t('auth.phone.legalPrefix')}{'\n'}
        <Text style={{ color: colors.primaryDark }}>{t('auth.phone.termsOfUse')}</Text>
        {` ${t('common.and')} `}
        <Text style={{ color: colors.primaryDark }}>{t('auth.phone.privacyPolicy')}</Text>.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, opacity: 0.06 },
  glowTop: { top: -130, right: -110 },
  glowBottom: { bottom: -150, left: -120 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xl + spacing.xxs },
  contentCompact: { paddingHorizontal: spacing.lg },
  registerContent: { paddingBottom: 34 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerSpacer: { width: 44, height: 44 },
  brand: { flex: 1, justifyContent: 'center' },
  intro: { alignItems: 'center', marginBottom: 36 },
  title: { fontSize: 30, fontWeight: typography.weight.extraBold, letterSpacing: -0.9, textAlign: 'center' },
  description: { marginTop: spacing.md + spacing.xxs, textAlign: 'center', fontSize: typography.size.md, lineHeight: spacing.xl, fontWeight: typography.weight.regular },
  formCard: {
    borderWidth: border.thin,
    borderRadius: radius.xl,
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: spacing.xl - spacing.xs,
  },
  label: { fontSize: 18, lineHeight: spacing.xl, fontWeight: typography.weight.bold },
  phoneField: { minHeight: 64, borderWidth: border.medium, borderRadius: radius.lg - 1, flexDirection: 'row', alignItems: 'stretch' },
  country: { width: 108, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  countryCompact: { width: 91, paddingHorizontal: 7, gap: 5 },
  flag: { width: 22, height: 16, borderRadius: 2, backgroundColor: '#E51C24', alignItems: 'center', justifyContent: 'center' },
  flagStar: { color: '#FFEB3B', fontSize: 10, lineHeight: 12 },
  countryCode: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  fieldDivider: { width: border.thin },
  inputWrap: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  inputWrapCompact: { gap: 6, paddingHorizontal: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: typography.weight.regular,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputCompact: { fontSize: 14 },
  clearButton: { width: 28, height: 42, alignItems: 'center', justifyContent: 'center' },
  smsHint: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.md + 1 },
  hintIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  hintText: { flex: 1, fontSize: typography.size.sm, lineHeight: 21, fontWeight: typography.weight.regular },
  passwordSection: { gap: spacing.md },
  passwordField: { minHeight: 58, borderWidth: border.medium, borderRadius: radius.lg - 1, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: typography.weight.regular,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  passwordEyeButton: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  consentList: { gap: 12, marginTop: 24 },
  consentRow: {
    minHeight: 68,
    borderWidth: border.thin,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: { width: 28, height: 28, borderWidth: border.medium, borderRadius: radius.sm - 1, alignItems: 'center', justifyContent: 'center' },
  consentText: { flex: 1, fontSize: typography.size.sm, lineHeight: 21, fontWeight: typography.weight.regular },
  continueButton: { minHeight: 58, borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.xxl },
  continueGradient: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  continueText: { color: palette.white, fontSize: 18, fontWeight: typography.weight.bold },
  switchRow: { minHeight: 70, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  switchText: { fontSize: 15, lineHeight: 22, fontWeight: typography.weight.regular, marginTop: 30 },
  switchLink: { fontSize: 15, lineHeight: 22, fontWeight: typography.weight.semibold },
  securityCard: { minHeight: 116, borderWidth: border.thin, borderRadius: radius.lg + 2, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  securityIllustration: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  securityShield: { width: 54, height: 62, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  securityDivider: { width: border.thin, height: 66 },
  securityCopy: { flex: 1, gap: 5 },
  securityTitle: { fontSize: typography.size.md, lineHeight: 22, fontWeight: typography.weight.bold },
  securityDescription: { fontSize: typography.size.sm, lineHeight: 22, fontWeight: typography.weight.regular },
  legalText: { marginTop: 'auto', paddingTop: 46, textAlign: 'center', fontSize: 13, lineHeight: 21, fontWeight: typography.weight.regular },
});
