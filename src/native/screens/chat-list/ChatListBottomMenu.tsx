import { MessageCircle, Newspaper, ScanLine, UserRound, WalletCards } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { AppColors } from '../../theme';
import { styles } from './ChatListStyles';

export function ChatListBottomMenu({
  bottomInset,
  colors,
  onOpenFeed,
  onOpenIDPay,
  onOpenProfile,
  onOpenScan,
}: {
  bottomInset: number;
  colors: AppColors;
  onOpenFeed: () => void;
  onOpenIDPay: () => void;
  onOpenProfile: () => void;
  onOpenScan: () => void;
}) {
  const items = [
    { key: 'chat', label: 'Trò chuyện', icon: MessageCircle, active: true, onPress: () => undefined },
    { key: 'feed', label: 'Bảng tin', icon: Newspaper, active: false, onPress: onOpenFeed },
    { key: 'scan', label: 'Quét mã', icon: ScanLine, active: false, onPress: onOpenScan },
    { key: 'idpay', label: 'IDPay', icon: WalletCards, active: false, onPress: onOpenIDPay },
    { key: 'profile', label: 'Cá nhân', icon: UserRound, active: false, onPress: onOpenProfile },
  ];

  return (
    <View
      nativeID="chat-list-bottom-menu"
      testID="chat-list-bottom-menu"
      style={[
        styles.bottomMenu,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(bottomInset, 8),
        },
      ]}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Pressable
            key={item.key}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: item.active }}
            onPress={item.onPress}
            style={({ pressed }) => [styles.bottomMenuItem, { opacity: pressed ? 0.62 : 1 }]}
          >
            <View style={styles.bottomMenuIcon}>
              <Icon
                color={item.active ? colors.primaryDark : colors.textSecondary}
                fill={item.active && item.key === 'chat' ? colors.primaryDark : 'none'}
                size={23}
                strokeWidth={item.active ? 2.3 : 1.9}
              />
            </View>
            <Text style={[styles.bottomMenuLabel, { color: item.active ? colors.primaryDark : colors.textSecondary }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
