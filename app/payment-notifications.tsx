import { useRouter } from 'expo-router';

import { PaymentNotificationsScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentNotificationsRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <PaymentNotificationsScreen colors={colors} onBack={() => router.replace('/payment')} />;
}
