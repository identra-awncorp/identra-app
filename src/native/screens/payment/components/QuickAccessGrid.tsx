import { ScrollView, View } from 'react-native';

import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { paymentT } from '../paymentI18n';
import type { PaymentAction } from '../paymentTypes';
import { PaymentActionCard } from './PaymentActionCard';
import { PaymentPaginationDots } from './PaymentPaginationDots';
import { PaymentSectionHeader } from './PaymentSectionHeader';
import { paymentHomeStyles as styles } from './paymentHomeStyles';

export function QuickAccessGrid({
  actions,
  colors,
  itemWidth,
  onAction,
  onEdit,
  trackWidth,
}: {
  actions: PaymentAction[];
  colors: AppColors;
  itemWidth: number;
  onAction: (action: PaymentAction) => void;
  onEdit: () => void;
  trackWidth: number;
}) {
  const { t } = useI18n();

  return (
    <>
      <PaymentSectionHeader title={paymentT(t, 'home.sections.quickAccess')} action={paymentT(t, 'home.sections.edit')} colors={colors} onAction={onEdit} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroller}>
        <View style={[styles.quickGrid, { width: trackWidth }]}>
          {actions.map((item) => (
            <PaymentActionCard
              key={item.id}
              action={item}
              colors={colors}
              width={itemWidth}
              onPress={() => onAction(item)}
            />
          ))}
        </View>
      </ScrollView>
      <PaymentPaginationDots count={4} activeIndex={0} colors={colors} compact />
    </>
  );
}
