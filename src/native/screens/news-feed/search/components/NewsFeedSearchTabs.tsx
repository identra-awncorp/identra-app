import { Pressable, Text, View } from 'react-native';
import { useI18n } from '../../../../i18n';
import type { AppColors } from '../../../../theme';
import type { NewsFeedSearchTab } from '../../../../data/demo/newsFeedSearchDemoData';
import { newsFeedSearchStyles as styles } from '../newsFeedSearchStyles';
import { newsFeedSearchTabs } from '../newsFeedSearchTabs';

export function NewsFeedSearchTabs({
  activeTab,
  colors,
  onChangeTab,
}: {
  activeTab: NewsFeedSearchTab;
  colors: AppColors;
  onChangeTab: (tab: NewsFeedSearchTab) => void;
}) {
  const { t } = useI18n();

  return (
    <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
      {newsFeedSearchTabs.map((tab) => {
        const active = activeTab === tab.key;
        const tabLabel = t(tab.labelKey);
        return (
          <Pressable
            key={tab.key}
            accessibilityLabel={t('newsFeedSearch.switchTab', { tab: tabLabel })}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChangeTab(tab.key)}
            style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.62 : 1 }]}
          >
            <Text numberOfLines={1} style={[styles.tabText, { color: active ? colors.primaryDark : colors.textSecondary }, active && styles.activeTabText]}>
              {tabLabel}
            </Text>
            {active ? <View style={[styles.tabIndicator, { backgroundColor: colors.primaryDark }]} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
