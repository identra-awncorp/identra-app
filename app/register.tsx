import { useRouter } from 'expo-router';

import { RegisterScreen } from '@/screens/auth';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { getPathForScreen, initialScreen } from '@/app/navigation/navigationConfig';

export default function RegisterRoute() {
  const router = useRouter();
  const { colors, completeAuth } = useAppRouterState();

  return (
    <RegisterScreen
      colors={colors}
      onBack={() => router.replace('/onboarding')}
      onContinue={() => {
        completeAuth();
        router.replace(getPathForScreen(initialScreen));
      }}
      onLogin={() => router.replace('/login')}
    />
  );
}
