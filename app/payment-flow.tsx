import { useLocalSearchParams, useRouter } from 'expo-router';

import { PaymentFlowScreen } from '@/screens/payment';
import { getPaymentFlowConfig } from '@/data/demo/paymentFlowDemoData';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentFlowRoute() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string | string[] }>();
  const { colors } = useAppRouterState();

  return <PaymentFlowScreen colors={colors} config={getPaymentFlowConfig(flow)} onBack={() => router.replace('/payment')} />;
}
