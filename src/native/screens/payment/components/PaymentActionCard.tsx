import { Pressable, Text, View } from 'react-native';

import { useI18n } from '../../../i18n';
import { isPaymentActionComingSoon } from '../../../domain/payment/paymentAvailability';
import type { AppColors } from '../../../theme';
import { paymentActionLabel, paymentT } from '../paymentI18n';
import type { PaymentAction } from '../paymentTypes';
import { paymentHomeStyles as styles } from './paymentHomeStyles';

export function PaymentActionCard({
  action,
  colors,
  compact = false,
  onPress,
  width,
}: {
  action: PaymentAction;
  colors: AppColors;
  compact?: boolean;
  onPress: () => void;
  width: number;
}) {
  const { t } = useI18n();
  const Icon = action.icon;
  const label = paymentActionLabel(t, action);
  const comingSoon = isPaymentActionComingSoon(action.id);
  const accessibilityLabel = comingSoon ? `${label}, ${paymentT(t, 'home.comingSoon')}` : label;
  const iconSize = 26;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        compact && styles.actionCardCompact,
        {
          width,
          backgroundColor: 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.actionIconWrap, compact && styles.actionIconWrapCompact, { backgroundColor: action.background }]}>
        <Icon color={action.color} size={iconSize} strokeWidth={2} />
      </View>
      <Text numberOfLines={compact ? 3 : 2} style={[styles.actionLabel, compact && styles.actionLabelCompact, { color: colors.text }]}>
        {label}
      </Text>
      {comingSoon ? (
        <View style={[styles.actionSoonBadge, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
          <Text style={[styles.actionSoonText, { color: colors.primaryDark }]}>{paymentT(t, 'home.comingSoon')}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
