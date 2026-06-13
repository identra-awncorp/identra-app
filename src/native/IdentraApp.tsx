import { StatusBar } from 'expo-status-bar';
import {
  BellRing,
  Building2,
  FileCheck2,
  NotebookPen,
  ScanLine,
  Settings,
  Share2,
  ShieldCheck,
  UserCheck,
  WalletCards,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkColors, lightColors } from './theme';
import type { Credential, ScreenKey, TabKey } from './types';
import { useAppStore } from './store';
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
} from './screens/SecondaryScreens';
import { ScannerScreen } from './screens/ScannerScreens';
import { ChatScreen } from './screens/ChatScreen';
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
  wallet: 'wallet',
  scan: 'scan',
  activity: 'activity',
  settings: 'settings',
};

const bottomNavScreens = new Set<ScreenKey>(['wallet', 'credentials', 'notifications', 'scan', 'activity', 'settings']);

export function IdentraApp() {
  const store = useAppStore();
  const systemScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<ScreenKey>('wallet');
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [sharePayload, setSharePayload] = useState<{ credential: Credential; attributes: Credential['attributes'] } | null>(null);
  const [connectionInvitation, setConnectionInvitation] = useState<{ id: string; createdAt: number } | null>(null);
  const [returnScreen, setReturnScreen] = useState<ScreenKey>('wallet');
  const [chatReturnScreen, setChatReturnScreen] = useState<ScreenKey>('wallet');
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authEntry, setAuthEntry] = useState<'onboarding' | 'login' | 'register'>('onboarding');
  const previousScreen = useRef<ScreenKey>('wallet');

  const isDark = store.settings.theme === 'dark' || (store.settings.theme === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;
  const activeTab: TabKey | null =
    screen === 'notifications'
      ? null
      : screen === 'scan'
      ? 'scan'
      : screen === 'activity'
        ? 'activity'
        : screen.startsWith('settings')
          ? 'settings'
          : 'wallet';

  const showBottomNav = bottomNavScreens.has(screen);
  const unreadActivityCount = store.logs.filter((log) => log.unread).length;

  useEffect(() => {
    if (screen === 'activity' && unreadActivityCount) store.markAllActivityLogsRead();
  }, [screen, store, unreadActivityCount]);

  useEffect(() => {
    if (previousScreen.current === 'activity' && screen !== 'activity') store.clearNewActivityHighlights();
    previousScreen.current = screen;
  }, [screen, store]);

  const screenContent = useMemo(() => {
    const openCredential = (credential: Credential) => {
      setSelectedCredential(credential);
      setScreen('credential-detail');
    };

    switch (screen) {
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
              setScreen('chat');
            }}
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
              setScreen('chat');
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
              setScreen('chat');
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
              setScreen('chat');
            }}
          />
        );
      case 'chat':
        return <ChatScreen colors={colors} onBack={() => setScreen(chatReturnScreen)} />;
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
              setScreen('chat');
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
  }, [chatReturnScreen, colors, connectionInvitation, returnScreen, screen, selectedCredential, sharePayload, store]);

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
            unreadActivityCount={unreadActivityCount}
            onSelect={(tab) => setScreen(tabScreens[tab])}
          />
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function BottomNavigation({
  colors,
  activeTab,
  bottomInset,
  unreadActivityCount,
  onSelect,
}: {
  colors: typeof lightColors;
  activeTab: TabKey | null;
  bottomInset: number;
  unreadActivityCount: number;
  onSelect: (tab: TabKey) => void;
}) {
  const tabs = [
    { key: 'wallet' as const, label: 'Ví', icon: WalletCards },
    { key: 'scan' as const, label: 'Quét', icon: ScanLine },
    { key: 'activity' as const, label: 'Hoạt động', icon: NotebookPen },
    { key: 'settings' as const, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <View
      nativeID="identra-bottom-navigation"
      testID="identra-bottom-navigation"
      style={[
        styles.bottomNav,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(bottomInset - 16, 8),
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
            <View style={styles.bottomNavIcon}>
              <Icon
                color={active ? colors.primaryDark : colors.textSecondary}
                fill={active && tab.key === 'wallet' ? 'rgba(53, 92, 255, 0.12)' : 'none'}
                size={22}
                strokeWidth={active ? 2.4 : 1.9}
              />
              {tab.key === 'activity' && unreadActivityCount > 0 ? (
                <View style={[styles.activityBadge, { borderColor: colors.surface }]}>
                  <Text style={styles.activityBadgeText}>{unreadActivityCount > 99 ? '99+' : unreadActivityCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.bottomNavLabel, { color: active ? colors.primaryDark : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  appFrame: { flex: 1, width: '100%', maxWidth: 430 },
  content: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { fontSize: 13, fontWeight: '600' },
  bottomNav: {
    minHeight: 72,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  bottomNavItem: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'flex-start', gap: 1 },
  bottomNavIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  activityBadge: {
    position: 'absolute',
    top: -3,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: '#FF3D47',
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBadgeText: { color: '#FFFFFF', fontSize: 8, lineHeight: 10, fontWeight: '900', textAlign: 'center' },
  bottomNavLabel: { fontSize: 11, lineHeight: 13, fontWeight: '500', textAlign: 'center' },
});
