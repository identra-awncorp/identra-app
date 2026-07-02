import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { isPaymentExploreActionComingSoon } from '@/domain/payment/paymentAvailability';
import { useI18n } from '@/i18n';
import { PaymentExploreDetailScreen } from '@/screens/payment';
import { paymentT } from '@/screens/payment/paymentI18n';

export default function PaymentExploreDetailRoute() {
  const router = useRouter();
  const { itemId, section } = useLocalSearchParams<{ itemId?: string | string[]; section?: string | string[] }>();
  const { colors } = useAppRouterState();
  const { t } = useI18n();

  return (
    <PaymentExploreDetailScreen
      colors={colors}
      itemId={itemId}
      section={section}
      onBack={() => router.replace('/payment' as Href)}
      onPrimaryAction={(detail) => {
        if (isPaymentExploreActionComingSoon(detail.actionTarget)) {
          Alert.alert(paymentT(t, 'flow.comingSoon'), paymentT(t, 'flow.comingSoonAlert'));
          return;
        }

        if (detail.actionTarget === 'bill') {
          router.push('/payment-bill' as Href);
          return;
        }

        if (detail.actionTarget === 'card' || detail.actionTarget === 'security') {
          router.push({ pathname: '/payment-card-manage', params: { cardId: 'main-card' } } as unknown as Href);
          return;
        }

        if (detail.actionTarget === 'activate') {
          Alert.alert(paymentT(t, 'explore.alerts.activatedTitle'), paymentT(t, 'explore.alerts.activatedDescription', { title: detail.title }));
          return;
        }

        if (detail.actionTarget === 'saving') {
          Alert.alert(paymentT(t, 'explore.alerts.savingTitle'), paymentT(t, 'explore.alerts.savingDescription'));
          return;
        }

        Alert.alert(paymentT(t, 'explore.alerts.recordedTitle'), paymentT(t, 'explore.alerts.recordedDescription', { title: detail.title }));
      }}
    />
  );
}
