import { Redirect, useRouter } from 'expo-router';

import { ShareQrScreen } from '@/screens/identity';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ShareQrRoute() {
  const router = useRouter();
  const { colors, setSelectedCredential, setSharePayload, sharePayload } = useAppRouterState();

  if (!sharePayload) return <Redirect href="/wallet" />;

  return (
    <ShareQrScreen
      colors={colors}
      credential={sharePayload.credential}
      attributes={sharePayload.attributes}
      onBack={() => router.replace('/share')}
      onCancel={() => {
        setSharePayload(null);
        setSelectedCredential(null);
        router.replace('/activity');
      }}
    />
  );
}
