import { BookOpen, ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { settingsStyles as styles } from '../settingsStyles';

export function HelpScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const { t } = useI18n();
  const topics = [
    t('settings.help.topics.receiveCredential'),
    t('settings.help.topics.shareSafely'),
    t('settings.help.topics.recoverAccess'),
    t('settings.help.topics.reportSuspicious'),
  ];

  return (
    <ScreenScroll id="screen-settings-help" colors={colors}>
      <AppHeader colors={colors} title={t('settings.help.title')} onBack={onBack} />
      <View style={styles.helpHero}>
        <View style={[styles.helpIcon, { backgroundColor: colors.surfaceMuted }]}>
          <BookOpen color={colors.primaryDark} size={36} />
        </View>
        <Text style={[styles.helpTitle, { color: colors.text }]}>{t('settings.help.heroTitle')}</Text>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>{t('settings.help.heroDescription')}</Text>
      </View>
      <Card colors={colors} style={styles.settingsList}>
        {topics.map((title, index) => (
          <View key={title} style={[styles.helpRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.settingsTitle, { color: colors.text, flex: 1 }]}>{title}</Text>
            <ChevronRight color={colors.textSecondary} size={20} />
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}
