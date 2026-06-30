import { useLocalSearchParams, useRouter } from 'expo-router';

import { OnboardingScreen } from '@/screens/auth';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function OnboardingRoute() {
  const router = useRouter();
  const { slide } = useLocalSearchParams<{ slide?: string }>();
  const { colors } = useAppRouterState();

  return (
    <OnboardingScreen
      colors={colors}
      initialSlide={slide === 'last' ? 'last' : 'first'}
      onLogin={() => router.replace('/login')}
      onRegister={() => router.replace('/register')}
    />
  );
}
