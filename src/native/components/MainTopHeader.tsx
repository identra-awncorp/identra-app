import { Menu, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBrandLogo } from './AppLogo';
import { IconButton } from './AppUiPrimitives';
import type { AppColors } from '../theme';
import { iconSize, palette, spacing, touchTarget, typography } from '../theme';

export const MAIN_TOP_HEADER_ROW_HEIGHT = 62;
export const MAIN_TOP_HEADER_HORIZONTAL_PADDING = spacing.lg + spacing.xxs;
export const MAIN_TOP_HEADER_ACTION_GAP = 4;
export const MAIN_TOP_HEADER_MENU_ICON_SIZE = iconSize.lg - 1;
export const MAIN_TOP_HEADER_ACTION_ICON_SIZE = iconSize.md;
export const MAIN_TOP_HEADER_ICON_STROKE = 1.9;

export interface MainTopHeaderAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  badge?: string;
  dot?: boolean;
}

export function MainTopHeader({
  actions,
  colors,
  menuLabel,
  onOpenMenu,
  style,
}: {
  actions?: MainTopHeaderAction[];
  colors: AppColors;
  menuLabel: string;
  onOpenMenu: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, style]}>
      <View style={{ height: insets.top }} />
      <View style={styles.header}>
        <IconButton colors={colors} label={menuLabel} onPress={onOpenMenu} style={styles.headerAction}>
          <Menu color={colors.text} size={MAIN_TOP_HEADER_MENU_ICON_SIZE} strokeWidth={MAIN_TOP_HEADER_ICON_STROKE} />
        </IconButton>
        <AppBrandLogo colors={colors} logoSize={28} wordmarkSize={20} style={styles.brand} />
        <View style={styles.headerActions}>
          {actions?.map((action) => {
            const Icon = action.icon;

            return (
              <IconButton
                key={action.key}
                colors={colors}
                label={action.label}
                onPress={action.onPress}
                style={styles.headerAction}
              >
                <Icon color={colors.text} size={MAIN_TOP_HEADER_ACTION_ICON_SIZE} strokeWidth={MAIN_TOP_HEADER_ICON_STROKE} />
                {action.badge ? (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{action.badge}</Text>
                  </View>
                ) : action.dot ? (
                  <View style={styles.notificationDot} />
                ) : null}
              </IconButton>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
  },
  header: {
    minHeight: MAIN_TOP_HEADER_ROW_HEIGHT,
    paddingHorizontal: MAIN_TOP_HEADER_HORIZONTAL_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brand: { flex: 1, minWidth: 0 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: MAIN_TOP_HEADER_ACTION_GAP },
  headerAction: { width: touchTarget.minimum, height: touchTarget.minimum, borderRadius: touchTarget.minimum / 2 },
  notificationBadge: {
    position: 'absolute',
    top: 1,
    right: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.red[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  notificationBadgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: typography.weight.black,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.red[500],
  },
});
