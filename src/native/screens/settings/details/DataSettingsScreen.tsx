import { Download, FileText, HardDrive, Trash2 } from 'lucide-react-native';
import { Alert, Text } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { SettingsLink } from '../components/SettingsLink';
import { settingsStyles as styles } from '../settingsStyles';

export function DataSettingsScreen({
  colors,
  onBack,
  onClearDemo,
  onResetDemo,
}: {
  colors: AppColors;
  onBack: () => void;
  onClearDemo: () => void;
  onResetDemo: () => void;
}) {
  const { t } = useI18n();
  const confirmClear = () =>
    Alert.alert(t('settings.data.clearTitle'), t('settings.data.clearDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.data.clearAction'), style: 'destructive', onPress: onClearDemo },
    ]);

  return (
    <ScreenScroll id="screen-settings-data" colors={colors}>
      <AppHeader colors={colors} title={t('settings.data.title')} onBack={onBack} />
      <Text style={[styles.sampleSettingsDescription, { color: colors.textSecondary }]}>{t('settings.data.description')}</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={FileText} title={t('settings.data.viewTitle')} description={t('settings.data.viewDescription')} onPress={() => Alert.alert(t('settings.data.viewAlertTitle'), t('settings.data.viewAlertDescription'))} />
        <SettingsLink colors={colors} icon={Download} title={t('settings.data.downloadTitle')} description={t('settings.data.downloadDescription')} onPress={() => Alert.alert(t('settings.data.downloadAlertTitle'), t('settings.data.downloadAlertDescription'))} divider />
        <SettingsLink colors={colors} icon={Trash2} title={t('settings.data.emptyDemoTitle')} description={t('settings.data.emptyDemoDescription')} onPress={confirmClear} divider danger />
        <SettingsLink colors={colors} icon={HardDrive} title={t('settings.data.restoreDemoTitle')} description={t('settings.data.restoreDemoDescription')} onPress={onResetDemo} divider />
      </Card>
    </ScreenScroll>
  );
}
