import { Heart, Menu, Search } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { AppBrandLogo } from '../../../components/AppLogo';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { newsFeedStyles as styles } from './newsFeedStyles';

export function NewsFeedHeader({
  colors,
  onOpenMenu,
  onOpenNotifications,
  onOpenSearch,
}: {
  colors: AppColors;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
}) {
  const { t } = useI18n();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('newsFeed.openMenu')}
        onPress={onOpenMenu}
        style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.62 : 1 }]}
      >
        <Menu color={colors.text} size={29} strokeWidth={1.9} />
      </Pressable>
      <AppBrandLogo colors={colors} logoSize={30} wordmarkSize={20} style={styles.brand} />
      <Pressable
        accessibilityRole="search"
        accessibilityLabel={t('newsFeed.searchFeed')}
        onPress={onOpenSearch}
        style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Search color={colors.textSecondary} size={22} strokeWidth={1.9} />
        <Text numberOfLines={1} style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
          {t('common.search')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('newsFeed.openNotifications')}
        onPress={onOpenNotifications}
        style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.62 : 1 }]}
      >
        <Heart color={colors.textSecondary} size={29} strokeWidth={1.9} />
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>3</Text>
        </View>
      </Pressable>
    </View>
  );
}
