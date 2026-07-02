import { useRouter, type Href } from 'expo-router';

import { PaymentSearchScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentSearchRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();
  const openPaymentFlow = (flow: string) => {
    if (flow === 'transfer') {
      router.push('/payment-transfer-recipient' as Href);
      return;
    }

    if (flow === 'receive') {
      router.push('/payment-receive' as Href);
      return;
    }

    if (flow === 'phone') {
      router.push('/payment-phone' as Href);
      return;
    }

    if (flow === 'bill') {
      router.push('/payment-bill' as Href);
      return;
    }

    if (flow === 'history') {
      router.push('/payment-history' as Href);
      return;
    }

    router.push({ pathname: '/payment-flow', params: { flow } } as unknown as Href);
  };

  return (
    <PaymentSearchScreen
      colors={colors}
      onBack={() => router.replace('/payment')}
      onOpenFlow={openPaymentFlow}
    />
  );
}
