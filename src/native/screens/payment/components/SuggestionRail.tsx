import { ScrollView } from 'react-native';

import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { paymentT } from '../paymentI18n';
import type { PaymentAction } from '../paymentTypes';
import { PaymentActionCard } from './PaymentActionCard';
import { PaymentSectionHeader } from './PaymentSectionHeader';
import { paymentHomeStyles as styles } from './paymentHomeStyles';

export function SuggestionRail({
  actions,
  colors,
  itemWidth,
  onAction,
  onMore,
}: {
  actions: PaymentAction[];
  colors: AppColors;
  itemWidth: number;
  onAction: (action: PaymentAction) => void;
  onMore?: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      <PaymentSectionHeader
        title={paymentT(t, 'home.sections.suggestions')}
        action={onMore ? paymentT(t, 'home.sections.viewMore') : undefined}
        colors={colors}
        onAction={onMore}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionScroller}>
        {actions.map((item) => (
          <PaymentActionCard
            key={item.id}
            action={item}
            colors={colors}
            width={itemWidth}
            compact
            onPress={() => onAction(item)}
          />
        ))}
      </ScrollView>
    </>
  );
}
