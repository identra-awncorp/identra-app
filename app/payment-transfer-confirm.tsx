import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { TransferConfirmScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useAppStore } from '@/store';

export default function PaymentTransferConfirmRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { amount, note, recipientId } = useLocalSearchParams<{
    amount?: string | string[];
    note?: string | string[];
    recipientId?: string | string[];
  }>();
  const { colors } = useAppRouterState();
  const normalizedRecipientId = Array.isArray(recipientId) ? recipientId[0] : recipientId;

  return (
    <TransferConfirmScreen
      amount={amount}
      colors={colors}
      confirmBeforeTransfer={store.settings.flowSettings.payment.confirmBeforeTransfer}
      note={note}
      recipientId={recipientId}
      onBack={() =>
        router.replace({ pathname: '/payment-transfer-amount', params: { recipientId: normalizedRecipientId ?? '' } } as unknown as Href)
      }
      onComplete={(receipt) =>
        router.replace({
          pathname: '/payment-transfer-result',
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
