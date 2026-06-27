import { StatusBar } from 'expo-status-bar';
import {
  BellRing,
  Building2,
  FileCheck2,
  House,
  MessageCircle,
  NotebookPen,
  Settings,
  Share2,
  ShieldCheck,
  UserRound,
  UserCheck,
  X,
} from 'lucide-react-native';
import { type ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { border, darkColors, layout, lightColors, palette, radius, shadows, spacing, touchTarget, typography } from './theme';
import type { Credential, ScreenKey, SmartContractFeedPost, TabKey } from './types';
import { useAppStore } from './store';
import { AppBrandLogo } from './components/AppLogo';
import {
  ChatNavIcon,
  IdentityNavIcon,
  NewsFeedNavIcon,
  PaymentNavIcon,
  ScanQrNavIcon,
  type BottomNavIconProps,
} from './components/icons/bottom-nav';
import { WalletScreen } from './screens/WalletScreen';
import { CredentialsScreen } from './screens/CredentialsScreen';
import {
  ConnectionQrScreen,
  CredentialDetailScreen,
  NotificationsScreen,
  ProfileScreen,
  SecurityScreen,
  ShareQrScreen,
  ShareScreen,
  SmartContractDetailScreen,
} from './screens/SecondaryScreens';
import { ScannerScreen } from './screens/ScannerScreens';
import { ChatListScreen } from './screens/ChatListScreen';
import { ChatScreen } from './screens/ChatScreen';
import { NEWS_FEED_OVERLAY_HEIGHT, NewsFeedScreen } from './screens/NewsFeedScreen';
import { LiveStreamScreen } from './screens/LiveStreamScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import {
  AboutScreen,
  ActivityScreen,
  BackupSettingsScreen,
  DataSettingsScreen,
  DisplaySettingsScreen,
  HelpScreen,
  SampleSettingsScreen,
  SettingsScreen,
} from './screens/MainScreens';

const tabScreens: Record<TabKey, ScreenKey> = {
  chat: 'chat-list',
  feed: 'news-feed',
  scan: 'scan',
  payment: 'payment',
  identity: 'wallet',
};

const bottomNavScreens = new Set<ScreenKey>(['chat-list', 'news-feed', 'scan', 'payment', 'wallet', 'credentials', 'notifications']);

export function IdentraApp() {
  const store = useAppStore();
  const systemScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<ScreenKey>('chat-list');
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [selectedSmartContractPost, setSelectedSmartContractPost] = useState<SmartContractFeedPost | null>(null);
  const [sharePayload, setSharePayload] = useState<{ credential: Credential; attributes: Credential['attributes'] } | null>(null);
  const [connectionInvitation, setConnectionInvitation] = useState<{ id: string; createdAt: number } | null>(null);
  const [returnScreen, setReturnScreen] = useState<ScreenKey>('chat-list');
  const [chatReturnScreen, setChatReturnScreen] = useState<ScreenKey>('chat-list');
  const [selectedChatId, setSelectedChatId] = useState('minh-anh');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authEntry, setAuthEntry] = useState<'onboarding' | 'login' | 'register'>('onboarding');
  const previousScreen = useRef<ScreenKey>('chat-list');
  const newsFeedScrollY = useRef(new Animated.Value(0)).current;

  const isDark = store.settings.theme === 'dark' || (store.settings.theme === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;
  const newsFeedChromeProgress = useMemo(
    () =>
      Animated.diffClamp(newsFeedScrollY, 0, NEWS_FEED_OVERLAY_HEIGHT).interpolate({
        inputRange: [0, NEWS_FEED_OVERLAY_HEIGHT],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    [newsFeedScrollY],
  );
  const activeTab: TabKey | null =
    screen === 'chat-list'
      ? 'chat'
      : screen === 'news-feed'
        ? 'feed'
        : screen === 'scan'
          ? 'scan'
          : screen === 'payment'
            ? 'payment'
            : screen === 'wallet' || screen === 'credentials'
              ? 'identity'
              : null;

  const showBottomNav = bottomNavScreens.has(screen);
  const unreadActivityCount = store.logs.filter((log) => log.unread).length;
  const openSideMenu = useCallback(() => setSideMenuOpen(true), []);

  useEffect(() => {
    if (screen === 'activity' && unreadActivityCount) store.markAllActivityLogsRead();
  }, [screen, store, unreadActivityCount]);

  useEffect(() => {
    if (previousScreen.current === 'activity' && screen !== 'activity') store.clearNewActivityHighlights();
    previousScreen.current = screen;
  }, [screen, store]);

  useEffect(() => {
    if (screen !== 'news-feed') newsFeedScrollY.setValue(0);
  }, [newsFeedScrollY, screen]);

  const screenContent = useMemo(() => {
    const openCredential = (credential: Credential) => {
      setSelectedCredential(credential);
      setScreen('credential-detail');
    };

    switch (screen) {
      case 'news-feed':
        return (
          <NewsFeedScreen
            colors={colors}
            overlayProgress={newsFeedChromeProgress}
            onOpenLiveStream={() => setScreen('live-stream')}
            onOpenMenu={openSideMenu}
            onOpenNotifications={() => {
              setReturnScreen('news-feed');
              setScreen('notifications');
            }}
            onOpenSmartContractDetail={(post) => {
              setSelectedSmartContractPost(post);
              setScreen('smart-contract-detail');
            }}
            scrollY={newsFeedScrollY}
          />
        );
      case 'live-stream':
        return <LiveStreamScreen colors={colors} onBack={() => setScreen('news-feed')} />;
      case 'smart-contract-detail':
        return selectedSmartContractPost ? (
          <SmartContractDetailScreen colors={colors} post={selectedSmartContractPost} onBack={() => setScreen('news-feed')} />
        ) : (
          <NewsFeedScreen
            colors={colors}
            overlayProgress={newsFeedChromeProgress}
            onOpenLiveStream={() => setScreen('live-stream')}
            onOpenMenu={openSideMenu}
            onOpenNotifications={() => {
              setReturnScreen('news-feed');
              setScreen('notifications');
            }}
            onOpenSmartContractDetail={(post) => {
              setSelectedSmartContractPost(post);
              setScreen('smart-contract-detail');
            }}
            scrollY={newsFeedScrollY}
          />
        );
      case 'payment':
        return <PaymentScreen colors={colors} />;
      case 'wallet':
        return (
          <WalletScreen
            colors={colors}
            credentials={store.credentials}
            did={store.profile.did}
            onOpenCredential={openCredential}
            onOpenCredentials={() => setScreen('credentials')}
            onOpenNotifications={() => {
              setReturnScreen('wallet');
              setScreen('notifications');
            }}
            onOpenProfile={() => {
              setReturnScreen('wallet');
              setScreen('profile');
            }}
            onOpenSecurity={() => {
              setReturnScreen('wallet');
              setScreen('security');
            }}
            onOpenShare={() => setScreen('share')}
            onOpenActivity={() => setScreen('activity')}
            onOpenScan={() => setScreen('scan')}
            onOpenChat={() => {
              setChatReturnScreen('wallet');
              setScreen('chat-list');
            }}
            onOpenMenu={openSideMenu}
          />
        );
      case 'credentials':
        return (
          <CredentialsScreen
            colors={colors}
            credentials={store.credentials}
            onBack={() => setScreen(returnScreen)}
            onOpenCredential={openCredential}
            onScan={() => setScreen('scan')}
          />
        );
      case 'credential-detail':
        return selectedCredential ? (
          <CredentialDetailScreen
            colors={colors}
            credential={selectedCredential}
            hideSensitive={store.settings.hideSensitiveData}
            onBack={() => setScreen('credentials')}
            onShare={() => setScreen('share')}
          />
        ) : (
          <CredentialsScreen
            colors={colors}
            credentials={store.credentials}
            onBack={() => setScreen('wallet')}
            onOpenCredential={openCredential}
            onScan={() => setScreen('scan')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            colors={colors}
            profile={store.profile}
            onBack={() => setScreen('wallet')}
            onSave={(profile) => {
              store.updateProfile(profile);
              store.addLog('Cập nhật hồ sơ', 'Thông tin cá nhân trong ví đã được cập nhật.', 'Hệ thống Identra', 'security');
              setScreen(returnScreen);
            }}
          />
        );
      case 'security':
        return (
          <SecurityScreen
            colors={colors}
            settings={store.settings}
            onBack={() => setScreen(returnScreen)}
            onSettings={store.updateSettings}
          />
        );
      case 'share': {
        const credential = selectedCredential ?? store.credentials.find((item) => item.status === 'verified') ?? store.credentials[0];
        return credential ? (
          <ShareScreen
            colors={colors}
            credential={credential}
            onBack={() => setScreen(selectedCredential ? 'credential-detail' : 'wallet')}
            onShared={(items) => {
              store.addLog(
                'Chia sẻ dữ liệu',
                `Đã chia sẻ ${items.length} trường dữ liệu từ ${credential.title} theo sự đồng ý của bạn.`,
                'Bên nhận được xác minh',
                'share',
              );
              setSharePayload({ credential, attributes: items });
              setScreen('share-qr');
            }}
          />
        ) : (
          <CredentialsScreen
            colors={colors}
            credentials={store.credentials}
            onBack={() => setScreen('wallet')}
            onOpenCredential={openCredential}
            onScan={() => setScreen('scan')}
          />
        );
      }
      case 'share-qr':
        return sharePayload ? (
          <ShareQrScreen
            colors={colors}
            credential={sharePayload.credential}
            attributes={sharePayload.attributes}
            onBack={() => setScreen('share')}
            onCancel={() => {
              setSharePayload(null);
              setSelectedCredential(null);
              setScreen('activity');
            }}
          />
        ) : (
          <CredentialsScreen
            colors={colors}
            credentials={store.credentials}
            onBack={() => setScreen('wallet')}
            onOpenCredential={openCredential}
            onScan={() => setScreen('scan')}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            colors={colors}
            onBack={() => setScreen(returnScreen)}
            onSettings={() => {
              setReturnScreen('notifications');
              setScreen('settings-notifications');
            }}
          />
        );
      case 'scan':
        return (
          <ScannerScreen
            colors={colors}
            onOpenActivity={() => setScreen('activity')}
            onOpenChat={() => {
              setChatReturnScreen('scan');
              setScreen('chat-list');
            }}
            onOpenMyQr={() => {
              const activeInvitation = connectionInvitation
                ? store.logs.find(
                    (log) =>
                      log.id === connectionInvitation.id &&
                      log.status === 'pending' &&
                      Boolean(log.expiresAt) &&
                      new Date(log.expiresAt!).getTime() > Date.now(),
                  )
                : null;
              if (activeInvitation) {
                setScreen('connection-qr');
                return;
              }
              const createdAt = Date.now();
              const id = `connection-invitation-${createdAt}`;
              store.addActivityLog({
                id,
                timestamp: new Date(createdAt).toISOString(),
                expiresAt: new Date(createdAt + 180000).toISOString(),
                type: 'share',
                status: 'pending',
                title: 'Lời mời kết nối',
                description: 'Đang chờ',
                partner: 'Kết nối SSI',
              });
              setConnectionInvitation({ id, createdAt });
              setScreen('connection-qr');
            }}
          />
        );
      case 'connection-qr':
        return connectionInvitation ? (
          <ConnectionQrScreen
            colors={colors}
            did={store.profile.did}
            createdAt={connectionInvitation.createdAt}
            onBack={() => setScreen('scan')}
            onRefresh={(createdAt) => {
              setConnectionInvitation((current) => current ? { ...current, createdAt } : current);
              store.updateActivityLog(connectionInvitation.id, {
                timestamp: new Date(createdAt).toISOString(),
                expiresAt: new Date(createdAt + 180000).toISOString(),
                status: 'pending',
                description: 'Đang chờ',
              });
            }}
            onCancel={() => {
              store.removeActivityLog(connectionInvitation.id);
              setConnectionInvitation(null);
              setScreen('scan');
            }}
          />
        ) : (
          <ScannerScreen
            colors={colors}
            onOpenActivity={() => setScreen('activity')}
            onOpenChat={() => {
              setChatReturnScreen('scan');
              setScreen('chat-list');
            }}
            onOpenMyQr={() => setScreen('scan')}
          />
        );
      case 'activity':
        return (
          <ActivityScreen
            colors={colors}
            logs={store.logs}
            onOpenChat={() => {
              setChatReturnScreen('activity');
              setScreen('chat-list');
            }}
          />
        );
      case 'chat-list':
        return (
          <ChatListScreen
            colors={colors}
            onOpenConversation={(conversationId) => {
              setSelectedChatId(conversationId);
              setScreen('chat');
            }}
            onOpenMenu={openSideMenu}
          />
        );
      case 'chat':
        return <ChatScreen colors={colors} conversationId={selectedChatId} onBack={() => setScreen('chat-list')} />;
      case 'settings':
        return (
          <SettingsScreen
            colors={colors}
            onOpenBackup={() => setScreen('settings-backup')}
            onOpenDisplay={() => setScreen('settings-display')}
            onOpenSecurity={() => {
              setReturnScreen('settings');
              setScreen('security');
            }}
            onOpenGovernance={() => setScreen('settings-governance')}
            onOpenNotifications={() => {
              setReturnScreen('settings');
              setScreen('settings-notifications');
            }}
            onOpenSharing={() => setScreen('settings-sharing')}
            onOpenData={() => setScreen('settings-data')}
            onOpenActivity={() => setScreen('activity')}
            onOpenHelp={() => setScreen('settings-help')}
            onOpenAbout={() => setScreen('settings-about')}
            onOpenChat={() => {
              setChatReturnScreen('settings');
              setScreen('chat-list');
            }}
          />
        );
      case 'settings-backup':
        return <BackupSettingsScreen colors={colors} onBack={() => setScreen('settings')} />;
      case 'settings-display':
        return (
          <DisplaySettingsScreen
            colors={colors}
            settings={store.settings}
            onBack={() => setScreen('settings')}
            onSettings={store.updateSettings}
          />
        );
      case 'settings-governance':
        return (
          <SampleSettingsScreen
            colors={colors}
            id="screen-settings-governance"
            title="Cài đặt khung quản trị"
            description="Quản lý các quy tắc tin cậy và đơn vị được phép tương tác với ví."
            rows={[
              { icon: Building2, title: 'Tổ chức tin cậy', description: 'Cho phép thực chứng từ các tổ chức đã xác minh' },
              { icon: FileCheck2, title: 'Kiểm tra chính sách', description: 'Xác minh chính sách trước khi nhận thực chứng' },
              { icon: ShieldCheck, title: 'Cảnh báo thay đổi', description: 'Thông báo khi khung quản trị được cập nhật' },
            ]}
            onBack={() => setScreen('settings')}
          />
        );
      case 'settings-notifications':
        return (
          <SampleSettingsScreen
            colors={colors}
            id="screen-settings-notifications"
            title="Cài đặt thông báo"
            description="Chọn các cập nhật và cảnh báo bạn muốn nhận từ Identra."
            rows={[
              { icon: BellRing, title: 'Yêu cầu dữ liệu', description: 'Thông báo khi có bên xác minh yêu cầu dữ liệu' },
              { icon: ShieldCheck, title: 'Cảnh báo bảo mật', description: 'Nhận cảnh báo đăng nhập và thay đổi bảo mật' },
              { icon: FileCheck2, title: 'Cập nhật thực chứng', description: 'Thông báo khi thực chứng sắp hết hạn' },
            ]}
            onBack={() => setScreen(returnScreen)}
          />
        );
      case 'settings-sharing':
        return (
          <SampleSettingsScreen
            colors={colors}
            id="screen-settings-sharing"
            title="Quyền chia sẻ dữ liệu"
            description="Kiểm soát cách dữ liệu của bạn được chia sẻ với các bên thứ ba."
            rows={[
              { icon: UserCheck, title: 'Luôn yêu cầu xác nhận', description: 'Xác nhận trước mỗi lần chia sẻ dữ liệu' },
              { icon: Share2, title: 'Ghi lại lịch sử chia sẻ', description: 'Lưu thông tin các lần chia sẻ trong Hoạt động' },
              { icon: BellRing, title: 'Nhắc quyền truy cập', description: 'Nhắc xem lại quyền truy cập định kỳ', defaultValue: false },
            ]}
            onBack={() => setScreen('settings')}
          />
        );
      case 'settings-data':
        return (
          <DataSettingsScreen
            colors={colors}
            onBack={() => setScreen('settings')}
            onClearDemo={store.clearDemoData}
            onResetDemo={store.resetDemoData}
          />
        );
      case 'settings-help':
        return <HelpScreen colors={colors} onBack={() => setScreen('settings')} />;
      case 'settings-about':
        return <AboutScreen colors={colors} onBack={() => setScreen('settings')} />;
    }
  }, [chatReturnScreen, colors, connectionInvitation, newsFeedChromeProgress, newsFeedScrollY, openSideMenu, returnScreen, screen, selectedChatId, selectedCredential, selectedSmartContractPost, sharePayload, store]);

  if (!store.hydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primaryDark} size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang mở ví Identra...</Text>
      </View>
    );
  }

  if (!authCompleted) {
    const completeAuth = () => setAuthCompleted(true);

    return (
      <View style={[styles.root, { backgroundColor: isDark ? '#05070D' : '#EEF1F7' }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <SafeAreaView
          edges={['top', 'bottom', 'left', 'right']}
          style={[styles.appFrame, { backgroundColor: colors.background }]}
        >
          {authEntry === 'login' ? (
            <LoginScreen
              colors={colors}
              onBack={() => setAuthEntry('onboarding')}
              onContinue={completeAuth}
              onRegister={() => setAuthEntry('register')}
            />
          ) : authEntry === 'register' ? (
            <RegisterScreen
              colors={colors}
              onBack={() => setAuthEntry('onboarding')}
              onContinue={completeAuth}
              onLogin={() => setAuthEntry('login')}
            />
          ) : (
            <OnboardingScreen
              colors={colors}
              onRegister={() => setAuthEntry('register')}
              onLogin={() => setAuthEntry('login')}
            />
          )}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#05070D' : '#EEF1F7' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.appFrame, { backgroundColor: colors.background }]}>
        <View style={styles.content}>{screenContent}</View>
        {showBottomNav ? (
          <BottomNavigation
            colors={colors}
            activeTab={activeTab}
            bottomInset={insets.bottom}
            floating={screen === 'news-feed'}
            overlayProgress={screen === 'news-feed' ? newsFeedChromeProgress : undefined}
            onSelect={(tab) => setScreen(tabScreens[tab])}
          />
        ) : null}
        <SideMenu
          colors={colors}
          currentScreen={screen}
          unreadActivityCount={unreadActivityCount}
          visible={sideMenuOpen}
          onClose={() => setSideMenuOpen(false)}
          onNavigate={(target) => {
            setSideMenuOpen(false);
            if (target === 'credentials' || target === 'notifications' || target === 'profile' || target === 'security') {
              setReturnScreen(screen);
            }
            setScreen(target);
          }}
        />
      </SafeAreaView>
    </View>
  );
}

function BottomNavigation({
  colors,
  activeTab,
  bottomInset,
  floating = false,
  overlayProgress,
  onSelect,
}: {
  colors: typeof lightColors;
  activeTab: TabKey | null;
  bottomInset: number;
  floating?: boolean;
  overlayProgress?: Animated.AnimatedInterpolation<number>;
  onSelect: (tab: TabKey) => void;
}) {
  const tabs: Array<{ key: TabKey; label: string; icon: ComponentType<BottomNavIconProps> }> = [
    { key: 'chat', label: 'Chat', icon: ChatNavIcon },
    { key: 'feed', label: 'News Feed', icon: NewsFeedNavIcon },
    { key: 'scan', label: 'Scan QR', icon: ScanQrNavIcon },
    { key: 'payment', label: 'Payment', icon: PaymentNavIcon },
    { key: 'identity', label: 'Identity', icon: IdentityNavIcon },
  ];

  const bottomHiddenOffset = layout.bottomNavHeight + Math.max(bottomInset, spacing.xl);
  const translateY = overlayProgress
    ? overlayProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, bottomHiddenOffset],
        extrapolate: 'clamp',
      })
    : 0;

  return (
    <Animated.View
      nativeID="identra-bottom-navigation"
      testID="identra-bottom-navigation"
      style={[
        styles.bottomNav,
        floating && styles.bottomNavFloating,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(bottomInset - 16, 8),
          transform: [{ translateY }],
        },
      ]}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(tab.key)}
            style={({ pressed }) => [styles.bottomNavItem, { opacity: pressed ? 0.55 : 1 }]}
          >
            <View style={[styles.bottomNavIcon, !active && styles.bottomNavIconInactive]}>
              <Icon
                color={active ? colors.primaryDark : colors.text}
                backgroundColor={colors.surface}
                size={28}
              />
            </View>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

function SideMenu({
  colors,
  currentScreen,
  onClose,
  onNavigate,
  unreadActivityCount,
  visible,
}: {
  colors: typeof lightColors;
  currentScreen: ScreenKey;
  onClose: () => void;
  onNavigate: (screen: ScreenKey) => void;
  unreadActivityCount: number;
  visible: boolean;
}) {
  if (!visible) return null;

  const items: Array<{ target: ScreenKey; label: string; description: string; icon: typeof MessageCircle; badge?: number }> = [
    { target: 'news-feed', label: 'Bảng tin', description: 'Cập nhật từ Identra và cộng đồng', icon: House },
    { target: 'wallet', label: 'Danh tính', description: 'Ví danh tính và thực chứng của bạn', icon: UserRound },
    { target: 'credentials', label: 'Thực chứng của tôi', description: 'Danh sách VC đã nhận', icon: FileCheck2 },
    { target: 'activity', label: 'Hoạt động', description: 'Xác minh và chia sẻ dữ liệu', icon: NotebookPen, badge: unreadActivityCount },
    { target: 'settings', label: 'Cài đặt', description: 'Quản lý tài khoản và quyền riêng tư', icon: Settings },
    { target: 'notifications', label: 'Thông báo', description: 'Cảnh báo và cập nhật quan trọng', icon: BellRing },
    { target: 'profile', label: 'Hồ sơ cá nhân', description: 'Thông tin hiển thị của bạn', icon: UserCheck },
    { target: 'security', label: 'Bảo mật', description: 'Mã khóa, xác thực và bảo vệ ví', icon: ShieldCheck },
  ];

  return (
    <View nativeID="identra-side-menu" testID="identra-side-menu" style={styles.sideMenuLayer}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng menu" onPress={onClose} style={[styles.sideMenuBackdrop, { backgroundColor: colors.overlay }]} />
      <View style={[styles.sideMenuPanel, shadows.floating, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sideMenuHeader}>
          <AppBrandLogo colors={colors} logoSize={30} wordmarkSize={21} style={styles.sideMenuBrand} />
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng menu" onPress={onClose} style={styles.sideMenuClose}>
            <X color={colors.text} size={24} strokeWidth={2} />
          </Pressable>
        </View>
        <Text style={[styles.sideMenuEyebrow, { color: colors.textSecondary }]}>Điều hướng</Text>
        <View style={styles.sideMenuList}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.target === currentScreen;
            return (
              <Pressable
                key={item.target}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                onPress={() => onNavigate(item.target)}
                style={({ pressed }) => [
                  styles.sideMenuItem,
                  {
                    backgroundColor: active ? colors.surfaceMuted : 'transparent',
                    opacity: pressed ? 0.66 : 1,
                  },
                ]}
              >
                <View style={[styles.sideMenuItemIcon, { backgroundColor: active ? palette.blue[100] : colors.surfaceMuted }]}>
                  <Icon color={active ? colors.primaryDark : colors.textSecondary} size={22} strokeWidth={1.9} />
                </View>
                <View style={styles.sideMenuItemCopy}>
                  <Text style={[styles.sideMenuItemTitle, { color: colors.text }]}>{item.label}</Text>
                  <Text numberOfLines={1} style={[styles.sideMenuItemDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>
                {item.badge ? (
                  <View style={styles.sideMenuBadge}>
                    <Text style={styles.sideMenuBadgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  appFrame: { flex: 1, width: '100%', maxWidth: layout.maxWidth },
  content: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md + spacing.xxs },
  loadingText: { fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },
  bottomNav: {
    minHeight: layout.bottomNavHeight,
    borderTopWidth: border.thin,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
    ...shadows.subtle,
  },
  bottomNavFloating: { position: 'absolute', right: 0, bottom: 0, left: 0, zIndex: 8 },
  bottomNavItem: { flex: 1, minHeight: touchTarget.large, alignItems: 'center', justifyContent: 'center' },
  bottomNavIcon: { width: touchTarget.minimum, height: touchTarget.minimum, alignItems: 'center', justifyContent: 'center' },
  bottomNavIconInactive: { opacity: 0.8 },
  activityBadge: {
    position: 'absolute',
    top: -3,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: border.medium,
    backgroundColor: palette.red[500],
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBadgeText: { color: palette.white, fontSize: 8, lineHeight: 10, fontWeight: typography.weight.black, textAlign: 'center' },
  bottomNavLabel: { fontSize: 11, lineHeight: 13, fontWeight: typography.weight.medium, textAlign: 'center' },
  sideMenuLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 },
  sideMenuBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sideMenuPanel: {
    width: '82%',
    maxWidth: 342,
    height: '100%',
    borderRightWidth: border.thin,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sideMenuHeader: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sideMenuBrand: { flex: 1 },
  sideMenuClose: { width: touchTarget.minimum, height: touchTarget.minimum, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center' },
  sideMenuEyebrow: { marginTop: spacing.lg, marginBottom: spacing.sm, fontSize: typography.size.xs, fontWeight: typography.weight.black, textTransform: 'uppercase', letterSpacing: 0.8 },
  sideMenuList: { gap: spacing.xs },
  sideMenuItem: { minHeight: 68, borderRadius: radius.lg, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sideMenuItemIcon: { width: touchTarget.minimum, height: touchTarget.minimum, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  sideMenuItemCopy: { flex: 1, minWidth: 0 },
  sideMenuItemTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  sideMenuItemDescription: { marginTop: spacing.xxs, fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.medium },
  sideMenuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.red[500],
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideMenuBadgeText: { color: palette.white, fontSize: 10, fontWeight: typography.weight.black },
});
