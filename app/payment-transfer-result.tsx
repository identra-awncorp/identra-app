import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { TransferResultScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentTransferResultRoute() {
  const router = useRouter();
  const { amount, note, recipientId } = useLocalSearchParams<{
    amount?: string | string[];
    note?: string | string[];
    recipientId?: string | string[];
  }>();
  const { colors } = useAppRouterState();

  return (
    <TransferResultScreen
      amount={amount}
      colors={colors}
      note={note}
      recipientId={recipientId}
      onBackHome={() => router.replace('/payment')}
      onOpenReceipt={(receipt) =>
        router.push({
          pathname: '/payment-transfer-receipt',
          params: {
            amount: String(receipt.amount),
            note: receipt.note,
            recipientId: receipt.recipient.id,
          },
        } as unknown as Href)
      }
    />
  );
}
