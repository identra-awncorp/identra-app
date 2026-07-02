import { useRouter, type Href } from 'expo-router';

import { TransferRecipientScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentTransferRecipientRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return (
    <TransferRecipientScreen
      colors={colors}
      onBack={() => router.replace('/payment')}
      onSelectRecipient={(recipient) => router.push({ pathname: '/payment-transfer-amount', params: { recipientId: recipient.id } } as unknown as Href)}
    />
  );
}
