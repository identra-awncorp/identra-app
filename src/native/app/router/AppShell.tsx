import { Stack, usePathname, useRouter } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import {
  Bug,
  Check,
  ChevronDown,
  Languages,
  LogOut,
  Moon,
  Settings,
  Sun,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  bottomNavItems,
  getActiveTabForScreen,
  getPathForScreen,
  getScreenForPathname,
  getScreenForTab,
  initialScreen,
  shouldShowBottomNavForScreen,
  shouldUseFloatingBottomNav,
  type BottomNavScreenConfig,
  type ScreenKey,
  type TabKey,
} from '../navigation/navigationConfig';
import { getSideMenuFlowForPathname, sideMenuSettingsByFlow, type SideMenuSettingItemConfig } from '../navigation/sideMenuSettingsConfig';
import { AppBrandLogo } from '../../components/AppLogo';
import { useI18n } from '../../i18n';
import { useAppStore } from '../../store';
import { border, layout, lightColors, palette, radius, shadows, spacing, touchTarget, typography } from '../../theme';
import type { AppFlowKey, AppSettings, Language, ThemeMode } from '../../types';
import { useAppRouterState } from './AppRouterContext';
import { MainTabKeepAliveScreens, isKeepAliveMainScreen } from './MainTabKeepAliveScreens';

const authPathnames = new Set(['/onboarding', '/login', '/register']);
const bottomNavIconSize = 28;
const scanNavLineWidth = 34;
const scanNavLineHeight = 1.5;
const sideMenuIconSize = 22;

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
    logout,
    newsFeedChromeProgress,
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
  const activeKeepAliveScreen = isKeepAliveMainScreen(screen) ? screen : null;
  const currentSideMenuFlow = getSideMenuFlowForPathname(pathname);
  const openSettings = () => {
    closeSideMenu();
    if (screen) setReturnScreen(screen);
    router.push(getPathForScreen('settings'));
  };
  const openIdentity = () => {
    closeSideMenu();
    if (screen) setReturnScreen(screen);
    router.push(getPathForScreen('wallet'));
  };
  const handleLogout = async () => {
    closeSideMenu();
    await logout();
    router.replace('/login');
  };

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
          {authCompleted ? <MainTabKeepAliveScreens activeScreen={activeKeepAliveScreen} /> : null}
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
          bottomInset={insets.bottom}
          flowKey={currentSideMenuFlow}
          settings={store.settings}
          topInset={insets.top}
          visible={sideMenuOpen}
          onClose={closeSideMenu}
          onOpenIdentity={openIdentity}
          onLogout={() => void handleLogout()}
          onOpenSettings={openSettings}
          onUpdateSettings={store.updateSettings}
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
        const active = tab.key === activeTab;
        return (
          <BottomNavButton
            key={tab.key}
            active={active}
            colors={colors}
            label={t(tab.labelKey)}
            tab={tab}
            onSelect={() => onSelect(tab.key)}
          />
        );
      })}
    </Animated.View>
  );
}

function BottomNavButton({
  active,
  colors,
  label,
  onSelect,
  tab,
}: {
  active: boolean;
  colors: typeof lightColors;
  label: string;
  onSelect: () => void;
  tab: BottomNavScreenConfig;
}) {
  if (tab.key === 'scan') {
    return (
      <ScanQrBottomNavButton
        active={active}
        colors={colors}
        label={label}
        tab={tab}
        onSelect={onSelect}
      />
    );
  }

  const Icon = tab.icon;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onSelect}
      style={({ pressed }) => [styles.bottomNavItem, { opacity: pressed ? 0.55 : 1 }]}
    >
      <View style={[styles.bottomNavIcon, !active && styles.bottomNavIconInactive]}>
        <Icon
          color={active ? colors.primaryDark : colors.text}
          backgroundColor={colors.surface}
          size={bottomNavIconSize}
        />
      </View>
    </Pressable>
  );
}

function ScanQrBottomNavButton({
  active,
  colors,
  label,
  onSelect,
  tab,
}: {
  active: boolean;
  colors: typeof lightColors;
  label: string;
  onSelect: () => void;
  tab: BottomNavScreenConfig;
}) {
  const scanProgress = useRef(new Animated.Value(0)).current;
  const scanLineOpacity = useRef(new Animated.Value(0)).current;
  const iconBlinkOpacity = useRef(new Animated.Value(1)).current;
  const Icon = tab.icon;
  const scanForegroundColor = active ? colors.primaryDark : palette.white;
  const scanBackgroundColor = active ? palette.white : colors.primaryDark;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(520),
        Animated.timing(scanLineOpacity, {
          toValue: 1,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(scanProgress, {
          toValue: 1,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(scanLineOpacity, {
          toValue: 0,
          duration: 90,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.delay(300),
        Animated.timing(scanLineOpacity, {
          toValue: 1,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(scanProgress, {
          toValue: 0,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(scanLineOpacity, {
          toValue: 0,
          duration: 90,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.delay(120),
        Animated.timing(iconBlinkOpacity, {
          toValue: 0.25,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(iconBlinkOpacity, {
          toValue: 1,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(iconBlinkOpacity, {
          toValue: 0.25,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(iconBlinkOpacity, {
          toValue: 1,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [iconBlinkOpacity, scanLineOpacity, scanProgress]);

  const clippedIconHeight = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [bottomNavIconSize, 0],
  });
  const scanLineTranslateY = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [bottomNavIconSize, -scanNavLineHeight],
  });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onSelect}
      style={({ pressed }) => [styles.bottomNavItem, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.scanNavButton, { backgroundColor: scanBackgroundColor, borderColor: colors.primaryDark, borderWidth: active ? border.thin : 0 }]}>
        <View style={styles.scanNavViewport}>
          <Animated.View style={[styles.scanNavIconClip, { height: clippedIconHeight, opacity: iconBlinkOpacity }]}>
            <View style={styles.scanNavIconFull}>
              <Icon color={scanForegroundColor} backgroundColor={scanBackgroundColor} size={bottomNavIconSize} />
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.scanNavLine,
              {
                backgroundColor: scanForegroundColor,
                opacity: scanLineOpacity,
                transform: [{ translateY: scanLineTranslateY }],
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

function SideMenu({
  bottomInset,
  colors,
  flowKey,
  onClose,
  onOpenIdentity,
  onLogout,
  onOpenSettings,
  onUpdateSettings,
  settings,
  topInset,
  visible,
}: {
  bottomInset: number;
  colors: typeof lightColors;
  flowKey: AppFlowKey;
  onClose: () => void;
  onOpenIdentity: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  settings: AppSettings;
  topInset: number;
  visible: boolean;
}) {
  const { t } = useI18n();
  const { width: windowWidth } = useWindowDimensions();
  const panelProgress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const backdropAlpha = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [renderSideMenu, setRenderSideMenu] = useState(visible);
  const [themeOpen, setThemeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const flowConfig = sideMenuSettingsByFlow[flowKey];
  const flowSettings = settings.flowSettings[flowKey] ?? {};
  const themeOptions: ThemeMode[] = ['system', 'light', 'dark'];
  const getThemeIcon = (theme: ThemeMode) => (theme === 'dark' ? Moon : Sun);
  const themeIcon = getThemeIcon(settings.theme);
  const panelTranslateX = panelProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-Math.max(windowWidth, 1), 0],
  });

  useEffect(() => {
    if (visible) setRenderSideMenu(true);

    const animation = visible
      ? Animated.parallel([
          Animated.timing(backdropAlpha, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(panelProgress, {
            toValue: 1,
            duration: 300,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            useNativeDriver: true,
          }),
        ])
      : Animated.parallel([
          Animated.timing(panelProgress, {
            toValue: 0,
            duration: 230,
            easing: Easing.bezier(0.7, 0, 0.84, 0),
            useNativeDriver: true,
          }),
          Animated.timing(backdropAlpha, {
            toValue: 0,
            duration: 170,
            delay: 40,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]);

    animation.start(({ finished }) => {
      if (!finished || visible) return;
      setRenderSideMenu(false);
      setThemeOpen(false);
      setLanguageOpen(false);
    });

    return () => {
      animation.stop();
    };
  }, [backdropAlpha, panelProgress, visible]);

  const updateFlowSetting = (settingId: string, value: boolean) => {
    const nextFlowSettings = {
      ...settings.flowSettings,
      [flowKey]: {
        ...flowSettings,
        [settingId]: value,
      },
    };

    onUpdateSettings({
      ...(flowKey === 'identity' && settingId === 'hideSensitiveData' ? { hideSensitiveData: value } : {}),
      flowSettings: nextFlowSettings,
    });
  };

  const setTheme = (theme: ThemeMode) => {
    onUpdateSettings({ theme });
    setThemeOpen(false);
  };

  const setLanguage = (language: Language) => {
    onUpdateSettings({ language });
    setLanguageOpen(false);
  };

  const reportIssue = () => {
    Alert.alert(t('app.sideMenu.reportAlertTitle'), t('app.sideMenu.reportAlertDescription'));
  };

  const confirmLogout = () => {
    Alert.alert(t('app.sideMenu.logoutConfirmTitle'), t('app.sideMenu.logoutConfirmDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('app.sideMenu.logoutConfirmAction'),
        style: 'destructive',
        onPress: onLogout,
      },
    ]);
  };

  if (!renderSideMenu) return null;

  return (
    <View nativeID="identra-side-menu" testID="identra-side-menu" style={styles.sideMenuLayer}>
      <Animated.View style={[styles.sideMenuBackdrop, { opacity: backdropAlpha }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('app.sideMenu.close')} onPress={onClose} style={[styles.sideMenuBackdrop, { backgroundColor: colors.overlay }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sideMenuPanel,
          shadows.floating,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingTop: Math.max(spacing.lg, topInset + spacing.sm),
            paddingBottom: Math.max(spacing.lg, bottomInset + spacing.md),
            transform: [{ translateX: panelTranslateX }],
          },
        ]}
      >
        <View style={styles.sideMenuHeader}>
          <AppBrandLogo colors={colors} logoSize={30} wordmarkSize={21} style={styles.sideMenuBrand} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('app.sideMenu.close')} onPress={onClose} style={styles.sideMenuClose}>
            <X color={colors.text} size={24} strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.sideMenuScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sideMenuSection}>
            <Text style={[styles.sideMenuSectionTitle, { color: colors.textSecondary }]}>{t('app.sideMenu.globalTitle')}</Text>
            <SideMenuActionRow
              colors={colors}
              description={t('app.sideMenu.themeDescription')}
              icon={themeIcon}
              meta={t(`app.sideMenu.themes.${settings.theme}`)}
              rightIcon={ChevronDown}
              title={t('app.sideMenu.themeTitle')}
              variant="global"
              onPress={() => {
                setThemeOpen((current) => !current);
                setLanguageOpen(false);
              }}
            />
            {themeOpen ? (
              <View style={styles.sideMenuDropdown}>
                {themeOptions.map((theme) => (
                  <SideMenuActionRow
                    key={theme}
                    colors={colors}
                    description={t('app.sideMenu.themeDescription')}
                    icon={settings.theme === theme ? Check : getThemeIcon(theme)}
                    title={t(`app.sideMenu.themes.${theme}`)}
                    variant="global"
                    onPress={() => setTheme(theme)}
                  />
                ))}
              </View>
            ) : null}
            <SideMenuActionRow
              colors={colors}
              description={t('app.sideMenu.languageDescription')}
              icon={Languages}
              meta={t(`app.sideMenu.languages.${settings.language}`)}
              rightIcon={ChevronDown}
              title={t('app.sideMenu.languageTitle')}
              variant="global"
              onPress={() => {
                setLanguageOpen((current) => !current);
                setThemeOpen(false);
              }}
            />
            {languageOpen ? (
              <View style={styles.sideMenuDropdown}>
                {(['vi', 'en'] as Language[]).map((language) => (
                  <SideMenuActionRow
                    key={language}
                    colors={colors}
                    description={t('app.sideMenu.languageDescription')}
                    icon={settings.language === language ? Check : Languages}
                    title={t(`app.sideMenu.languages.${language}`)}
                    variant="global"
                    onPress={() => setLanguage(language)}
                  />
                ))}
              </View>
            ) : null}
            <SideMenuActionRow
              colors={colors}
              description={t('app.sideMenu.openIdentityDescription')}
              icon={WalletCards}
              title={t('app.sideMenu.openIdentityTitle')}
              variant="global"
              onPress={onOpenIdentity}
            />
          </View>

          {flowConfig.sections.map((section) => (
            <View key={section.id} style={styles.sideMenuSection}>
              <Text style={[styles.sideMenuSectionTitle, { color: colors.textSecondary }]}>{t(section.titleKey)}</Text>
              {section.items.map((item) => (
                <SideMenuSettingRow
                  key={item.id}
                  colors={colors}
                  item={item}
                  value={item.type === 'toggle' ? Boolean(flowSettings[item.settingId]) : false}
                  onValueChange={(value) => {
                    if (item.type === 'toggle') updateFlowSetting(item.settingId, value);
                  }}
                />
              ))}
            </View>
          ))}

          <View style={styles.sideMenuSection}>
            <Text style={[styles.sideMenuSectionTitle, { color: colors.textSecondary }]}>{t('app.sideMenu.globalTitle')}</Text>
            <SideMenuActionRow
              colors={colors}
              description={t('app.sideMenu.generalSettingsDescription')}
              icon={Settings}
              title={t('app.sideMenu.generalSettingsTitle')}
              variant="global"
              onPress={onOpenSettings}
            />
            <SideMenuActionRow
              colors={colors}
              description={t('app.sideMenu.reportDescription')}
              icon={Bug}
              title={t('app.sideMenu.reportTitle')}
              variant="warning"
              onPress={reportIssue}
            />
            <SideMenuActionRow
              colors={colors}
              description={t('app.sideMenu.logoutDescription')}
              icon={LogOut}
              title={t('app.sideMenu.logoutTitle')}
              variant="danger"
              onPress={confirmLogout}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function SideMenuSettingRow({
  colors,
  item,
  onValueChange,
  value,
}: {
  colors: typeof lightColors;
  item: SideMenuSettingItemConfig;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  const { t } = useI18n();

  if (item.type !== 'toggle') return null;

  return (
    <View style={[styles.sideMenuRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <SideMenuRowIcon colors={colors} icon={item.icon} />
      <View style={styles.sideMenuItemCopy}>
        <Text style={[styles.sideMenuItemTitle, { color: colors.text }]}>{t(item.titleKey)}</Text>
        <Text numberOfLines={2} style={[styles.sideMenuItemDescription, { color: colors.textSecondary }]}>{t(item.descriptionKey)}</Text>
      </View>
      <Switch
        accessibilityLabel={t(item.titleKey)}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={palette.white}
      />
    </View>
  );
}

function SideMenuActionRow({
  colors,
  description,
  icon,
  meta,
  onPress,
  rightIcon,
  title,
  variant = 'default',
}: {
  colors: typeof lightColors;
  description: string;
  icon: LucideIcon;
  meta?: string;
  onPress: () => void;
  rightIcon?: LucideIcon;
  title: string;
  variant?: 'default' | 'global' | 'warning' | 'danger';
}) {
  const Icon = icon;
  const RightIcon = rightIcon;
  const color =
    variant === 'danger'
      ? colors.danger
      : variant === 'warning'
        ? colors.warning
        : variant === 'global'
          ? colors.primaryDark
          : colors.textSecondary;
  const backgroundColor = variant === 'default' ? colors.surfaceMuted : colors.surfaceMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sideMenuRow,
        styles.sideMenuActionRow,
        {
          backgroundColor,
          borderColor: colors.border,
          opacity: pressed ? 0.68 : 1,
        },
      ]}
    >
      <View style={[styles.sideMenuItemIcon, { backgroundColor: colors.surface }]}>
        <Icon color={color} size={sideMenuIconSize} strokeWidth={1.9} />
      </View>
      <View style={styles.sideMenuItemCopy}>
        <Text style={[styles.sideMenuItemTitle, { color }]}>{title}</Text>
        <Text numberOfLines={2} style={[styles.sideMenuItemDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      {meta ? <Text numberOfLines={1} style={[styles.sideMenuMeta, { color }]}>{meta}</Text> : null}
      {RightIcon ? <RightIcon color={color} size={18} strokeWidth={2} /> : null}
    </Pressable>
  );
}

function SideMenuRowIcon({ colors, icon: Icon }: { colors: typeof lightColors; icon: LucideIcon }) {
  return (
    <View style={[styles.sideMenuItemIcon, { backgroundColor: colors.surfaceMuted }]}>
      <Icon color={colors.primaryDark} size={sideMenuIconSize} strokeWidth={1.9} />
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
  scanNavButton: {
    minWidth: touchTarget.minimum,
    height: touchTarget.minimum,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanNavViewport: {
    width: scanNavLineWidth,
    height: bottomNavIconSize + scanNavLineHeight * 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  scanNavIconClip: {
    position: 'absolute',
    top: scanNavLineHeight,
    width: bottomNavIconSize,
    overflow: 'hidden',
  },
  scanNavIconFull: {
    width: bottomNavIconSize,
    height: bottomNavIconSize,
  },
  scanNavLine: {
    position: 'absolute',
    top: scanNavLineHeight,
    width: scanNavLineWidth,
    height: scanNavLineHeight,
    borderRadius: radius.round,
  },
  sideMenuLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 },
  sideMenuBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sideMenuPanel: {
    width: '100%',
    height: '100%',
    borderRightWidth: 0,
    paddingHorizontal: spacing.md,
  },
  sideMenuHeader: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xs },
  sideMenuBrand: { flex: 1 },
  sideMenuClose: { width: touchTarget.minimum, height: touchTarget.minimum, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center' },
  sideMenuScrollContent: { paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg },
  sideMenuSection: { gap: spacing.xs },
  sideMenuSectionTitle: { paddingHorizontal: spacing.xs, fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.extraBold, textTransform: 'uppercase', letterSpacing: 0 },
  sideMenuRow: {
    minHeight: 68,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sideMenuActionRow: { borderWidth: border.hairline },
  sideMenuDropdown: { gap: spacing.xs },
  sideMenuItemIcon: { width: touchTarget.minimum, height: touchTarget.minimum, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  sideMenuItemCopy: { flex: 1, minWidth: 0 },
  sideMenuItemTitle: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.semibold },
  sideMenuItemDescription: { marginTop: spacing.xxs, fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.medium },
  sideMenuMeta: { maxWidth: 72, fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.semibold, textAlign: 'right' },
});
