import { useRouter } from 'expo-router';

import { RegisterScreen } from '@/screens/auth';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { getPathForScreen, initialScreen } from '@/app/navigation/navigationConfig';
import {
  persistAuthSuccess,
  setRegistrationPassword,
  startRegistration,
  verifyRegistration,
} from '@/domain/auth';

export default function RegisterRoute() {
  const router = useRouter();
  const { colors, completeAuth } = useAppRouterState();

  return (
    <RegisterScreen
      colors={colors}
      onBack={() => router.replace({ pathname: '/onboarding', params: { slide: 'last' } })}
      onSetRegistrationPassword={async ({ password, registrationToken }) => {
        const result = await setRegistrationPassword({ password, registrationToken });
        const session = await persistAuthSuccess(result);
        completeAuth(session);
      }}
      onStartRegistration={(phoneNumber) => startRegistration(phoneNumber)}
      onVerifyRegistration={async ({ challengeId, otpCode, phoneNumber }) => {
        const result = await verifyRegistration({
          challengeId,
          otpCode,
          phone: phoneNumber,
        });

        return result.registration.registrationToken;
      }}
      onRegistered={() => router.replace(getPathForScreen(initialScreen))}
      onLogin={() => router.replace('/login')}
    />
  );
}
