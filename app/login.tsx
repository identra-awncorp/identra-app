import { useState } from 'react';
import { useRouter } from 'expo-router';

import { LoginScreen } from '@/screens/auth';
import { AuthNoticeModal, type AuthNotice } from '@/screens/auth/AuthNoticeModal';
import { OtpVerificationScreen } from '@/screens/auth/OtpVerificationScreen';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { getPathForScreen, initialScreen } from '@/app/navigation/navigationConfig';
import { useI18n } from '@/i18n';
import {
  getAuthErrorMessage,
  isAuthSuccess,
  persistAuthSuccess,
  startLogin,
  verifyLogin,
  type AuthChallenge,
  type AuthSuccess,
} from '@/domain/auth';

export default function LoginRoute() {
  const router = useRouter();
  const { colors, completeAuth } = useAppRouterState();
  const { t } = useI18n();
  const [loginChallenge, setLoginChallenge] = useState<AuthChallenge | null>(null);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [pendingPassword, setPendingPassword] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const finishLogin = async (result: AuthSuccess) => {
    const session = await persistAuthSuccess(result);
    completeAuth(session);
    router.replace(getPathForScreen(initialScreen));
  };

  const submitLogin = async (phone: string, password: string) => {
    setSubmitting(true);

    try {
      const result = await startLogin({ password, phone });

      if (isAuthSuccess(result)) {
        await finishLogin(result);
        return;
      }

      setPendingPassword(password);
      setPendingPhone(phone);
      setLoginChallenge(result);
    } catch (error) {
      setNotice({
        title: t('auth.login.errorTitle'),
        description: getAuthErrorMessage(error),
        tone: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resendLoginCode = async () => {
    const result = await startLogin({ password: pendingPassword, phone: pendingPhone });

    if (isAuthSuccess(result)) {
      await finishLogin(result);
      return undefined;
    }

    setLoginChallenge(result);
    return result;
  };

  const verifyLoginCode = async (otpCode: string) => {
    if (!loginChallenge) return;

    const result = await verifyLogin({
      challengeId: loginChallenge.challengeId,
      otpCode,
      phone: pendingPhone,
    });

    await finishLogin(result);
  };

  if (loginChallenge) {
    return (
      <OtpVerificationScreen
        challenge={loginChallenge}
        colors={colors}
        phoneNumber={pendingPhone}
        onBack={() => setLoginChallenge(null)}
        onChangePhone={() => setLoginChallenge(null)}
        onResend={resendLoginCode}
        onVerified={verifyLoginCode}
      />
    );
  }

  return (
    <>
      <LoginScreen
        colors={colors}
        onBack={() => router.replace({ pathname: '/onboarding', params: { slide: 'last' } })}
        onContinue={(phone, password) => {
          void submitLogin(phone, password);
        }}
        onRegister={() => router.replace('/register')}
        submitting={submitting}
      />
      <AuthNoticeModal actionLabel={t('common.close')} colors={colors} notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
