import type { ReactNode } from 'react';
import { Bell, Menu, Search } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { paymentT } from '../paymentI18n';
import { paymentHomeStyles as styles } from './paymentHomeStyles';
import { paymentSurfaces } from './paymentSurfaces';

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
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={paymentT(t, 'home.header.openMenu')}
        onPress={onOpenMenu}
        style={({ pressed }) => [styles.headerIconButton, { opacity: pressed ? 0.62 : 1 }]}
      >
        <Menu color={colors.text} size={30} strokeWidth={2} />
      </Pressable>
      <Text numberOfLines={1} style={[styles.brandName, { color: colors.text }]}>
        Identra
      </Text>
      <View style={styles.headerActions}>
        <CircleActionButton colors={colors} label={paymentT(t, 'home.header.search')} onPress={onOpenSearch}>
          <Search color={colors.text} size={25} strokeWidth={2} />
        </CircleActionButton>
        <CircleActionButton colors={colors} label={paymentT(t, 'home.header.notifications')} onPress={onOpenNotifications} badge="3">
          <Bell color={colors.text} size={25} strokeWidth={2} />
        </CircleActionButton>
      </View>
    </View>
  );
}

function CircleActionButton({
  badge,
  children,
  colors,
  label,
  onPress,
}: {
  badge?: string;
  children: ReactNode;
  colors: AppColors;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.circleActionButton,
        paymentSurfaces.control,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {children}
      {badge ? (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
