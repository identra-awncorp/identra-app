import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useI18n } from '@/i18n';

import { useWalletList, WalletScreen } from '@/screens/identity';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function WalletRoute() {
  const router = useRouter();
  const { colors, openSideMenu, setChatReturnScreen, setReturnScreen } = useAppRouterState();
  const { state, reload } = useWalletList();
  const { t } = useI18n();

  return (
    <WalletScreen
      colors={colors}
      walletState={state}
      onOpenRestore={() => router.push('/wallet-restore')}
      onRetry={reload}
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
      onOpenShare={() =>
        // Credentials are shared only by scanning the verifier's QR code (OpenID4VP).
        Alert.alert(t('wallet.present.shareEntryTitle'), t('wallet.present.shareEntryBody'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('wallet.present.openScanner'), onPress: () => router.push('/scan') },
        ])
      }
    />
  );
}
