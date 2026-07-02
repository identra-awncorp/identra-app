import { useRouter } from 'expo-router';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { ReceiveMoneyScreen } from '@/screens/payment';

export default function PaymentReceiveRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <ReceiveMoneyScreen colors={colors} onBack={() => router.replace('/payment')} />;
}
