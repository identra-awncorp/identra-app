import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { PaymentAccountDetailScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentAccountDetailRoute() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId?: string | string[] }>();
  const { colors } = useAppRouterState();

  return (
    <PaymentAccountDetailScreen
      cardId={cardId}
      colors={colors}
      onBack={() => router.replace('/payment')}
      onManageCard={(card) => router.push({ pathname: '/payment-card-manage', params: { cardId: card.id } } as unknown as Href)}
    />
  );
}
