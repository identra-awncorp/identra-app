import { CheckCircle2, Moon, Smartphone, Sun, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import type { AppColors } from '../../../theme';
import type { AppSettings, ThemeMode } from '../../../types';
import { settingsStyles as styles } from '../settingsStyles';

export function DisplaySettingsScreen({
  colors,
  settings,
  onBack,
  onSettings,
}: {
  colors: AppColors;
  settings: AppSettings;
  onBack: () => void;
  onSettings: (settings: Partial<AppSettings>) => void;
}) {
  return (
    <ScreenScroll id="screen-settings-display" colors={colors}>
      <AppHeader colors={colors} title="Quản lý hiển thị" onBack={onBack} />
      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Giao diện</Text>
      <Card colors={colors} style={styles.themeCard}>
        {([
          ['system', 'Theo hệ thống', Smartphone],
          ['light', 'Sáng', Sun],
          ['dark', 'Tối', Moon],
        ] as Array<[ThemeMode, string, LucideIcon]>).map(([value, label, Icon]) => {
          const active = settings.theme === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => onSettings({ theme: value })}
              style={[
                styles.themeOption,
                {
                  borderColor: active ? colors.primaryDark : colors.border,
                  backgroundColor: active ? colors.surfaceMuted : colors.surface,
                },
              ]}
            >
              <Icon color={active ? colors.primaryDark : colors.textSecondary} size={23} />
              <Text style={[styles.themeLabel, { color: active ? colors.primaryDark : colors.text }]}>{label}</Text>
              {active ? <CheckCircle2 color={colors.primaryDark} size={18} /> : null}
            </Pressable>
          );
        })}
      </Card>
      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Ngôn ngữ</Text>
      <Card colors={colors} style={styles.settingsList}>
        {[
          ['vi', 'Tiếng Việt', 'Ngôn ngữ mặc định'],
          ['en', 'English', 'English interface'],
        ].map(([value, title, description], index) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: settings.language === value }}
            onPress={() => onSettings({ language: value as AppSettings['language'] })}
            style={[
              styles.languageRow,
              index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.settingsDescription, { color: colors.textSecondary }]}>{description}</Text>
            </View>
            {settings.language === value ? <CheckCircle2 color={colors.primaryDark} size={22} /> : null}
          </Pressable>
        ))}
      </Card>
    </ScreenScroll>
  );
}
