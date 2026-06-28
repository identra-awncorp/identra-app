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
import type { AppColors } from '../../../theme';
import { palette } from '../../../theme';
import type { ActivityLog } from '../../../types';
import { settingsStyles as styles } from '../settingsStyles';

type StatusFilter = 'all' | NonNullable<ActivityLog['status']>;
type TypeFilter = 'all' | 'verify' | 'share';
type PeriodFilter = 'all' | 'today' | 'yesterday';
type ActivityFilters = { status: StatusFilter; type: TypeFilter; period: PeriodFilter };

const defaultFilters: ActivityFilters = { status: 'all', type: 'all', period: 'all' };

export function ActivityScreen({ colors, logs, onOpenChat }: { colors: AppColors; logs: ActivityLog[]; onOpenChat: () => void }) {
  const [filters, setFilters] = useState<ActivityFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<ActivityFilters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  const visible = useMemo(
    () =>
      logs.filter((log) => {
        const status = activityStatus(log);
        return (filters.status === 'all' || filters.status === status) &&
          (filters.type === 'all' || filters.type === log.type) &&
          (filters.period === 'all' || filters.period === activityPeriod(log));
      }),
    [filters, logs],
  );

  const hasDemoData = logs.some((log) => log.isDemo);
  const summary = hasDemoData
    ? { total: 24, success: 22, pending: 2, failed: 0 }
    : {
        total: logs.length,
        success: logs.filter((log) => activityStatus(log) === 'success').length,
        pending: logs.filter((log) => activityStatus(log) === 'pending').length,
        failed: logs.filter((log) => activityStatus(log) === 'failed').length,
      };
  const grouped = [
    { key: 'today' as const, label: 'Hôm nay', items: visible.filter((log) => activityPeriod(log) === 'today') },
    { key: 'yesterday' as const, label: 'Hôm qua', items: visible.filter((log) => activityPeriod(log) === 'yesterday') },
    { key: 'older' as const, label: 'Trước đó', items: visible.filter((log) => activityPeriod(log) === 'older') },
  ].filter((group) => group.items.length);
  const activeFilterCount = Object.values(filters).filter((value) => value !== 'all').length;

  const openFilters = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };

  return (
    <>
      <ScreenScroll id="screen-activity" colors={colors} contentStyle={styles.activityScreenContent}>
        <View style={styles.activityBrandHeader}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mở menu" style={styles.activityHeaderButton}>
            <Menu color={colors.text} size={26} />
          </Pressable>
          <AppBrandLogo colors={colors} style={styles.activityBrandLogo} />
          <Pressable accessibilityRole="button" accessibilityLabel="Mở Chat" onPress={onOpenChat} style={styles.activityHeaderButton}>
            <MessageCircle color={colors.text} size={25} />
          </Pressable>
        </View>

        <View style={styles.activityTitleRow}>
          <View style={styles.activityTitleText}>
            <Text style={[styles.activityScreenTitle, { color: colors.text }]}>Hoạt động</Text>
            <Text style={[styles.activityIntro, { color: colors.textSecondary }]}>
              Theo dõi các hoạt động xác minh và chia sẻ dữ liệu
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bộ lọc hoạt động"
            onPress={openFilters}
            style={({ pressed }) => [
              styles.activityFilterButton,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Filter color={activeFilterCount ? colors.primaryDark : colors.text} size={22} />
            <Text style={[styles.activityFilterButtonText, { color: activeFilterCount ? colors.primaryDark : colors.textSecondary }]}>
              Bộ lọc
            </Text>
            {activeFilterCount ? (
              <View style={styles.activityFilterCount}>
                <Text style={styles.activityFilterCountText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.activitySummary}>
          <ActivitySummaryCard colors={colors} icon={ShieldCheck} label="Tổng hoạt động" value={summary.total} footer="Trong 30 ngày" tone="primary" />
          <ActivitySummaryCard colors={colors} icon={CheckCircle2} label="Thành công" value={summary.success} footer={percentage(summary.success, summary.total)} tone="success" />
          <ActivitySummaryCard colors={colors} icon={Clock3} label="Đang chờ" value={summary.pending} footer={percentage(summary.pending, summary.total)} tone="pending" />
          <ActivitySummaryCard colors={colors} icon={CircleX} label="Thất bại" value={summary.failed} footer={percentage(summary.failed, summary.total)} tone="failed" />
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
            title={logs.length ? 'Không có hoạt động phù hợp' : 'Chưa có hoạt động'}
            description={logs.length
              ? 'Thử thay đổi hoặc đặt lại bộ lọc để xem các hoạt động khác.'
              : 'Các hoạt động nhận, xác minh và chia sẻ dữ liệu sẽ xuất hiện tại đây.'}
            action={logs.length ? 'Đặt lại bộ lọc' : undefined}
            onAction={logs.length ? () => setFilters(defaultFilters) : undefined}
          />
        )}
      </ScreenScroll>

      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <View nativeID="screen-activity-filter" testID="screen-activity-filter" style={styles.activityFilterOverlay}>
          <Pressable accessibilityLabel="Đóng bộ lọc" style={styles.activityFilterBackdrop} onPress={() => setFilterOpen(false)} />
          <View style={[styles.activityFilterSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityFilterHeader}>
              <Text style={[styles.activityFilterTitle, { color: colors.text }]}>Bộ lọc hoạt động</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Đóng bộ lọc" onPress={() => setFilterOpen(false)} style={styles.activityFilterClose}>
                <X color={colors.textSecondary} size={22} />
              </Pressable>
            </View>
            <ActivityFilterSection
              colors={colors}
              title="Trạng thái"
              options={[['all', 'Tất cả'], ['success', 'Thành công'], ['pending', 'Đang chờ'], ['failed', 'Thất bại']]}
              selected={draftFilters.status}
              onSelect={(status) => setDraftFilters((current) => ({ ...current, status: status as StatusFilter }))}
            />
            <ActivityFilterSection
              colors={colors}
              title="Loại hoạt động"
              options={[['all', 'Tất cả'], ['verify', 'Xác minh'], ['share', 'Chia sẻ']]}
              selected={draftFilters.type}
              onSelect={(type) => setDraftFilters((current) => ({ ...current, type: type as TypeFilter }))}
            />
            <ActivityFilterSection
              colors={colors}
              title="Thời gian"
              options={[['all', 'Tất cả'], ['today', 'Hôm nay'], ['yesterday', 'Hôm qua']]}
              selected={draftFilters.period}
              onSelect={(period) => setDraftFilters((current) => ({ ...current, period: period as PeriodFilter }))}
            />
            <View style={styles.activityFilterActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDraftFilters(defaultFilters)}
                style={[styles.activityFilterReset, { borderColor: colors.border }]}
              >
                <Text style={[styles.activityFilterResetText, { color: colors.text }]}>Đặt lại</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setFilters(draftFilters);
                  setFilterOpen(false);
                }}
                style={[styles.activityFilterApply, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={styles.activityFilterApplyText}>Áp dụng</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function percentage(value: number, total: number) {
  if (!total) return '0%';
  return `${Number(((value / total) * 100).toFixed(1))}%`;
}

function activityStatus(log: ActivityLog): NonNullable<ActivityLog['status']> {
  if (log.status) return log.status;
  const content = `${log.title} ${log.description}`.toLocaleLowerCase('vi');
  if (content.includes('thất bại') || content.includes('từ chối')) return 'failed';
  if (content.includes('chờ')) return 'pending';
  return 'success';
}

function activityPeriod(log: ActivityLog): 'today' | 'yesterday' | 'older' {
  if (log.isDemo) return ['activity-1', 'activity-2', 'activity-3'].includes(log.id) ? 'today' : 'yesterday';
  const date = new Date(log.timestamp);
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayStart = new Date(dayStart);
  yesterdayStart.setDate(dayStart.getDate() - 1);
  if (date >= dayStart) return 'today';
  if (date >= yesterdayStart) return 'yesterday';
  return 'older';
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
  const status = activityStatus(log);
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
              <Text style={styles.activityNewPillText}>Mới</Text>
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
    const failed = activityStatus(log) === 'failed';
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
  options: Array<[string, string]>;
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
