import { useLocalSearchParams, useRouter } from 'expo-router';

import { TransactionReceiptScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentTransferReceiptRoute() {
  const router = useRouter();
  const { amount, note, recipientId } = useLocalSearchParams<{
    amount?: string | string[];
    note?: string | string[];
    recipientId?: string | string[];
  }>();
  const { colors } = useAppRouterState();

  return (
    <TransactionReceiptScreen
      amount={amount}
      colors={colors}
      note={note}
      recipientId={recipientId}
      onBack={() => router.back()}
    />
  );
}
