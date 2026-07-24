import { useRouter, type Href } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, InteractionManager, StyleSheet, View } from 'react-native';

import { ChatListScreen } from '../../screens/chat-list';
import { MiniAppScreen } from '../../screens/mini-app';
import { NewsFeedScreen } from '../../screens/news-feed';
import { PaymentScreen } from '../../screens/payment';
import { QrScannerScreen } from '../../screens/scan';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store';
import type { ScreenKey } from '../../types';
import { TEMPORARY_QR_TTL_MS } from '../../domain/credentials/credentialSharing';
import { useAppRouterState } from './AppRouterContext';

export type KeepAliveMainScreen = Extract<ScreenKey, 'chat-list' | 'news-feed' | 'scan' | 'payment' | 'mini-app'>;

export const keepAliveMainScreens: KeepAliveMainScreen[] = [
  'chat-list',
  'news-feed',
  'scan',
  'payment',
  'mini-app',
];

const stagedWarmScreens: KeepAliveMainScreen[] = ['chat-list', 'news-feed', 'payment', 'mini-app'];

export function isKeepAliveMainScreen(screen: ScreenKey | null): screen is KeepAliveMainScreen {
  return Boolean(screen && keepAliveMainScreens.includes(screen as KeepAliveMainScreen));
}

export function MainTabKeepAliveScreens({ activeScreen }: { activeScreen: KeepAliveMainScreen | null }) {
  const router = useRouter();
  const store = useAppStore();
  const { t } = useI18n();
  const {
    colors,
    connectionInvitation,
    newsFeedChromeProgress,
    newsFeedScrollY,
    openSideMenu,
    setChatReturnScreen,
    setConnectionInvitation,
    setReturnScreen,
    setSelectedChatId,
  } = useAppRouterState();
  const [mountedScreens, setMountedScreens] = useState<Record<KeepAliveMainScreen, boolean>>(() => ({
    'chat-list': activeScreen === 'chat-list',
    'news-feed': activeScreen === 'news-feed',
    scan: activeScreen === 'scan',
    payment: activeScreen === 'payment',
    'mini-app': activeScreen === 'mini-app',
  }));

  useEffect(() => {
    if (!activeScreen) return;
    setMountedScreens((current) => (
      current[activeScreen] ? current : { ...current, [activeScreen]: true }
    ));
  }, [activeScreen]);

  useEffect(() => {
    if (!activeScreen) return undefined;

    let cancelled = false;
    let animationFrame: number | null = null;
    let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;
    const pendingScreens = stagedWarmScreens.filter((screen) => screen !== activeScreen);

    const warmNextScreen = () => {
      interactionTask = InteractionManager.runAfterInteractions(() => {
        if (cancelled) return;

        const screen = pendingScreens.shift();
        if (!screen) return;

        setMountedScreens((current) => (
          current[screen] ? current : { ...current, [screen]: true }
        ));
        animationFrame = requestAnimationFrame(warmNextScreen);
      });
    };

    warmNextScreen();

    return () => {
      cancelled = true;
      interactionTask?.cancel();
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [activeScreen]);

  return (
    <View pointerEvents={activeScreen ? 'auto' : 'none'} style={styles.root}>
      <KeepAliveLayer active={activeScreen === 'chat-list'} mounted={mountedScreens['chat-list']}>
        <ChatListScreen
          colors={colors}
          onOpenConversation={(conversationId) => {
            setSelectedChatId(conversationId);
            router.push('/chat');
          }}
          onOpenMenu={openSideMenu}
        />
      </KeepAliveLayer>

      <KeepAliveLayer active={activeScreen === 'news-feed'} mounted={mountedScreens['news-feed']}>
        <NewsFeedScreen
          colors={colors}
          overlayProgress={newsFeedChromeProgress}
          scrollY={newsFeedScrollY}
          onOpenCompose={() => router.push('/compose-post')}
          onOpenLiveStream={() => router.push('/live-stream')}
          onOpenMenu={openSideMenu}
          onOpenNotifications={() => {
            setReturnScreen('news-feed');
            router.push('/notifications');
          }}
          onOpenSearch={() => router.push('/news-feed-search')}
          onOpenSmartContractDetail={(post) => {
            router.push({ pathname: '/smart-contracts/[postId]', params: { postId: post.id } });
          }}
        />
      </KeepAliveLayer>

      <KeepAliveLayer active={activeScreen === 'scan'} mounted={mountedScreens.scan}>
        <QrScannerScreen
          active={activeScreen === 'scan'}
          colors={colors}
          onOpenActivity={() => router.push('/activity')}
          onOpenMenu={openSideMenu}
          onOpenChat={() => {
            setChatReturnScreen('scan');
            router.replace('/chat-list');
          }}
          onOpenMyQr={() => {
            const activeInvitation =
              connectionInvitation &&
              connectionInvitation.createdAt + TEMPORARY_QR_TTL_MS > Date.now();

            if (activeInvitation) {
              router.push('/connection-qr');
              return;
            }

            const createdAt = Date.now();
            const id = `connection-invitation-${createdAt}`;
            store.addActivityLog({
              id,
              timestamp: new Date(createdAt).toISOString(),
              expiresAt: new Date(createdAt + TEMPORARY_QR_TTL_MS).toISOString(),
              type: 'share',
              status: 'pending',
              title: t('activityLogs.connectionInvitationTitle'),
              description: t('activityLogs.pending'),
              partner: t('activityLogs.connectionInvitationPartner'),
            });
            setConnectionInvitation({ id, createdAt });
            router.push('/connection-qr');
          }}
        />
      </KeepAliveLayer>

      <KeepAliveLayer active={activeScreen === 'payment'} mounted={mountedScreens.payment}>
        <PaymentScreen
          active={activeScreen === 'payment'}
          colors={colors}
          paymentSettings={store.settings.flowSettings.payment}
          onOpenMenu={openSideMenu}
          onOpenSearch={() => router.push('/payment-search' as Href)}
          onOpenNotifications={() => router.push('/payment-notifications' as Href)}
          onOpenCardDetail={(card) => router.push({ pathname: '/payment-account-detail', params: { cardId: card.id } } as unknown as Href)}
          onManageCard={(card) => router.push({ pathname: '/payment-card-manage', params: { cardId: card.id } } as unknown as Href)}
          onOpenQuickAction={(action) => {
            if (action.id === 'transfer') {
              router.push('/payment-transfer-recipient' as Href);
              return;
            }

            if (action.id === 'receive') {
              router.push('/payment-receive' as Href);
              return;
            }

            if (action.id === 'phone') {
              router.push('/payment-phone' as Href);
              return;
            }

            if (action.id === 'bill') {
              router.push('/payment-bill' as Href);
              return;
            }

            if (action.id === 'history') {
              router.push('/payment-history' as Href);
              return;
            }

            if (action.id === 'utilities') {
              router.push({ pathname: '/payment-bill', params: { category: 'electric' } } as unknown as Href);
              return;
            }

            router.push({ pathname: '/payment-flow', params: { flow: action.id } } as unknown as Href);
          }}
          onOpenSuggestion={(action) => {
            router.push({ pathname: '/payment-explore-detail', params: { section: 'suggestion', itemId: action.id } } as unknown as Href);
          }}
          onOpenOffer={(offer) => {
            router.push({ pathname: '/payment-explore-detail', params: { section: 'offer', itemId: offer.id } } as unknown as Href);
          }}
        />
      </KeepAliveLayer>

      <KeepAliveLayer active={activeScreen === 'mini-app'} mounted={mountedScreens['mini-app']}>
        <MiniAppScreen
          colors={colors}
          onOpenMenu={openSideMenu}
          onOpenNotifications={() => {
            setReturnScreen('mini-app');
            router.push('/notifications');
          }}
          onOpenSearch={() => {
            Alert.alert(t('miniApp.search.title'), t('miniApp.search.description'));
          }}
        />
      </KeepAliveLayer>
    </View>
  );
}

function KeepAliveLayer({
  active,
  children,
  mounted,
}: {
  active: boolean;
  children: ReactNode;
  mounted: boolean;
}) {
  if (!mounted) return null;

  return (
    <View
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      pointerEvents={active ? 'auto' : 'none'}
      style={[styles.layer, !active && styles.hiddenLayer]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  hiddenLayer: {
    opacity: 0,
  },
});
