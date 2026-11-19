// Small building blocks shared by the wallet screens (receive, list, detail, restore).
import { CircleAlert } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import type { FailureView } from '../../../domain/wallet/walletMessages';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, radius, spacing, touchTarget, typography } from '../../../theme';

/** A flat block: surface, hairline border, no shadow (design.md §8, §18). */
export function Panel({ colors, children, style }: { colors: AppColors; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

/** What failed, in one or two sentences, inside the block that failed (never a raw code). */
export function FailureNotice({ colors, failure, showTitle = true }: { colors: AppColors; failure: FailureView; showTitle?: boolean }) {
  const { t } = useI18n();
  return (
    <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
      <CircleAlert color={colors.danger} size={20} strokeWidth={2} style={styles.noticeIcon} />
      <View style={styles.noticeText}>
        {showTitle ? <Text style={[styles.noticeTitle, { color: colors.text }]}>{t(failure.titleKey)}</Text> : null}
        <Text style={[styles.noticeBody, { color: colors.text }]}>{t(failure.sentenceKey)}</Text>
        {failure.detailKey ? <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>{t(failure.detailKey)}</Text> : null}
      </View>
    </View>
  );
}

/** A text action at touch-target height (secondary and destructive actions). */
export function TextAction({ colors, label, onPress, tone = 'primary', disabled = false }: { colors: AppColors; label: string; onPress: () => void; tone?: 'primary' | 'danger'; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.textAction, { opacity: disabled ? 0.5 : pressed ? 0.6 : 1 }]}
    >
      <Text style={[styles.textActionLabel, { color: tone === 'danger' ? colors.danger : colors.primaryDark }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * The PIN boxes over one hidden TextInput: numeric keypad, paste works (the whole code lands at
 * once), the next box lights up as digits arrive. The value lives in the caller's state only.
 */
export function PinCodeInput({
  colors,
  length,
  numeric,
  value,
  onChangeText,
  error,
  label,
  editable = true,
}: {
  colors: AppColors;
  length: number;
  numeric: boolean;
  value: string;
  onChangeText: (text: string) => void;
  error: boolean;
  label: string;
  editable?: boolean;
}) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const { t } = useI18n();
  // Screen readers hear the label and how many digits are in, never the digits themselves.
  const progress = t('wallet.receive.pinProgress', { count: value.length, length });
  return (
    <Pressable accessible={false} onPress={() => inputRef.current?.focus()} style={styles.pinArea}>
      <View pointerEvents="none" style={styles.pinBoxes}>
        {Array.from({ length }).map((_, index) => {
          const active = focused && index === Math.min(value.length, length - 1);
          const borderColor = error ? colors.danger : active ? colors.primaryDark : colors.border;
          return (
            <View key={index} style={[styles.pinBox, { backgroundColor: colors.surface, borderColor, borderWidth: active || error ? border.thick : border.medium }]}>
              <Text style={[styles.pinDigit, { color: colors.text }]}>{value[index] ? '•' : ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        accessibilityLabel={`${label}. ${progress}`}
        accessibilityValue={{ text: progress }}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        caretHidden
        contextMenuHidden={false}
        editable={editable}
        importantForAutofill="no"
        keyboardType={numeric ? 'number-pad' : 'default'}
        maxLength={length}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        secureTextEntry
        style={styles.pinHiddenInput}
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}

export const walletStyles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.lg },
  title: { fontSize: typography.size.xl, lineHeight: 34, fontWeight: typography.weight.extraBold, letterSpacing: -0.5 },
  lead: { fontSize: typography.size.md, lineHeight: 23 },
  meta: { fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.medium },
  label: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.semibold },
  value: { fontSize: typography.size.md, lineHeight: 22, fontWeight: typography.weight.semibold },
  sectionTitle: { fontSize: typography.size.md, lineHeight: 22, fontWeight: typography.weight.extraBold },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  divider: { height: StyleSheet.hairlineWidth },
  actions: { gap: spacing.sm },
  center: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
});

const styles = StyleSheet.create({
  panel: { borderWidth: border.thin, borderRadius: radius.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  notice: { flexDirection: 'row', gap: spacing.md, borderRadius: radius.lg, padding: spacing.lg },
  noticeIcon: { marginTop: 1 },
  noticeText: { flex: 1, gap: spacing.xs },
  noticeTitle: { fontSize: typography.size.md, lineHeight: 22, fontWeight: typography.weight.bold },
  noticeBody: { fontSize: typography.size.sm, lineHeight: 21 },
  textAction: { minHeight: touchTarget.minimum, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  textActionLabel: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  pinArea: { paddingVertical: spacing.xs },
  pinBoxes: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  pinBox: { flex: 1, maxWidth: 52, height: 58, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  pinDigit: { fontSize: typography.size.xl, fontWeight: typography.weight.extraBold },
  pinHiddenInput: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.011, color: 'transparent' },
});
