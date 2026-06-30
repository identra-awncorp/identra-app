import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { getAuthErrorMessage } from '../../domain/auth';
import { useI18n } from '../../i18n';
import { border, palette, radius, shadows, spacing, typography, type AppColors } from '../../theme';
import { AuthNoticeModal, type AuthNotice } from './AuthNoticeModal';
import {
  AUTH_PASSWORD_REQUIREMENTS,
  getPasswordRequirements,
  getPasswordValidationResult,
  type PasswordRequirementKey,
} from './authLogic';

interface Props {
  colors: AppColors;
  onBack: () => void;
  onComplete: (password: string) => Promise<void> | void;
}

export function CreatePasswordScreen({ colors, onBack, onComplete }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmationFocused, setConfirmationFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [processing, setProcessing] = useState(false);
  const requirements = getPasswordRequirements(password);
  const validation = getPasswordValidationResult(password, confirmation);
  const canSubmit = validation === 'valid';
  const confirmationMismatch = confirmation.length > 0 && validation === 'mismatch';

  const submit = async () => {
    if (!canSubmit || processing) return;

    setProcessing(true);
    try {
      await onComplete(password);
    } catch (error) {
      setNotice({
        title: t('auth.password.errorTitle'),
        description: getAuthErrorMessage(error),
        tone: 'danger',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        nativeID="screen-create-password"
        testID="screen-create-password"
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <View style={[styles.glow, styles.glowTop, { backgroundColor: colors.primary }]} />
        <View style={[styles.glow, styles.glowBottom, { backgroundColor: colors.primaryDark }]} />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl },
          ]}
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
              {t('auth.password.title')}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.intro}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{t('auth.password.description')}</Text>
          </View>

          <View style={[styles.form, shadows.subtle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <PasswordField
              colors={colors}
              focused={passwordFocused}
              label={t('auth.password.passwordLabel')}
              placeholder={t('auth.password.passwordPlaceholder')}
              secure={!passwordVisible}
              toggleLabel={passwordVisible ? t('auth.password.hidePassword') : t('auth.password.showPassword')}
              value={password}
              onBlur={() => setPasswordFocused(false)}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onSubmitEditing={() => undefined}
              onToggleSecure={() => setPasswordVisible((value) => !value)}
            />
            <PasswordField
              colors={colors}
              focused={confirmationFocused}
              label={t('auth.password.confirmPasswordLabel')}
              placeholder={t('auth.password.confirmPasswordPlaceholder')}
              secure={!confirmationVisible}
              toggleLabel={confirmationVisible ? t('auth.password.hidePassword') : t('auth.password.showPassword')}
              value={confirmation}
              onBlur={() => setConfirmationFocused(false)}
              onChangeText={setConfirmation}
              onFocus={() => setConfirmationFocused(true)}
              onSubmitEditing={() => {
                void submit();
              }}
              onToggleSecure={() => setConfirmationVisible((value) => !value)}
            />
            {confirmationMismatch ? (
              <Text style={[styles.fieldError, { color: colors.danger }]}>{t('auth.password.mismatch')}</Text>
            ) : null}

            <View style={styles.requirements}>
              <Text style={[styles.requirementsTitle, { color: colors.text }]}>{t('auth.password.requirementsTitle')}</Text>
              {AUTH_PASSWORD_REQUIREMENTS.map((key) => (
                <RequirementRow
                  key={key}
                  colors={colors}
                  met={requirements[key]}
                  text={t(getRequirementKey(key))}
                />
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit || processing }}
            disabled={!canSubmit || processing}
            onPress={() => {
              void submit();
            }}
            style={({ pressed }) => [
              styles.submitButton,
              { opacity: !canSubmit || processing ? 0.45 : pressed ? 0.78 : 1 },
            ]}
          >
            <LinearGradient
              colors={[colors.primaryDark, '#4B86FF', colors.primaryDark]}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>{t('auth.password.submit')}</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay colors={colors} description={t('auth.password.loadingDescription')} visible={processing} />
      <AuthNoticeModal actionLabel={t('common.close')} colors={colors} notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}

function PasswordField({
  colors,
  focused,
  label,
  onBlur,
  onChangeText,
  onFocus,
  onSubmitEditing,
  onToggleSecure,
  placeholder,
  secure,
  toggleLabel,
  value,
}: {
  colors: AppColors;
  focused: boolean;
  label: string;
  onBlur: () => void;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onSubmitEditing: () => void;
  onToggleSecure: () => void;
  placeholder: string;
  secure: boolean;
  toggleLabel: string;
  value: string;
}) {
  const Icon = secure ? Eye : EyeOff;

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.passwordField,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? `${colors.primaryDark}B8` : `${colors.border}8A`,
          },
        ]}
      >
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          onBlur={onBlur}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          secureTextEntry={secure}
          style={[styles.passwordInput, { color: colors.text }]}
          textContentType="newPassword"
          value={value}
        />
        <Pressable
          accessibilityLabel={toggleLabel}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onToggleSecure}
          style={styles.eyeButton}
        >
          <Icon color={colors.textSecondary} size={20} strokeWidth={1.9} />
        </Pressable>
      </View>
    </View>
  );
}

function RequirementRow({
  colors,
  met,
  text,
}: {
  colors: AppColors;
  met: boolean;
  text: string;
}) {
  return (
    <View style={styles.requirementRow}>
      <View
        style={[
          styles.requirementIcon,
          {
            backgroundColor: met ? `${colors.success}14` : colors.surfaceMuted,
            borderColor: met ? `${colors.success}40` : colors.border,
          },
        ]}
      >
        {met ? <Check color={colors.success} size={14} strokeWidth={2.4} /> : null}
      </View>
      <Text style={[styles.requirementText, { color: met ? colors.text : colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

function getRequirementKey(key: PasswordRequirementKey) {
  return `auth.password.requirements.${key}` as const;
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, opacity: 0.06 },
  glowTop: { top: -130, right: -110 },
  glowBottom: { bottom: -150, left: -120 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 30, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  headerSpacer: { width: 44, height: 44 },
  intro: { alignItems: 'center', marginTop: 34, marginBottom: spacing.xl },
  description: { fontSize: typography.size.md, lineHeight: spacing.xl, fontWeight: typography.weight.regular, textAlign: 'center' },
  form: {
    borderWidth: border.thin,
    borderRadius: radius.lg + 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  fieldGroup: { gap: spacing.sm },
  label: { fontSize: typography.size.sm + 1, lineHeight: 21, fontWeight: typography.weight.bold },
  passwordField: { minHeight: 58, borderWidth: border.thin, borderRadius: radius.lg - 1, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  passwordInput: { flex: 1, minWidth: 0, minHeight: 54, paddingVertical: 0, fontSize: typography.size.sm + 1, fontWeight: typography.weight.regular },
  eyeButton: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  fieldError: { marginTop: -spacing.sm, fontSize: typography.size.xs + 1, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.semibold },
  requirements: { marginTop: spacing.xs, gap: spacing.sm },
  requirementsTitle: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.extraBold },
  requirementRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  requirementIcon: { width: 22, height: 22, borderWidth: border.thin, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center' },
  requirementText: { flex: 1, fontSize: typography.size.xs + 1, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.semibold },
  submitButton: { minHeight: 58, borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.xxl },
  submitGradient: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: palette.white, fontSize: 18, lineHeight: spacing.xl, fontWeight: typography.weight.bold },
});
