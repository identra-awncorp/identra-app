import { useState } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import { useI18n, type I18nKey } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { SettingToggle } from '../SettingToggle';
import { settingsStyles as styles } from '../settingsStyles';

export function ConfigurableSettingsListScreen({
  colors,
  id,
  titleKey,
  descriptionKey,
  rows,
  onBack,
}: {
  colors: AppColors;
  id: string;
  titleKey: I18nKey;
  descriptionKey: I18nKey;
  rows: Array<{ icon: LucideIcon; titleKey: I18nKey; descriptionKey: I18nKey; defaultValue?: boolean }>;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState(() => rows.map((row) => row.defaultValue ?? true));

  return (
    <ScreenScroll id={id} colors={colors}>
      <AppHeader colors={colors} title={t(titleKey)} onBack={onBack} />
      <Text style={[styles.sampleSettingsDescription, { color: colors.textSecondary }]}>{t(descriptionKey)}</Text>
      <Card colors={colors} style={styles.settingsList}>
        {rows.map((row, index) => (
          <SettingToggle
            key={row.titleKey}
            colors={colors}
            icon={row.icon}
            title={t(row.titleKey)}
            description={t(row.descriptionKey)}
            value={values[index]}
            onValueChange={(value) => setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))}
            divider={index > 0}
          />
        ))}
      </Card>
    </ScreenScroll>
  );
}
