import { useState } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import type { AppColors } from '../../../theme';
import { SettingToggle } from '../SettingToggle';
import { settingsStyles as styles } from '../settingsStyles';

export function ConfigurableSettingsListScreen({
  colors,
  id,
  title,
  description,
  rows,
  onBack,
}: {
  colors: AppColors;
  id: string;
  title: string;
  description: string;
  rows: Array<{ icon: LucideIcon; title: string; description: string; defaultValue?: boolean }>;
  onBack: () => void;
}) {
  const [values, setValues] = useState(() => rows.map((row) => row.defaultValue ?? true));

  return (
    <ScreenScroll id={id} colors={colors}>
      <AppHeader colors={colors} title={title} onBack={onBack} />
      <Text style={[styles.sampleSettingsDescription, { color: colors.textSecondary }]}>{description}</Text>
      <Card colors={colors} style={styles.settingsList}>
        {rows.map((row, index) => (
          <SettingToggle
            key={row.title}
            colors={colors}
            icon={row.icon}
            title={row.title}
            description={row.description}
            value={values[index]}
            onValueChange={(value) => setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
            divider={index > 0}
          />
        ))}
      </Card>
    </ScreenScroll>
  );
}
