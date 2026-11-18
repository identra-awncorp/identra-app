import { CircleCheck, CircleSlash, History, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import { useI18n, type I18nKey } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, radius, spacing, typography } from '../../../theme';
import { SettingsLink } from '../components/SettingsLink';
import { settingsStyles } from '../settingsStyles';

const INCLUDED: I18nKey[] = ['settings.backup.included.a', 'settings.backup.included.b'];
const NEVER: I18nKey[] = ['settings.backup.never.a', 'settings.backup.never.b', 'settings.backup.never.c'];

/** What the phone's own backup carries for the wallet (ADR-0009 §5), and what it never does. */
export function BackupSettingsScreen({ colors, onBack, onOpenRestore }: { colors: AppColors; onBack: () => void; onOpenRestore: () => void }) {
  const { t } = useI18n();
  const group = (Icon: LucideIcon, color: string, title: I18nKey, lines: I18nKey[]) => (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <Icon color={color} size={20} strokeWidth={2} />
        <Text style={[styles.groupTitle, { color: colors.text }]}>{t(title)}</Text>
      </View>
      {lines.map((key) => (
        <Text key={key} style={[styles.line, { color: colors.text }]}>
          {'•  '}
          {t(key)}
        </Text>
      ))}
    </View>
  );

  return (
    <ScreenScroll id="screen-settings-backup" colors={colors} contentStyle={styles.content}>
      <AppHeader colors={colors} title={t('settings.backup.title')} onBack={onBack} />
      <View style={styles.intro}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.backup.heroTitle')}</Text>
        <Text style={[styles.lead, { color: colors.textSecondary }]}>{t('settings.backup.heroDescription')}</Text>
      </View>
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {group(CircleCheck, colors.success, 'settings.backup.includedTitle', INCLUDED)}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {group(CircleSlash, colors.danger, 'settings.backup.neverTitle', NEVER)}
      </View>
      <Card colors={colors} style={settingsStyles.settingsList}>
        <SettingsLink colors={colors} icon={History} title={t('settings.backup.restoreTitle')} description={t('settings.backup.restoreDescription')} onPress={onOpenRestore} />
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxl },
  intro: { gap: spacing.sm },
  title: { fontSize: typography.size.lg, lineHeight: typography.lineHeight.lg, fontWeight: typography.weight.extraBold },
  lead: { fontSize: typography.size.sm, lineHeight: 21 },
  panel: { borderWidth: border.thin, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg },
  group: { gap: spacing.sm },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  line: { fontSize: typography.size.sm, lineHeight: 21, paddingLeft: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth },
});
