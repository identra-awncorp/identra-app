import { Bell, Search } from 'lucide-react-native';

import { MainTopHeader } from '../../../components/MainTopHeader';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { paymentT } from '../paymentI18n';

export function PaymentHeader({
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
      menuLabel={paymentT(t, 'home.header.openMenu')}
      onOpenMenu={onOpenMenu}
      actions={[
        {
          key: 'search',
          label: paymentT(t, 'home.header.search'),
          icon: Search,
          onPress: onOpenSearch,
        },
        {
          key: 'notifications',
          label: paymentT(t, 'home.header.notifications'),
          icon: Bell,
          onPress: onOpenNotifications,
          badge: '3',
        },
      ]}
    />
  );
}
