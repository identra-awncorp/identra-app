import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/screens/auth';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function OnboardingRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return (
    <OnboardingScreen
      colors={colors}
      onLogin={() => router.replace('/login')}
      onRegister={() => router.replace('/register')}
    />
  );
}
