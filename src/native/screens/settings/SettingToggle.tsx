import { ShieldCheck } from 'lucide-react-native';
import { Switch, Text, View } from 'react-native';
import type { AppColors } from '../../theme';
import { palette } from '../../theme';
import { styles } from '../shared/DetailScreenSharedStyles';
export function SettingToggle({
  colors,
  icon: Icon,
  title,
  description,
  value,
  onValueChange,
  divider,
}: {
  colors: AppColors;
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  divider?: boolean;
}) {
  return (
    <View style={[styles.settingRow, divider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Icon color={colors.primaryDark} size={22} />
      </View>
      <View style={styles.settingMain}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={palette.white}
      />
    </View>
  );
}
