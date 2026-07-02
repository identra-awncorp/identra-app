import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { BillPaymentScreen } from '@/screens/payment';

export default function PaymentBillRoute() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();
  const { colors } = useAppRouterState();

  return <BillPaymentScreen colors={colors} initialCategoryId={category} onBack={() => router.replace('/payment')} />;
}
