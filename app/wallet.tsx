import { useRouter } from 'expo-router';

import { WalletScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function WalletRoute() {
  const router = useRouter();
  const store = useAppStore();
  const {
    colors,
    openSideMenu,
    setChatReturnScreen,
    setReturnScreen,
    setSelectedCredential,
  } = useAppRouterState();

  return (
    <WalletScreen
      colors={colors}
      credentials={store.credentials}
      did={store.profile.did}
      onOpenActivity={() => router.push('/activity')}
      onOpenChat={() => {
        setChatReturnScreen('wallet');
        router.replace('/chat-list');
      }}
      onOpenCredential={(credential) => {
        setSelectedCredential(credential);
        router.push('/credential-detail');
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
