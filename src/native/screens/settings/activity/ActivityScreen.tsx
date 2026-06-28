import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock3,
  Filter,
  GraduationCap,
  Menu,
  MessageCircle,
  Share2,
  Shield,
  ShieldCheck,
  University,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';
import { AppBrandLogo } from '../../../components/AppLogo';
import { EmptyState, ScreenScroll } from '../../../components/AppUiPrimitives';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { palette } from '../../../theme';
import type { ActivityLog } from '../../../types';
import { settingsStyles as styles } from '../settingsStyles';
import {
  defaultActivityFilters,
  filterActivityLogs,
  formatActivityPercentage,
  getActiveActivityFilterCount,
  getActivityPeriod,
  getActivityStatus,
  getActivitySummary,
  type ActivityPeriodFilter,
  type ActivityStatusFilter,
  type ActivityTypeFilter,
} from './activityLogLogic';

export function ActivityScreen({ colors, logs, onOpenChat }: { colors: AppColors; logs: ActivityLog[]; onOpenChat: () => void }) {
  const { t } = useI18n();
  const [filters, setFilters] = useState(defaultActivityFilters);
  const [draftFilters, setDraftFilters] = useState(defaultActivityFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  const visible = useMemo(
    () => filterActivityLogs(logs, filters),
    [filters, logs],
  );

  const summary = getActivitySummary(logs);
  const grouped = [
    { key: 'today' as const, label: t('settings.activity.groups.today'), items: visible.filter((log) => getActivityPeriod(log) === 'today') },
    { key: 'yesterday' as const, label: t('settings.activity.groups.yesterday'), items: visible.filter((log) => getActivityPeriod(log) === 'yesterday') },
    { key: 'older' as const, label: t('settings.activity.groups.older'), items: visible.filter((log) => getActivityPeriod(log) === 'older') },
  ].filter((group) => group.items.length);
  const activeFilterCount = getActiveActivityFilterCount(filters);

  const openFilters = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };

  return (
    <>
      <ScreenScroll id="screen-activity" colors={colors} contentStyle={styles.activityScreenContent}>
        <View style={styles.activityBrandHeader}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('settings.main.openMenu')} style={styles.activityHeaderButton}>
            <Menu color={colors.text} size={26} />
          </Pressable>
          <AppBrandLogo colors={colors} style={styles.activityBrandLogo} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('settings.main.openChat')} onPress={onOpenChat} style={styles.activityHeaderButton}>
            <MessageCircle color={colors.text} size={25} />
          </Pressable>
        </View>

        <View style={styles.activityTitleRow}>
          <View style={styles.activityTitleText}>
            <Text style={[styles.activityScreenTitle, { color: colors.text }]}>{t('settings.activity.title')}</Text>
            <Text style={[styles.activityIntro, { color: colors.textSecondary }]}>
              {t('settings.activity.intro')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.activity.filterAccessibility')}
            onPress={openFilters}
            style={({ pressed }) => [
              styles.activityFilterButton,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Filter color={activeFilterCount ? colors.primaryDark : colors.text} size={22} />
            <Text style={[styles.activityFilterButtonText, { color: activeFilterCount ? colors.primaryDark : colors.textSecondary }]}>
              {t('settings.activity.filter')}
            </Text>
            {activeFilterCount ? (
              <View style={styles.activityFilterCount}>
                <Text style={styles.activityFilterCountText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.activitySummary}>
          <ActivitySummaryCard colors={colors} icon={ShieldCheck} label={t('settings.activity.summary.total')} value={summary.total} footer={t('settings.activity.summary.totalFooter')} tone="primary" />
          <ActivitySummaryCard colors={colors} icon={CheckCircle2} label={t('settings.activity.summary.success')} value={summary.success} footer={formatActivityPercentage(summary.success, summary.total)} tone="success" />
          <ActivitySummaryCard colors={colors} icon={Clock3} label={t('settings.activity.summary.pending')} value={summary.pending} footer={formatActivityPercentage(summary.pending, summary.total)} tone="pending" />
          <ActivitySummaryCard colors={colors} icon={CircleX} label={t('settings.activity.summary.failed')} value={summary.failed} footer={formatActivityPercentage(summary.failed, summary.total)} tone="failed" />
        </View>

        {grouped.length ? grouped.map((group) => (
          <View key={group.key} style={styles.activityGroup}>
            <Text style={[styles.activityGroupTitle, { color: colors.text }]}>{group.label}</Text>
            <View style={[styles.activityList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {group.items.map((log, index) => (
                <ActivityRow
                  key={log.id}
                  colors={colors}
                  log={log}
                  showDate={group.key !== 'today'}
                  divider={index < group.items.length - 1}
                />
              ))}
            </View>
          </View>
        )) : (
          <EmptyState
            colors={colors}
            icon={Activity}
            title={logs.length ? t('settings.activity.emptyFilteredTitle') : t('settings.activity.emptyTitle')}
            description={logs.length
              ? t('settings.activity.emptyFilteredDescription')
              : t('settings.activity.emptyDescription')}
            action={logs.length ? t('common.reset') : undefined}
            onAction={logs.length ? () => setFilters(defaultActivityFilters) : undefined}
          />
        )}
      </ScreenScroll>

      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <View nativeID="screen-activity-filter" testID="screen-activity-filter" style={styles.activityFilterOverlay}>
          <Pressable accessibilityLabel={t('settings.activity.closeFilter')} style={styles.activityFilterBackdrop} onPress={() => setFilterOpen(false)} />
          <View style={[styles.activityFilterSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityFilterHeader}>
              <Text style={[styles.activityFilterTitle, { color: colors.text }]}>{t('settings.activity.filterTitle')}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={t('settings.activity.closeFilter')} onPress={() => setFilterOpen(false)} style={styles.activityFilterClose}>
                <X color={colors.textSecondary} size={22} />
              </Pressable>
            </View>
            <ActivityFilterSection
              colors={colors}
              title={t('settings.activity.statusSection')}
              options={[['all', t('settings.activity.all')], ['success', t('settings.activity.summary.success')], ['pending', t('settings.activity.summary.pending')], ['failed', t('settings.activity.summary.failed')]]}
              selected={draftFilters.status}
              onSelect={(status) => setDraftFilters((current) => ({ ...current, status: status as ActivityStatusFilter }))}
            />
            <ActivityFilterSection
              colors={colors}
              title={t('settings.activity.typeSection')}
              options={[['all', t('settings.activity.all')], ['verify', t('settings.activity.verify')], ['share', t('settings.activity.share')]]}
              selected={draftFilters.type}
              onSelect={(type) => setDraftFilters((current) => ({ ...current, type: type as ActivityTypeFilter }))}
            />
            <ActivityFilterSection
              colors={colors}
              title={t('settings.activity.periodSection')}
              options={[['all', t('settings.activity.all')], ['today', t('settings.activity.groups.today')], ['yesterday', t('settings.activity.groups.yesterday')]]}
              selected={draftFilters.period}
              onSelect={(period) => setDraftFilters((current) => ({ ...current, period: period as ActivityPeriodFilter }))}
            />
            <View style={styles.activityFilterActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDraftFilters(defaultActivityFilters)}
                style={[styles.activityFilterReset, { borderColor: colors.border }]}
              >
                <Text style={[styles.activityFilterResetText, { color: colors.text }]}>{t('common.reset')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setFilters(draftFilters);
                  setFilterOpen(false);
                }}
                style={[styles.activityFilterApply, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={styles.activityFilterApplyText}>{t('common.apply')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ActivitySummaryCard({
  colors,
  icon: Icon,
  label,
  value,
  footer,
  tone,
}: {
  colors: AppColors;
  icon: LucideIcon;
  label: string;
  value: number;
  footer: string;
  tone: 'primary' | 'success' | 'pending' | 'failed';
}) {
  const tones = {
    primary: { color: '#2864F0', background: '#EDF3FF' },
    success: { color: '#19B970', background: '#EAFBF3' },
    pending: { color: palette.orange[500], background: palette.orange[100] },
    failed: { color: '#9256DF', background: palette.purple[100] },
  };
  const style = tones[tone];
  return (
    <View style={[styles.activitySummaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.activitySummaryIcon, { backgroundColor: style.background }]}>
        <Icon color={style.color} size={22} strokeWidth={2} />
      </View>
      <Text numberOfLines={1} style={[styles.activitySummaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.activitySummaryValue, { color: style.color }]}>{value}</Text>
      <Text style={[styles.activitySummaryFooter, { color: colors.textSecondary }]}>{footer}</Text>
    </View>
  );
}

function ActivityRow({ colors, log, showDate, divider }: { colors: AppColors; log: ActivityLog; showDate: boolean; divider: boolean }) {
  const { t } = useI18n();
  const status = getActivityStatus(log);
  const statusStyle = {
    success: { color: palette.green[600], icon: CheckCircle2 },
    pending: { color: palette.orange[500], icon: Clock3 },
    failed: { color: palette.red[500], icon: Clock3 },
  }[status];
  const StatusIcon = statusStyle.icon;
  const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(log.timestamp));
  const date = new Intl.DateTimeFormat('vi-VN').format(new Date(log.timestamp));
  return (
    <View
      style={[
        styles.activityRow,
        log.isNew && styles.activityRowNew,
        log.isNew && { backgroundColor: colors.surfaceMuted },
        divider && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      {log.isNew ? <View style={[styles.activityNewAccent, { backgroundColor: colors.primaryDark }]} /> : null}
      <ActivityLeadingIcon log={log} />
      <View style={styles.activityRowContent}>
        <View style={styles.activityRowTitleLine}>
          <Text numberOfLines={1} style={[styles.activityTitle, { color: colors.text }]}>{log.title}</Text>
          {log.isNew ? (
            <View style={[styles.activityNewPill, { backgroundColor: colors.primaryDark }]}>
              <Text style={styles.activityNewPillText}>{t('settings.activity.new')}</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} style={[styles.activityPartner, { color: colors.textSecondary }]}>{log.partner}</Text>
        <View style={styles.activityStatus}>
          <StatusIcon color={statusStyle.color} size={13} strokeWidth={2.5} />
          <Text style={[styles.activityStatusText, { color: statusStyle.color }]}>{log.description}</Text>
        </View>
      </View>
      <View style={styles.activityTime}>
        {showDate ? <Text style={[styles.activityDate, { color: colors.textSecondary }]}>{date}</Text> : null}
        <Text style={[styles.activityClock, { color: colors.textSecondary }]}>{time}</Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={19} />
    </View>
  );
}

function ActivityLeadingIcon({ log }: { log: ActivityLog }) {
  if (log.title === 'Bằng tốt nghiệp') return <ActivityIconBox icon={GraduationCap} color={palette.navy[600]} background={palette.blue[100]} />;
  if (log.title === 'Chứng chỉ ngoại ngữ') {
    return <View style={[styles.activityLeadingIcon, { backgroundColor: palette.blue[100] }]}><View style={styles.activityIelts}><Text style={styles.activityIeltsText}>IELTS</Text></View></View>;
  }
  if (log.title === 'KYC Level 2') {
    const failed = getActivityStatus(log) === 'failed';
    return (
      <View style={[styles.activityLeadingIcon, { backgroundColor: failed ? palette.red[100] : palette.blue[100] }]}>
        <Shield color={failed ? '#FF5C63' : palette.slate[700]} fill={failed ? '#FF7379' : palette.slate[700]} size={35} strokeWidth={1.5} />
        {failed ? <X color={palette.white} size={16} strokeWidth={2.5} style={styles.activityShieldOverlay} /> : <Text style={styles.activityKycText}>KYC</Text>}
      </View>
    );
  }
  if (log.type === 'share' && log.partner.includes('Bảo hiểm')) return <ActivityIconBox icon={University} color="#5B76F6" background={palette.blue[100]} />;
  if (log.type === 'share') {
    return (
      <View style={[styles.activityLeadingIcon, { backgroundColor: palette.blue[100] }]}>
        <Shield color="#5B76F6" fill="#6D8BFA" size={35} strokeWidth={1.4} />
        <Share2 color={palette.white} size={14} strokeWidth={2.2} style={styles.activityShieldOverlay} />
      </View>
    );
  }
  return <ActivityIconBox icon={ShieldCheck} color={palette.blue[700]} background={palette.blue[100]} />;
}

function ActivityIconBox({ icon: Icon, color, background }: { icon: LucideIcon; color: string; background: string }) {
  return <View style={[styles.activityLeadingIcon, { backgroundColor: background }]}><Icon color={color} size={29} strokeWidth={1.9} /></View>;
}

function ActivityFilterSection({
  colors,
  title,
  options,
  selected,
  onSelect,
}: {
  colors: AppColors;
  title: string;
  options: [string, string][];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.activityFilterSection}>
      <Text style={[styles.activityFilterSectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.activityFilterOptions}>
        {options.map(([value, label]) => {
          const active = selected === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(value)}
              style={[
                styles.activityFilterOption,
                {
                  backgroundColor: active ? colors.surfaceMuted : colors.surface,
                  borderColor: active ? colors.primaryDark : colors.border,
                },
              ]}
            >
              <Text style={[styles.activityFilterOptionText, { color: active ? colors.primaryDark : colors.textSecondary }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
