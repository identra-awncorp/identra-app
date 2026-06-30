import {
  Bell,
  CheckCircle2,
  CircleHelp,
  CloudUpload,
  Database,
  Eye,
  Info,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Settings2,
  ShieldCheck,
} from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import { AppBrandLogo } from '../../components/AppLogo';
import { Card, ListChevron, ScreenScroll } from '../../components/AppUiPrimitives';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { settingsStyles as styles } from './settingsStyles';
import { SettingsLink } from './components/SettingsLink';

export function SettingsScreen({
  colors,
  onOpenBackup,
  onOpenDisplay,
  onOpenSecurity,
  onOpenGovernance,
  onOpenNotifications,
  onOpenSharing,
  onOpenData,
  onOpenActivity,
  onOpenHelp,
  onOpenAbout,
  onOpenChat,
  onLogout,
}: {
  colors: AppColors;
  onOpenBackup: () => void;
  onOpenDisplay: () => void;
  onOpenSecurity: () => void;
  onOpenGovernance: () => void;
  onOpenNotifications: () => void;
  onOpenSharing: () => void;
  onOpenData: () => void;
  onOpenActivity: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenChat: () => void;
  onLogout: () => Promise<void> | void;
}) {
  const { t } = useI18n();
  const confirmLogout = () =>
    Alert.alert(t('settings.main.logoutTitle'), t('settings.main.logoutDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.main.logoutAction'),
        style: 'destructive',
        onPress: () => {
          void onLogout();
        },
      },
    ]);

  return (
    <ScreenScroll id="screen-settings-main" colors={colors} contentStyle={styles.settingsScreenContent}>
      <View style={styles.settingsBrandHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('settings.main.openMenu')} style={styles.settingsHeaderButton}>
          <Menu color={colors.text} size={26} strokeWidth={1.8} />
        </Pressable>
        <AppBrandLogo colors={colors} style={styles.settingsBrandLogo} />
        <Pressable accessibilityRole="button" accessibilityLabel={t('settings.main.openChat')} onPress={onOpenChat} style={styles.settingsHeaderButton}>
          <MessageCircle color={colors.text} size={25} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.settingsIntro}>
        <Text style={[styles.settingsScreenTitle, { color: colors.text }]}>{t('settings.main.title')}</Text>
        <Text style={[styles.settingsScreenSubtitle, { color: colors.textSecondary }]}>{t('settings.main.subtitle')}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onOpenBackup}
        style={({ pressed }) => [
          styles.backupCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
        ]}
      >
        <View style={[styles.backupIcon, { backgroundColor: colors.surfaceMuted }]}>
          <CloudUpload color={colors.primaryDark} size={40} strokeWidth={1.7} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.backupTitle, { color: colors.text }]}>{t('settings.main.backupTitle')}</Text>
          <Text style={[styles.backupDescription, { color: colors.textSecondary }]}>{t('settings.main.backupDescription')}</Text>
          <View style={styles.backupStatus}>
            <CheckCircle2 color={colors.success} size={14} fill={colors.success} />
            <Text style={[styles.backupStatusText, { color: colors.success }]}>{t('settings.main.backupStatus')}</Text>
          </View>
        </View>
        <ListChevron colors={colors} />
      </Pressable>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>{t('settings.main.accountSection')}</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={Eye} title={t('settings.main.links.displayTitle')} description={t('settings.main.links.displayDescription')} onPress={onOpenDisplay} />
        <SettingsLink colors={colors} icon={ShieldCheck} title={t('settings.main.links.securityTitle')} description={t('settings.main.links.securityDescription')} onPress={onOpenSecurity} divider />
        <SettingsLink colors={colors} icon={Settings2} title={t('settings.main.links.governanceTitle')} description={t('settings.main.links.governanceDescription')} onPress={onOpenGovernance} divider />
        <SettingsLink colors={colors} icon={Bell} title={t('settings.main.links.notificationsTitle')} description={t('settings.main.links.notificationsDescription')} onPress={onOpenNotifications} divider />
      </Card>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>{t('settings.main.privacySection')}</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={LockKeyhole} title={t('settings.main.links.sharingTitle')} description={t('settings.main.links.sharingDescription')} onPress={onOpenSharing} />
        <SettingsLink colors={colors} icon={Database} title={t('settings.main.links.dataTitle')} description={t('settings.main.links.dataDescription')} onPress={onOpenData} divider />
        <SettingsLink colors={colors} icon={Eye} title={t('settings.main.links.activityTitle')} description={t('settings.main.links.activityDescription')} onPress={onOpenActivity} divider />
      </Card>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>{t('settings.main.supportSection')}</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={CircleHelp} title={t('settings.main.links.helpTitle')} description={t('settings.main.links.helpDescription')} onPress={onOpenHelp} />
        <SettingsLink colors={colors} icon={Info} title={t('settings.main.links.aboutTitle')} description={t('settings.main.links.aboutDescription')} onPress={onOpenAbout} divider />
      </Card>

      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={LogOut} title={t('settings.main.logoutAction')} description="" onPress={confirmLogout} danger />
      </Card>
    </ScreenScroll>
  );
}
