import { useRouter, type Href } from 'expo-router';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { PaymentHistoryScreen } from '@/screens/payment';

export default function PaymentHistoryRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return (
    <PaymentHistoryScreen
      colors={colors}
      onBack={() => router.replace('/payment')}
      onOpenTransaction={(transaction) =>
        router.push({ pathname: '/payment-transaction-detail', params: { transactionId: transaction.id } } as unknown as Href)
      }
    />
  );
}
