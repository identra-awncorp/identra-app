import { useLocalSearchParams, useRouter } from 'expo-router';

import { PaymentCardManageScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentCardManageRoute() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId?: string | string[] }>();
  const { colors } = useAppRouterState();

  return <PaymentCardManageScreen cardId={cardId} colors={colors} onBack={() => router.replace('/payment')} />;
}
