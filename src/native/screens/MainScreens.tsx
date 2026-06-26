import { useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleX,
  CircleHelp,
  CloudUpload,
  Clock3,
  Database,
  Download,
  Eye,
  Filter,
  FileText,
  GraduationCap,
  HardDrive,
  Info,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  RefreshCw,
  Settings2,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  University,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppColors } from '../theme';
import { border, componentSize, palette, radius, spacing, typography } from '../theme';
import type { ActivityLog, AppSettings, ThemeMode } from '../types';
import { AppBrandLogo } from '../components/AppLogo';
import {
  AppHeader,
  Card,
  EmptyState,
  ListChevron,
  ScreenScroll,
  SectionHeading,
} from '../components/ui';
import { SettingToggle } from './SecondaryScreens';

export function ActivityScreen({ colors, logs, onOpenChat }: { colors: AppColors; logs: ActivityLog[]; onOpenChat: () => void }) {
  type StatusFilter = 'all' | NonNullable<ActivityLog['status']>;
  type TypeFilter = 'all' | 'verify' | 'share';
  type PeriodFilter = 'all' | 'today' | 'yesterday';
  type ActivityFilters = { status: StatusFilter; type: TypeFilter; period: PeriodFilter };

  const defaultFilters: ActivityFilters = { status: 'all', type: 'all', period: 'all' };
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
  icon: typeof ShieldCheck;
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

function ActivityIconBox({ icon: Icon, color, background }: { icon: typeof ShieldCheck; color: string; background: string }) {
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

export function SettingsScreen({
  colors,
  onOpenBackup,
  onOpenDisplay,
  onOpenSecurity,
  onOpenGovernance,
  onOpenNotifications,
  onOpenSharing,
  onOpenData,
  onOpenActivity,
  onOpenHelp,
  onOpenAbout,
  onOpenChat,
}: {
  colors: AppColors;
  onOpenBackup: () => void;
  onOpenDisplay: () => void;
  onOpenSecurity: () => void;
  onOpenGovernance: () => void;
  onOpenNotifications: () => void;
  onOpenSharing: () => void;
  onOpenData: () => void;
  onOpenActivity: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenChat: () => void;
}) {
  const confirmLogout = () =>
    Alert.alert('Đăng xuất khỏi Identra?', 'Dữ liệu trong ví vẫn được bảo vệ trên thiết bị này.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive' },
    ]);

  return (
    <ScreenScroll id="screen-settings-main" colors={colors} contentStyle={styles.settingsScreenContent}>
      <View style={styles.settingsBrandHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mở menu" style={styles.settingsHeaderButton}>
          <Menu color={colors.text} size={26} strokeWidth={1.8} />
        </Pressable>
        <AppBrandLogo colors={colors} style={styles.settingsBrandLogo} />
        <Pressable accessibilityRole="button" accessibilityLabel="Mở Chat" onPress={onOpenChat} style={styles.settingsHeaderButton}>
          <MessageCircle color={colors.text} size={25} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.settingsIntro}>
        <Text style={[styles.settingsScreenTitle, { color: colors.text }]}>Cài đặt</Text>
        <Text style={[styles.settingsScreenSubtitle, { color: colors.textSecondary }]}>Quản lý tài khoản và tùy chọn của bạn</Text>
      </View>

      <Pressable
        onPress={onOpenBackup}
        style={({ pressed }) => [
          styles.backupCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
        ]}
      >
        <View style={[styles.backupIcon, { backgroundColor: colors.surfaceMuted }]}>
          <CloudUpload color={colors.primaryDark} size={40} strokeWidth={1.7} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.backupTitle, { color: colors.text }]}>Backup</Text>
          <Text style={[styles.backupDescription, { color: colors.textSecondary }]}>Sao lưu và khôi phục dữ liệu ví Identra của bạn</Text>
          <View style={styles.backupStatus}>
            <CheckCircle2 color={colors.success} size={14} fill={colors.success} />
            <Text style={[styles.backupStatusText, { color: colors.success }]}>Đã sao lưu gần nhất: 20/06/2024 10:30</Text>
          </View>
        </View>
        <ListChevron colors={colors} />
      </Pressable>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Tài khoản</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={Eye} title="Quản lý hiển thị" description="Quản lý thông tin hiển thị và danh tính của bạn" onPress={onOpenDisplay} />
        <SettingsLink colors={colors} icon={ShieldCheck} title="Bảo mật" description="Mật khẩu, xác thực và bảo mật tài khoản" onPress={onOpenSecurity} divider />
        <SettingsLink colors={colors} icon={Settings2} title="Cài đặt khung quản trị" description="Quản lý và cấu hình khung quản trị của bạn" onPress={onOpenGovernance} divider />
        <SettingsLink colors={colors} icon={Bell} title="Thông báo" description="Tùy chọn thông báo và cập nhật" onPress={onOpenNotifications} divider />
      </Card>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Quyền riêng tư</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={LockKeyhole} title="Quyền chia sẻ dữ liệu" description="Quản lý dữ liệu bạn chia sẻ với bên thứ ba" onPress={onOpenSharing} />
        <SettingsLink colors={colors} icon={Database} title="Dữ liệu của bạn" description="Xem, tải xuống hoặc xóa dữ liệu cá nhân" onPress={onOpenData} divider />
        <SettingsLink colors={colors} icon={Eye} title="Lịch sử hoạt động" description="Xem lại các hoạt động và sự kiện" onPress={onOpenActivity} divider />
      </Card>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Hỗ trợ & khác</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={CircleHelp} title="Trung tâm hỗ trợ" description="Câu hỏi thường gặp và hướng dẫn" onPress={onOpenHelp} />
        <SettingsLink colors={colors} icon={Info} title="Giới thiệu về Identra" description="Phiên bản, điều khoản và chính sách" onPress={onOpenAbout} divider />
      </Card>

      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={LogOut} title="Đăng xuất" description="" onPress={confirmLogout} danger />
      </Card>
    </ScreenScroll>
  );
}

function SettingsLink({
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

export function SampleSettingsScreen({
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

export function BackupSettingsScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <ScreenScroll id="screen-settings-backup" colors={colors}>
      <AppHeader colors={colors} title="Backup" onBack={onBack} />
      <View style={styles.helpHero}>
        <View style={[styles.helpIcon, { backgroundColor: colors.surfaceMuted }]}>
          <CloudUpload color={colors.primaryDark} size={38} />
        </View>
        <Text style={[styles.helpTitle, { color: colors.text }]}>Dữ liệu ví đã an toàn</Text>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>Bản sao lưu gần nhất được tạo lúc 10:30, ngày 20/06/2024.</Text>
      </View>
      <Card colors={colors} style={styles.settingsList}>
        <SettingToggle colors={colors} icon={RefreshCw} title="Sao lưu tự động" description="Tự động sao lưu khi có thay đổi" value={autoBackup} onValueChange={setAutoBackup} />
        <SettingsLink colors={colors} icon={CloudUpload} title="Sao lưu ngay" description="Tạo một bản sao lưu mới" onPress={() => Alert.alert('Đã sao lưu', 'Dữ liệu ví đã được sao lưu thành công.')} divider />
        <SettingsLink colors={colors} icon={Download} title="Khôi phục dữ liệu" description="Khôi phục từ bản sao lưu gần nhất" onPress={() => Alert.alert('Khôi phục dữ liệu', 'Đây là luồng khôi phục dữ liệu mẫu.')} divider />
      </Card>
    </ScreenScroll>
  );
}

export function DataSettingsScreen({
  colors,
  onBack,
  onClearDemo,
  onResetDemo,
}: {
  colors: AppColors;
  onBack: () => void;
  onClearDemo: () => void;
  onResetDemo: () => void;
}) {
  const confirmClear = () =>
    Alert.alert('Xóa dữ liệu demo?', 'Các danh sách sẽ chuyển sang trạng thái không có dữ liệu.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa dữ liệu demo', style: 'destructive', onPress: onClearDemo },
    ]);

  return (
    <ScreenScroll id="screen-settings-data" colors={colors}>
      <AppHeader colors={colors} title="Dữ liệu của bạn" onBack={onBack} />
      <Text style={[styles.sampleSettingsDescription, { color: colors.textSecondary }]}>Xem, tải xuống hoặc quản lý dữ liệu cá nhân được lưu trong ứng dụng.</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={FileText} title="Xem dữ liệu cá nhân" description="Kiểm tra thông tin đang được lưu" onPress={() => Alert.alert('Dữ liệu cá nhân', 'Thông tin cá nhân của bạn được mã hóa trên thiết bị.')} />
        <SettingsLink colors={colors} icon={Download} title="Tải xuống dữ liệu" description="Xuất một bản sao dữ liệu của bạn" onPress={() => Alert.alert('Đang chuẩn bị dữ liệu', 'Tệp dữ liệu mẫu sẽ sẵn sàng để tải xuống.')} divider />
        <SettingsLink colors={colors} icon={Trash2} title="Xóa dữ liệu demo" description="Kiểm tra trạng thái ứng dụng khi không có dữ liệu" onPress={confirmClear} divider danger />
        <SettingsLink colors={colors} icon={HardDrive} title="Khôi phục dữ liệu demo" description="Nạp lại bộ dữ liệu thiết kế ban đầu" onPress={onResetDemo} divider />
      </Card>
    </ScreenScroll>
  );
}

export function HelpScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  return (
    <ScreenScroll id="screen-settings-help" colors={colors}>
      <AppHeader colors={colors} title="Trung tâm trợ giúp" onBack={onBack} />
      <View style={styles.helpHero}>
        <View style={[styles.helpIcon, { backgroundColor: colors.surfaceMuted }]}>
          <BookOpen color={colors.primaryDark} size={36} />
        </View>
        <Text style={[styles.helpTitle, { color: colors.text }]}>Bạn cần hỗ trợ?</Text>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>Tìm câu trả lời về thực chứng, chia sẻ dữ liệu và bảo mật ví.</Text>
      </View>
      <Card colors={colors} style={styles.settingsList}>
        {['Cách nhận một thực chứng mới', 'Cách chia sẻ dữ liệu an toàn', 'Khôi phục quyền truy cập ví', 'Báo cáo yêu cầu dữ liệu đáng ngờ'].map((title, index) => (
          <View key={title} style={[styles.helpRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.settingsTitle, { color: colors.text, flex: 1 }]}>{title}</Text>
            <ChevronRight color={colors.textSecondary} size={20} />
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}

export function AboutScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  return (
    <ScreenScroll id="screen-settings-about" colors={colors}>
      <AppHeader colors={colors} title="Về Identra" onBack={onBack} />
      <View style={styles.helpHero}>
        <AppBrandLogo colors={colors} logoSize={86} wordmarkSize={28} vertical />
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>Ví danh tính số tự chủ, minh bạch và an toàn.</Text>
      </View>
      <Card colors={colors}>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Phiên bản</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Nền tảng</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>Expo / React Native</Text>
        </View>
        <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Hỗ trợ</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>Android và iOS</Text>
        </View>
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  activityScreenContent: { paddingTop: spacing.xxs, paddingBottom: spacing.xl, gap: spacing.md + 1 },
  activityBrandHeader: { minHeight: componentSize.buttonHeight, flexDirection: 'row', alignItems: 'center', gap: spacing.sm - 1 },
  activityHeaderButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  activityBrandLogo: { flex: 1 },
  activityTitleRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs, paddingHorizontal: spacing.xs },
  activityTitleText: { flex: 1 },
  activityScreenTitle: { fontSize: typography.size.lg + 2, fontWeight: typography.weight.extraBold, letterSpacing: -0.45 },
  activityIntro: { marginTop: spacing.xs - 1, fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs },
  activityFilterButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: border.thin,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  activityFilterButtonText: { fontSize: 10, fontWeight: typography.weight.medium },
  activityFilterCount: {
    position: 'absolute',
    right: -1,
    top: -1,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: palette.blue[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityFilterCountText: { color: palette.white, fontSize: 9, fontWeight: typography.weight.extraBold },
  activitySummary: { flexDirection: 'row', gap: spacing.sm - 1 },
  activitySummaryCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 126,
    borderWidth: border.thin,
    borderRadius: radius.lg - 1,
    paddingHorizontal: 3,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activitySummaryIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  activitySummaryLabel: { marginTop: spacing.sm + spacing.xxs, fontSize: 10, fontWeight: typography.weight.medium, textAlign: 'center' },
  activitySummaryValue: { marginTop: spacing.xs, fontSize: typography.size.lg, fontWeight: typography.weight.medium },
  activitySummaryFooter: { marginTop: spacing.xs + spacing.xxs, fontSize: 9, fontWeight: typography.weight.medium, textAlign: 'center' },
  activityGroup: { gap: spacing.sm },
  activityGroupTitle: { paddingHorizontal: spacing.xs - 1, fontSize: typography.size.sm, fontWeight: typography.weight.extraBold },
  activityList: { borderWidth: border.thin, borderRadius: radius.lg, paddingHorizontal: spacing.md, overflow: 'hidden' },
  activityRow: { minHeight: 75, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  activityRowNew: { position: 'relative', marginHorizontal: -12, paddingHorizontal: 12 },
  activityNewAccent: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  activityLeadingIcon: { width: 48, height: 48, borderRadius: radius.md + 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityRowContent: { flex: 1, minWidth: 0, gap: 2 },
  activityRowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activityTitle: { minWidth: 0, flexShrink: 1, fontSize: 13, fontWeight: typography.weight.extraBold },
  activityNewPill: { minHeight: 17, borderRadius: 9, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  activityNewPillText: { color: palette.white, fontSize: 8, lineHeight: 10, fontWeight: typography.weight.black },
  activityPartner: { fontSize: 11, fontWeight: typography.weight.medium },
  activityStatus: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  activityStatusText: { fontSize: 10, fontWeight: typography.weight.medium },
  activityTime: { minWidth: 62, alignItems: 'flex-end', gap: 3 },
  activityDate: { fontSize: 10, fontWeight: typography.weight.medium },
  activityClock: { fontSize: 10, fontWeight: typography.weight.medium },
  activityIelts: { paddingHorizontal: spacing.xs + 1, paddingVertical: spacing.sm - 1, borderRadius: radius.xs + 1, backgroundColor: palette.slate[700] },
  activityIeltsText: { color: palette.white, fontSize: 8, fontWeight: typography.weight.black },
  activityKycText: { position: 'absolute', color: palette.white, fontSize: 7, fontWeight: typography.weight.black },
  activityShieldOverlay: { position: 'absolute' },
  activityFilterOverlay: { flex: 1, justifyContent: 'flex-end' },
  activityFilterBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(11, 15, 26, 0.42)' },
  activityFilterSheet: {
    borderTopWidth: border.thin,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg + spacing.xxs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + spacing.xs,
    gap: spacing.lg + spacing.xxs,
  },
  activityFilterHeader: { flexDirection: 'row', alignItems: 'center' },
  activityFilterTitle: { flex: 1, fontSize: 19, fontWeight: typography.weight.extraBold },
  activityFilterClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  activityFilterSection: { gap: 9 },
  activityFilterSectionTitle: { fontSize: 13, fontWeight: typography.weight.extraBold },
  activityFilterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  activityFilterOption: { minHeight: 42, borderWidth: border.thin, borderRadius: radius.round, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  activityFilterOptionText: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  activityFilterActions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  activityFilterReset: { flex: 1, minHeight: componentSize.buttonHeight, borderWidth: border.thin, borderRadius: radius.md + 2, alignItems: 'center', justifyContent: 'center' },
  activityFilterResetText: { fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  activityFilterApply: { flex: 1, minHeight: componentSize.buttonHeight, borderRadius: radius.md + 2, alignItems: 'center', justifyContent: 'center' },
  activityFilterApplyText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.extraBold },
  settingsScreenContent: { paddingTop: spacing.xs + 1, paddingBottom: spacing.xl + spacing.xs, gap: spacing.md + spacing.xxs },
  settingsBrandHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingsHeaderButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  settingsBrandLogo: { flex: 1, marginLeft: 6 },
  settingsIntro: { gap: 3, marginTop: 1, marginBottom: 2 },
  settingsScreenTitle: { fontSize: typography.size.xl, lineHeight: typography.lineHeight.xl - 2, fontWeight: typography.weight.black, letterSpacing: -0.6 },
  settingsScreenSubtitle: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm },
  backupCard: { minHeight: 108, borderWidth: border.thin, borderRadius: radius.lg + 2, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md + 1 },
  backupIcon: { width: 62, height: 62, borderRadius: radius.lg - 1, alignItems: 'center', justifyContent: 'center' },
  backupTitle: { fontSize: 17, fontWeight: typography.weight.extraBold },
  backupDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  backupStatus: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs + 1, borderRadius: radius.round, backgroundColor: palette.green[100], paddingHorizontal: spacing.sm - 1, paddingVertical: spacing.xs - 1 },
  backupStatusText: { fontSize: 9.5, fontWeight: typography.weight.semibold },
  settingsSectionTitle: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.extraBold, marginTop: spacing.xxs, marginHorizontal: 1 },
  settingsList: { paddingVertical: 0, elevation: 1, shadowOpacity: 0.035, shadowRadius: 8 },
  settingsRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingsIcon: { width: 38, height: 38, borderRadius: radius.md - 1, alignItems: 'center', justifyContent: 'center' },
  settingsTitle: { fontSize: 13.5, fontWeight: typography.weight.extraBold },
  settingsDescription: { fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  themeCard: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm + spacing.xxs },
  themeOption: { flex: 1, minHeight: 90, borderWidth: border.thin, borderRadius: radius.md + 2, alignItems: 'center', justifyContent: 'center', gap: spacing.xs + spacing.xxs },
  themeLabel: { fontSize: 10, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  languageRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center' },
  sampleSettingsDescription: { fontSize: 14, lineHeight: 21, marginHorizontal: 2 },
  helpHero: { alignItems: 'center', paddingHorizontal: 26 },
  helpIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  helpTitle: { marginTop: 15, fontSize: 21, fontWeight: typography.weight.black },
  helpText: { marginTop: 7, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  helpRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 10 },
  aboutRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aboutLabel: { fontSize: 13, fontWeight: typography.weight.semibold },
  aboutValue: { fontSize: 13, fontWeight: typography.weight.extraBold },
});
