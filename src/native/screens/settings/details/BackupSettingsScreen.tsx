import { useState } from 'react';
import { CloudUpload, Download, RefreshCw } from 'lucide-react-native';
import { Alert, Text, View } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { SettingToggle } from '../SettingToggle';
import { SettingsLink } from '../components/SettingsLink';
import { settingsStyles as styles } from '../settingsStyles';

export function BackupSettingsScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const { t } = useI18n();
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <ScreenScroll id="screen-settings-backup" colors={colors}>
      <AppHeader colors={colors} title={t('settings.backup.title')} onBack={onBack} />
      <View style={styles.helpHero}>
        <View style={[styles.helpIcon, { backgroundColor: colors.surfaceMuted }]}>
          <CloudUpload color={colors.primaryDark} size={38} />
        </View>
        <Text style={[styles.helpTitle, { color: colors.text }]}>{t('settings.backup.heroTitle')}</Text>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>{t('settings.backup.heroDescription')}</Text>
      </View>
      <Card colors={colors} style={styles.settingsList}>
        <SettingToggle colors={colors} icon={RefreshCw} title={t('settings.backup.autoTitle')} description={t('settings.backup.autoDescription')} value={autoBackup} onValueChange={setAutoBackup} />
        <SettingsLink colors={colors} icon={CloudUpload} title={t('settings.backup.backupNowTitle')} description={t('settings.backup.backupNowDescription')} onPress={() => Alert.alert(t('settings.backup.backupDoneTitle'), t('settings.backup.backupDoneDescription'))} divider />
        <SettingsLink colors={colors} icon={Download} title={t('settings.backup.restoreTitle')} description={t('settings.backup.restoreDescription')} onPress={() => Alert.alert(t('settings.backup.restoreTitle'), t('settings.backup.restoreSampleDescription'))} divider />
      </Card>
    </ScreenScroll>
  );
}
