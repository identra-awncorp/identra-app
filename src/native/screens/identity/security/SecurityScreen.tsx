import {
  ShieldCheck,
} from 'lucide-react-native';
import { Text, View } from 'react-native';
import type { AppColors } from '../../../theme';
import type { AppSettings } from '../../../types';
import { useI18n } from '../../../i18n';


import {
  AppHeader,
  Card,
  ScreenScroll,
  SectionHeading,
} from '../../../components/AppUiPrimitives';
import { styles } from '../../shared/DetailScreenSharedStyles';
import { SettingToggle } from '../../settings/SettingToggle';

export function SecurityScreen({
  colors,
  settings,
  onBack,
  onSettings,
}: {
  colors: AppColors;
  settings: AppSettings;
  onBack: () => void;
  onSettings: (settings: Partial<AppSettings>) => void;
}) {
  const { t } = useI18n();
  return (
    <ScreenScroll id="screen-security" colors={colors}>
      <AppHeader colors={colors} title={t('identity.security.title')} onBack={onBack} />
      <Card colors={colors}>
        <View style={styles.securityScore}>
          <View style={styles.securityScoreIcon}>
            <ShieldCheck color={colors.success} size={34} />
          </View>
          <View style={styles.securityMain}>
            <Text style={[styles.securityTitle, { color: colors.text }]}>{t('identity.security.scoreTitle')}</Text>
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>{t('identity.security.scoreDescription')}</Text>
          </View>
        </View>
      </Card>
      <SectionHeading colors={colors} title={t('identity.security.privacySection')} />
      <Card colors={colors} style={styles.settingsCard}>
        <SettingToggle
          colors={colors}
          icon={ShieldCheck}
          title={t('identity.security.hideSensitiveTitle')}
          description={t('identity.security.hideSensitiveDescription')}
          value={settings.hideSensitiveData}
          onValueChange={(value: boolean) => onSettings({ hideSensitiveData: value })}
        />
      </Card>
    </ScreenScroll>
  );
}
