import { useRouter } from 'expo-router';

import { RegisterScreen } from '@/screens/auth';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function RegisterRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return (
      <RegisterScreen
      colors={colors}
      onBack={() => router.replace({ pathname: '/onboarding', params: { slide: 'last' } })}
      onRegistered={() => router.replace('/login')}
      onLogin={() => router.replace('/login')}
    />
  );
}
