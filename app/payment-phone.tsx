import { useRouter } from 'expo-router';

import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useAppStore } from '@/store';
import { PhoneTopUpScreen } from '@/screens/payment';

export default function PaymentPhoneRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors } = useAppRouterState();

  return <PhoneTopUpScreen colors={colors} confirmBeforeTopup={store.settings.flowSettings.payment.confirmBeforeTopup} onBack={() => router.replace('/payment')} />;
}
