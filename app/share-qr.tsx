import { Redirect, useRouter } from 'expo-router';

import { ShareQrScreen } from '@/screens/identity';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ShareQrRoute() {
  const router = useRouter();
  const { colors, setSharePayload, sharePayload } = useAppRouterState();

  if (!sharePayload) return <Redirect href="/wallet" />;

  return (
    <ShareQrScreen
      colors={colors}
      credential={sharePayload.credential}
      attributes={sharePayload.attributes}
      onBack={() =>
        router.replace({ pathname: '/share', params: { credentialId: sharePayload.credential.id } })
      }
      onCancel={() => {
        setSharePayload(null);
        router.replace('/activity');
      }}
    />
  );
}
