import { useRouter } from 'expo-router';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { PhoneTopUpScreen } from '@/screens/payment';

export default function PaymentPhoneRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <PhoneTopUpScreen colors={colors} onBack={() => router.replace('/payment')} />;
}
