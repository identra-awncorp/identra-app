import { View } from 'react-native';

import type { AppColors } from '../../../theme';
import { paymentHomeStyles as styles } from './paymentHomeStyles';

export function PaymentPaginationDots({
  activeIndex,
  colors,
  compact = false,
  count,
}: {
  activeIndex: number;
  colors: AppColors;
  compact?: boolean;
  count: number;
}) {
  return (
    <View style={[styles.pagination, compact && styles.paginationCompact]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            compact && styles.paginationDotCompact,
            {
              width: activeIndex === index ? (compact ? 18 : 26) : compact ? 8 : 16,
              backgroundColor: activeIndex === index ? colors.primaryDark : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}
