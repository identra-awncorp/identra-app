import { Text, View } from 'react-native';
import { AppBrandLogo } from '../../../components/AppLogo';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { settingsStyles as styles } from '../settingsStyles';

export function AboutScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const { t } = useI18n();

  return (
    <ScreenScroll id="screen-settings-about" colors={colors}>
      <AppHeader colors={colors} title={t('settings.about.title')} onBack={onBack} />
      <View style={styles.helpHero}>
        <AppBrandLogo colors={colors} logoSize={86} wordmarkSize={28} vertical />
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>{t('settings.about.description')}</Text>
      </View>
      <Card colors={colors}>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('settings.about.version')}</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('settings.about.platform')}</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>Expo / React Native</Text>
        </View>
        <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('settings.about.support')}</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>{t('settings.about.supportedPlatforms')}</Text>
        </View>
      </Card>
    </ScreenScroll>
  );
}
