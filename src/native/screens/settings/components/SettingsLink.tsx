import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { ListChevron } from '../../../components/AppUiPrimitives';
import type { AppColors } from '../../../theme';
import { palette } from '../../../theme';
import { settingsStyles as styles } from '../settingsStyles';

export function SettingsLink({
  colors,
  icon: Icon,
  title,
  description,
  onPress,
  divider,
  danger,
}: {
  colors: AppColors;
  icon: LucideIcon;
  title: string;
  description: string;
  onPress: () => void;
  divider?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        divider && { borderTopWidth: 1, borderTopColor: colors.border },
        { opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: danger ? palette.red[100] : colors.surfaceMuted }]}>
        <Icon color={danger ? colors.danger : colors.primaryDark} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingsTitle, { color: danger ? colors.danger : colors.text }]}>{title}</Text>
        {description ? <Text style={[styles.settingsDescription, { color: colors.textSecondary }]}>{description}</Text> : null}
      </View>
      <ListChevron colors={colors} />
    </Pressable>
  );
}
