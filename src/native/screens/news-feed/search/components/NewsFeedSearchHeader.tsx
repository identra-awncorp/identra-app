import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';
import { useI18n } from '../../../../i18n';
import type { AppColors } from '../../../../theme';
import { newsFeedSearchStyles as styles } from '../newsFeedSearchStyles';

export function NewsFeedSearchHeader({
  activeTabLabel,
  canShowFilter,
  colors,
  onBack,
  onOpenFilter,
}: {
  activeTabLabel: string;
  canShowFilter: boolean;
  colors: AppColors;
  onBack: () => void;
  onOpenFilter: () => void;
}) {
  const { t } = useI18n();

  return (
    <View style={styles.searchHeader}>
      <Pressable
        accessibilityLabel={t('newsFeedSearch.backToFeed')}
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.58 : 1 }]}
      >
        <ArrowLeft color={colors.text} size={25} strokeWidth={2.2} />
      </Pressable>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.textSecondary} size={22} strokeWidth={1.9} />
        <TextInput
          accessibilityLabel={t('newsFeedSearch.searchPlaceholder')}
          placeholder={t('newsFeedSearch.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {canShowFilter ? (
        <Pressable
          accessibilityLabel={t('newsFeedSearch.openFilter', { tab: activeTabLabel })}
          accessibilityRole="button"
          onPress={onOpenFilter}
          style={({ pressed }) => [
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.66 : 1 },
          ]}
        >
          <SlidersHorizontal color={colors.textSecondary} size={24} strokeWidth={1.9} />
        </Pressable>
      ) : null}
    </View>
  );
}
