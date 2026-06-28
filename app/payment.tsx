import { PaymentScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PaymentRoute() {
  const { colors } = useAppRouterState();

  return <PaymentScreen colors={colors} />;
}
