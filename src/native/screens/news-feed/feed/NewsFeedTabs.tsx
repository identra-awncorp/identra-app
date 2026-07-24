import { Pressable, Text, View } from 'react-native';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { newsFeedStyles as styles } from './newsFeedStyles';

export type NewsFeedTab = 'for-you' | 'following';

export function NewsFeedTabs({
  activeTab,
  colors,
  onChange,
}: {
  activeTab: NewsFeedTab;
  colors: AppColors;
  onChange: (tab: NewsFeedTab) => void;
}) {
  const { t } = useI18n();
  const forYouActive = activeTab === 'for-you';

  return (
    <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: forYouActive }} onPress={() => onChange('for-you')} style={styles.tab}>
        <Text style={[forYouActive ? styles.activeTabText : styles.tabText, { color: forYouActive ? colors.text : colors.textSecondary }]}>{t('newsFeed.tabs.forYou')}</Text>
        {forYouActive ? <View style={[styles.activeIndicator, { backgroundColor: colors.primaryDark }]} /> : null}
      </Pressable>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: !forYouActive }} onPress={() => onChange('following')} style={styles.tab}>
        <Text style={[!forYouActive ? styles.activeTabText : styles.tabText, { color: !forYouActive ? colors.text : colors.textSecondary }]}>{t('newsFeed.tabs.following')}</Text>
        {!forYouActive ? <View style={[styles.activeIndicator, { backgroundColor: colors.primaryDark }]} /> : null}
      </Pressable>
    </View>
  );
}
