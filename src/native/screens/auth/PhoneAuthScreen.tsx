import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  LockKeyhole,
  MessageSquareText,
  Phone,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
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
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, typography } from '../../theme';
import { useI18n } from '../../i18n';

interface Props {
  colors: AppColors;
  description: string;
  initialPhoneNumber?: string;
  mode: 'login' | 'register';
  onBack: () => void;
  onContinue: (phoneNumber: string) => void;
  onSwitch: () => void;
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
  switchAction,
  switchPrompt,
  title,
}: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const compactWidth = width <= 360;
  const [phoneNumber, setPhoneNumber] = useState(() =>
    initialPhoneNumber.replace(/^\+84/, '0').replace(/\D/g, '').slice(0, 10),
  );
  const [focused, setFocused] = useState(false);
  const [acceptedUsageTerms, setAcceptedUsageTerms] = useState(false);
  const [acceptedSocialTerms, setAcceptedSocialTerms] = useState(false);
  const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(0, 10);
  const validPhone = normalizedPhone.length >= 9;

  const submit = () => {
    if (!validPhone) {
      Alert.alert(t('auth.phone.invalidTitle'), t('auth.phone.invalidDescription'));
      return;
    }
    if (mode === 'register' && (!acceptedUsageTerms || !acceptedSocialTerms)) {
      Alert.alert(t('auth.phone.termsMissingTitle'), t('auth.phone.termsMissingDescription'));
      return;
    }
    onContinue(`+84${normalizedPhone.replace(/^0/, '')}`);
  };

  return (
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
          onFocusChange={setFocused}
          onPhoneNumberChange={setPhoneNumber}
          onSubmit={submit}
        />

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
          onPress={submit}
          style={({ pressed }) => [styles.continueButton, { opacity: pressed ? 0.78 : 1 }]}
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
  );
}

function PhoneNumberCard({
  colors,
  compactWidth,
  focused,
  phoneNumber,
  onFocusChange,
  onPhoneNumberChange,
  onSubmit,
}: {
  colors: AppColors;
  compactWidth: boolean;
  focused: boolean;
  phoneNumber: string;
  onFocusChange: (focused: boolean) => void;
  onPhoneNumberChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.formCard,
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
        <Pressable
          accessibilityLabel={t('auth.phone.countryPicker')}
          accessibilityRole="button"
          onPress={() => Alert.alert(t('auth.phone.countryTitle'), t('auth.phone.countryVietnam'))}
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
        <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />
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
      <View style={styles.smsHint}>
        <View style={[styles.hintIcon, { backgroundColor: colors.surfaceMuted }]}>
          <MessageSquareText color={colors.primaryDark} size={21} strokeWidth={1.9} />
        </View>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>{t('auth.phone.smsHint')}</Text>
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
    shadowColor: '#415A91',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
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
    shadowColor: '#415A91',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 1,
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
