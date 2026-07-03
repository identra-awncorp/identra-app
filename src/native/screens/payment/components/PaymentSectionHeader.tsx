import { Pressable, Text, View } from 'react-native';

import type { AppColors } from '../../../theme';
import { paymentHomeStyles as styles } from './paymentHomeStyles';

export function PaymentSectionHeader({
  action,
  colors,
  onAction,
  title,
}: {
  action?: string;
  colors: AppColors;
  onAction?: () => void;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text numberOfLines={1} style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
      {action ? (
        <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction} hitSlop={8}>
          <Text numberOfLines={1} style={[styles.sectionAction, { color: colors.primaryDark }]}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
