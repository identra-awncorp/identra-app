import { Stack, usePathname, useRouter } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  bottomNavItems,
  getActiveTabForScreen,
  getPathForScreen,
  getScreenForPathname,
  getScreenForTab,
  initialScreen,
  shouldCaptureReturnScreen,
  shouldShowBottomNavForScreen,
  shouldUseFloatingBottomNav,
  sideMenuItems,
  type ScreenKey,
  type TabKey,
} from '../navigation/navigationConfig';
import { AppBrandLogo } from '../../components/AppLogo';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store';
import { border, layout, lightColors, palette, radius, shadows, spacing, touchTarget, typography } from '../../theme';
import { useAppRouterState } from './AppRouterContext';

const authPathnames = new Set(['/onboarding', '/login', '/register']);

export function AppShell() {
  const store = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const previousScreen = useRef<ScreenKey>(initialScreen);
  const { t } = useI18n();
  const {
    authCompleted,
    authHydrated,
    closeSideMenu,
    colors,
    isDark,
    newsFeedChromeProgress,
    newsFeedScrollY,
    setReturnScreen,
    sideMenuOpen,
  } = useAppRouterState();
  const screen = getScreenForPathname(pathname);
  const authRoute = authPathnames.has(pathname);
  const unreadActivityCount = store.logs.filter((log) => log.unread).length;
  const systemBarBackground = colors.background;

  useEffect(() => {
    if (!store.hydrated || !authHydrated) return;
    if (!authCompleted && !authRoute) {
      router.replace('/onboarding');
      return;
    }
    if (authCompleted && authRoute) {
      router.replace(getPathForScreen(initialScreen));
    }
  }, [authCompleted, authHydrated, authRoute, router, store.hydrated]);

  useEffect(() => {
    if (screen === 'activity' && unreadActivityCount) store.markAllActivityLogsRead();
  }, [screen, store, unreadActivityCount]);

  useEffect(() => {
    if (previousScreen.current === 'activity' && screen !== 'activity') store.clearNewActivityHighlights();
    if (screen) previousScreen.current = screen;
  }, [screen, store]);

  useEffect(() => {
    if (screen !== 'news-feed') newsFeedScrollY.setValue(0);
  }, [newsFeedScrollY, screen]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(systemBarBackground).catch(() => undefined);
  }, [systemBarBackground]);

  if (!store.hydrated || !authHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primaryDark} size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('app.loadingWallet')}</Text>
      </View>
    );
  }

  const activeTab = screen ? getActiveTabForScreen(screen) : null;
  const showBottomNav = authCompleted && screen ? shouldShowBottomNavForScreen(screen) : false;
  const currentScreen = screen ?? initialScreen;

  return (
    <View style={[styles.root, { backgroundColor: systemBarBackground }]}>
      <StatusBar backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} translucent />
      <View
        style={[
          styles.appFrame,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
        </View>
        {showBottomNav ? (
          <BottomNavigation
            colors={colors}
            activeTab={activeTab}
            bottomInset={insets.bottom}
            floating={shouldUseFloatingBottomNav(currentScreen)}
            overlayProgress={currentScreen === 'news-feed' ? newsFeedChromeProgress : undefined}
            onSelect={(tab) => router.replace(getPathForScreen(getScreenForTab(tab)))}
          />
        ) : null}
        <SideMenu
          colors={colors}
          currentScreen={currentScreen}
          bottomInset={insets.bottom}
          topInset={insets.top}
          unreadActivityCount={unreadActivityCount}
          visible={sideMenuOpen}
          onClose={closeSideMenu}
          onNavigate={(target) => {
            closeSideMenu();
            if (screen && shouldCaptureReturnScreen(target)) setReturnScreen(screen);
            router.push(getPathForScreen(target));
          }}
        />
      </View>
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
  const { t } = useI18n();
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
          paddingBottom: Math.max(bottomInset, 8),
          transform: [{ translateY }],
        },
      ]}
    >
      {bottomNavItems.map((tab) => {
        const Icon = tab.icon;
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.labelKey)}
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
  bottomInset,
  colors,
  currentScreen,
  onClose,
  onNavigate,
  topInset,
  unreadActivityCount,
  visible,
}: {
  bottomInset: number;
  colors: typeof lightColors;
  currentScreen: ScreenKey;
  onClose: () => void;
  onNavigate: (screen: ScreenKey) => void;
  topInset: number;
  unreadActivityCount: number;
  visible: boolean;
}) {
  const { t } = useI18n();
  if (!visible) return null;

  return (
    <View nativeID="identra-side-menu" testID="identra-side-menu" style={styles.sideMenuLayer}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('app.sideMenu.close')} onPress={onClose} style={[styles.sideMenuBackdrop, { backgroundColor: colors.overlay }]} />
      <View
        style={[
          styles.sideMenuPanel,
          shadows.floating,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingTop: Math.max(spacing.lg, topInset + spacing.sm),
            paddingBottom: Math.max(spacing.lg, bottomInset + spacing.md),
          },
        ]}
      >
        <View style={styles.sideMenuHeader}>
          <AppBrandLogo colors={colors} logoSize={30} wordmarkSize={21} style={styles.sideMenuBrand} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('app.sideMenu.close')} onPress={onClose} style={styles.sideMenuClose}>
            <X color={colors.text} size={24} strokeWidth={2} />
          </Pressable>
        </View>
        <Text style={[styles.sideMenuEyebrow, { color: colors.textSecondary }]}>{t('app.sideMenu.title')}</Text>
        <View style={styles.sideMenuList}>
          {sideMenuItems.map((item) => {
            const Icon = item.icon;
            const active = item.target === currentScreen;
            const badge = item.badgeKey === 'unreadActivityCount' ? unreadActivityCount : undefined;
            const label = t(item.labelKey);
            const description = t(item.descriptionKey);
            return (
              <Pressable
                key={item.target}
                accessibilityRole="button"
                accessibilityLabel={label}
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
                  <Text style={[styles.sideMenuItemTitle, { color: colors.text }]}>{label}</Text>
                  <Text numberOfLines={1} style={[styles.sideMenuItemDescription, { color: colors.textSecondary }]}>{description}</Text>
                </View>
                {badge ? (
                  <View style={styles.sideMenuBadge}>
                    <Text style={styles.sideMenuBadgeText}>{badge > 99 ? '99+' : badge}</Text>
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
  root: { flex: 1 },
  appFrame: { flex: 1, width: '100%' },
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
  sideMenuLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 },
  sideMenuBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sideMenuPanel: {
    width: '82%',
    maxWidth: 342,
    height: '100%',
    borderRightWidth: border.thin,
    paddingHorizontal: spacing.lg,
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
