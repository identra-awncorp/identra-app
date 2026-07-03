import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { PaymentAccountDetailScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useAppStore } from '@/store';

export default function PaymentAccountDetailRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { cardId } = useLocalSearchParams<{ cardId?: string | string[] }>();
  const { colors } = useAppRouterState();

  return (
    <PaymentAccountDetailScreen
      cardId={cardId}
      colors={colors}
      onBack={() => router.replace('/payment')}
      onManageCard={(card) => router.push({ pathname: '/payment-card-manage', params: { cardId: card.id } } as unknown as Href)}
      requireAuthForCvv={store.settings.flowSettings.payment.requireAuthForCvv}
    />
  );
}
