import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useI18n } from '../../../i18n';
import { spacing } from '../../../theme';
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
  const visibleColumnCount = 4;
  const columnCount = Math.ceil(actions.length / 2);
  const columnStepWidth = itemWidth + spacing.sm;
  const dotCount = Math.max(1, columnCount - visibleColumnCount + 1);
  const [activeDotIndex, setActiveDotIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const nextIndex = Math.min(dotCount - 1, Math.max(0, Math.round(contentOffset.x / columnStepWidth)));

    setActiveDotIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
  };

  return (
    <>
      <PaymentSectionHeader title={paymentT(t, 'home.sections.quickAccess')} action={paymentT(t, 'home.sections.edit')} colors={colors} onAction={onEdit} />
      <View style={[styles.quickPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScroller}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
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
        <PaymentPaginationDots count={dotCount} activeIndex={activeDotIndex} colors={colors} compact />
      </View>
    </>
  );
}
