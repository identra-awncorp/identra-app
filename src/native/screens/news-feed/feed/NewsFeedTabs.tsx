import { Pressable, Text, View } from 'react-native';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { newsFeedStyles as styles } from './newsFeedStyles';

export function NewsFeedTabs({ colors }: { colors: AppColors }) {
  const { t } = useI18n();

  return (
    <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: true }} style={styles.tab}>
        <Text style={[styles.activeTabText, { color: colors.text }]}>{t('newsFeed.tabs.forYou')}</Text>
        <View style={[styles.activeIndicator, { backgroundColor: colors.primaryDark }]} />
      </Pressable>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: false }} style={styles.tab}>
        <Text style={[styles.tabText, { color: colors.textSecondary }]}>{t('newsFeed.tabs.following')}</Text>
      </Pressable>
    </View>
  );
}
