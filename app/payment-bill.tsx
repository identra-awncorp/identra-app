import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useAppStore } from '@/store';
import { BillPaymentScreen } from '@/screens/payment';

export default function PaymentBillRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();
  const { colors } = useAppRouterState();

  return <BillPaymentScreen colors={colors} confirmBeforeBill={store.settings.flowSettings.payment.confirmBeforeBill} initialCategoryId={category} onBack={() => router.replace('/payment')} />;
}
