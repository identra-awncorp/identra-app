import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { PaymentTransactionDetailScreen } from '@/screens/payment';

export default function PaymentTransactionDetailRoute() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams<{ transactionId?: string | string[] }>();
  const { colors } = useAppRouterState();

  return (
    <PaymentTransactionDetailScreen
      colors={colors}
      transactionId={transactionId}
      onBack={() => router.replace('/payment-history' as Href)}
    />
  );
}
