import { useRouter } from 'expo-router';

import { useWalletList, WalletScreen } from '@/screens/identity';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function WalletRoute() {
  const router = useRouter();
  const { colors, openSideMenu, setChatReturnScreen, setReturnScreen } = useAppRouterState();
  const { state } = useWalletList();

  return (
    <WalletScreen
      colors={colors}
      documents={state.phase === 'ready' ? state.items : state.phase === 'failed' ? [] : null}
      onOpenActivity={() => router.push('/activity')}
      onOpenChat={() => {
        setChatReturnScreen('wallet');
        router.replace('/chat-list');
      }}
      onOpenCredential={(credentialId) => {
        router.push({ pathname: '/credentials/[credentialId]', params: { credentialId } });
      }}
      onOpenCredentials={() => {
        setReturnScreen('wallet');
        router.push('/credentials');
      }}
      onOpenMenu={openSideMenu}
      onOpenNotifications={() => {
        setReturnScreen('wallet');
        router.push('/notifications');
      }}
      onOpenProfile={() => {
        setReturnScreen('wallet');
        router.push('/profile');
      }}
      onOpenScan={() => router.push('/scan')}
      onOpenSecurity={() => {
        setReturnScreen('wallet');
        router.push('/security');
      }}
      onOpenShare={() => router.push('/share')}
    />
  );
}
