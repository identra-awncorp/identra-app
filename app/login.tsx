import { useRouter } from 'expo-router';

import { LoginScreen } from '@/screens/auth';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { getPathForScreen, initialScreen } from '@/app/navigation/navigationConfig';

export default function LoginRoute() {
  const router = useRouter();
  const { colors, completeAuth } = useAppRouterState();

  return (
    <LoginScreen
      colors={colors}
      onBack={() => router.replace('/onboarding')}
      onContinue={() => {
        completeAuth();
        router.replace(getPathForScreen(initialScreen));
      }}
      onRegister={() => router.replace('/register')}
    />
  );
}
