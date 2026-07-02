import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Clock3, Loader2, ShieldAlert, WalletCards } from 'lucide-react-native';

import type { PaymentRequestFailureReason, PaymentRequestState } from '../../../domain/payment/paymentRequest';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, palette, radius, spacing, typography } from '../../../theme';
import { paymentT } from '../paymentI18n';

export function PaymentRequestFeedback({
  colors,
  onRetry,
  state,
}: {
  colors: AppColors;
  onRetry?: () => void;
  state: PaymentRequestState;
}) {
  const { t } = useI18n();

  if (state.status === 'idle') return null;

  const reason = state.status === 'loading' && state.duplicateBlocked ? 'duplicate_submit' : state.status === 'failed' ? state.reason : null;
  const config = reason ? getFailureConfig(reason, colors) : { icon: Loader2, color: colors.primaryDark, background: colors.surfaceMuted };
  const Icon = config.icon;
  const title = reason ? paymentT(t, `request.failures.${reason}.title`) : paymentT(t, 'request.loadingTitle');
  const description = reason ? paymentT(t, `request.failures.${reason}.description`) : paymentT(t, 'request.loadingDescription');
  const canRetry = state.status === 'failed' && reason !== 'insufficient_balance' && Boolean(onRetry);

  return (
    <View style={[styles.wrap, { backgroundColor: config.background, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        {state.status === 'loading' && !state.duplicateBlocked ? (
          <ActivityIndicator color={colors.primaryDark} />
        ) : (
          <Icon color={config.color} size={21} strokeWidth={2.2} />
        )}
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
        {canRetry ? (
          <Pressable accessibilityRole="button" accessibilityLabel={paymentT(t, 'request.retry')} onPress={onRetry} hitSlop={8}>
            <Text style={[styles.retry, { color: colors.primaryDark }]}>{paymentT(t, 'request.retry')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function getFailureConfig(reason: PaymentRequestFailureReason, colors: AppColors) {
  switch (reason) {
    case 'api_fail':
      return { icon: ShieldAlert, color: colors.danger, background: palette.red[100] };
    case 'duplicate_submit':
      return { icon: AlertTriangle, color: colors.warning, background: palette.orange[100] };
    case 'insufficient_balance':
      return { icon: WalletCards, color: colors.danger, background: palette.red[100] };
    case 'timeout':
      return { icon: Clock3, color: colors.warning, background: palette.orange[100] };
  }
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 78,
    borderWidth: border.hairline,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0 },
  title: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.black,
  },
  description: {
    marginTop: spacing.xxs,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  retry: {
    marginTop: spacing.sm,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.black,
  },
});
