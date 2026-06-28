import { Redirect, useRouter } from 'expo-router';

import { ShareScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ShareRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, selectedCredential, setSharePayload } = useAppRouterState();
  const credential = selectedCredential ?? store.credentials.find((item) => item.status === 'verified') ?? store.credentials[0];

  if (!credential) return <Redirect href="/credentials" />;

  return (
    <ShareScreen
      colors={colors}
      credential={credential}
      onBack={() => router.replace(selectedCredential ? '/credential-detail' : '/wallet')}
      onShared={(items) => {
        store.addLog(
          'Chia sẻ dữ liệu',
          `Đã chia sẻ ${items.length} trường dữ liệu từ ${credential.title} theo sự đồng ý của bạn.`,
          'Bên nhận được xác minh',
          'share',
        );
        setSharePayload({ credential, attributes: items });
        router.push('/share-qr');
      }}
    />
  );
}
