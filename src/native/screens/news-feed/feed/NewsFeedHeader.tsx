import { Heart, Search } from 'lucide-react-native';
import { MainTopHeader } from '../../../components/MainTopHeader';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';

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
    <MainTopHeader
      colors={colors}
      menuLabel={t('newsFeed.openMenu')}
      onOpenMenu={onOpenMenu}
      actions={[
        {
          key: 'search',
          label: t('newsFeed.searchFeed'),
          icon: Search,
          onPress: onOpenSearch,
        },
        {
          key: 'notifications',
          label: t('newsFeed.openNotifications'),
          icon: Heart,
          onPress: onOpenNotifications,
          badge: '3',
        },
      ]}
    />
  );
}
