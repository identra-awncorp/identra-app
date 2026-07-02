import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { TransferAmountScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentTransferAmountRoute() {
  const router = useRouter();
  const { recipientId } = useLocalSearchParams<{ recipientId?: string | string[] }>();
  const { colors } = useAppRouterState();

  return (
    <TransferAmountScreen
      colors={colors}
      recipientId={recipientId}
      onBack={() => router.replace('/payment-transfer-recipient' as Href)}
      onContinue={(draft) =>
        router.push({
          pathname: '/payment-transfer-confirm',
          params: {
            amount: String(draft.amount),
            note: draft.note,
            recipientId: draft.recipient.id,
          },
        } as unknown as Href)
      }
    />
  );
}
