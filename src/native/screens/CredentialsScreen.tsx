import { useMemo, useState } from 'react';
import { BadgeHelp, Box, Check, CircleX, Clock3, Filter, Info, Search, ShieldCheck, X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AppColors } from '../theme';
import type { Credential, CredentialStatus } from '../types';
import {
  AppHeader,
  Card,
  CredentialIcon,
  EmptyState,
  IconButton,
  ListChevron,
  ScreenScroll,
  StatusPill,
} from '../components/ui';

type FilterKey = 'all' | CredentialStatus;

export function CredentialsScreen({
  colors,
  credentials,
  onBack,
  onOpenCredential,
  onScan,
}: {
  colors: AppColors;
  credentials: Credential[];
  onBack: () => void;
  onOpenCredential: (credential: Credential) => void;
  onScan: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [draftFilter, setDraftFilter] = useState<FilterKey>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const rows = useMemo(
    () =>
      credentials.filter((credential) => {
        const matchesFilter = filter === 'all' || credential.status === filter;
        const search = query.trim().toLocaleLowerCase('vi');
        return matchesFilter && (!search || `${credential.title} ${credential.issuer}`.toLocaleLowerCase('vi').includes(search));
      }),
    [credentials, filter, query],
  );

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: 'all', label: 'Tất cả' },
    { key: 'verified', label: 'Đã xác minh' },
    { key: 'pending', label: 'Đang chờ' },
    { key: 'expired', label: 'Đã hết hạn' },
  ];

  return (
    <ScreenScroll id="screen-credentials-library" colors={colors}>
      <AppHeader
        colors={colors}
        title="Thực chứng của tôi"
        onBack={onBack}
        right={
          <IconButton label="Trợ giúp về thực chứng" colors={colors} style={{ backgroundColor: colors.surfaceMuted }}>
            <BadgeHelp color={colors.text} size={24} />
          </IconButton>
        }
      />

      <Text style={[styles.intro, { color: colors.textSecondary }]}>
        Danh sách các Verifiable Credential (VC) bạn đã nhận và có thể sử dụng.
      </Text>

      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search color={colors.textSecondary} size={21} />
          <TextInput
            accessibilityLabel="Tìm kiếm thực chứng"
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm thực chứng"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bộ lọc thực chứng"
          onPress={() => {
            setDraftFilter(filter);
            setFilterOpen(true);
          }}
          style={({ pressed }) => [
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Filter color={colors.textSecondary} size={21} />
          <Text style={[styles.filterText, { color: colors.textSecondary }]}>Bộ lọc</Text>
        </Pressable>
      </View>

      {credentials.length ? (
        <>
          <Card colors={colors} style={styles.tabs}>
            {filters.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={({ pressed }) => [
                  styles.tab,
                  index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
                  { opacity: pressed ? 0.65 : 1 },
                ]}
              >
                <Text style={[styles.tabText, { color: filter === item.key ? colors.primaryDark : colors.textSecondary }]}>
                  {item.label}
                </Text>
                {filter === item.key ? <View style={[styles.tabActive, { backgroundColor: colors.primaryDark }]} /> : null}
              </Pressable>
            ))}
          </Card>

          <Card colors={colors} style={styles.stats}>
            <Stat colors={colors} label="Đã xác minh" value="18" color={colors.success} background="#E9F9F2" icon={ShieldCheck} />
            <Stat colors={colors} label="Đang chờ" value="3" color={colors.warning} background="#FFF3E8" icon={Clock3} divider />
            <Stat colors={colors} label="Hết hạn" value="1" color={colors.purple} background="#F5EEFF" icon={CircleX} divider />
            <Stat colors={colors} label="Tổng số" value="22" color={colors.primaryDark} background="#EEF3FF" icon={Box} divider />
          </Card>

          <Card colors={colors} style={styles.list}>
            {rows.length ? (
              rows.map((credential, index) => (
                <Pressable
                  key={credential.id}
                  accessibilityRole="button"
                  onPress={() => onOpenCredential(credential)}
                  style={({ pressed }) => [
                    styles.row,
                    index < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    { opacity: pressed ? 0.65 : 1 },
                  ]}
                >
                  <CredentialIcon
                    icon={credential.icon}
                    color={
                      credential.status === 'pending'
                        ? colors.warning
                        : credential.status === 'expired'
                          ? colors.danger
                          : colors.primaryDark
                    }
                    background={
                      credential.status === 'pending' ? '#FFF3E8' : credential.status === 'expired' ? '#FFF0F1' : '#EEF3FF'
                    }
                    boxSize={48}
                  />
                  <View style={styles.rowMain}>
                    <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.text }]}>
                      {credential.title}
                    </Text>
                    <Text numberOfLines={1} style={[styles.rowIssuer, { color: colors.textSecondary }]}>
                      {credential.issuer}
                    </Text>
                    <StatusPill status={credential.status} compact />
                  </View>
                  <View style={styles.dateBox}>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>{credential.issueDate}</Text>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>{credential.time}</Text>
                  </View>
                  <ListChevron colors={colors} />
                </Pressable>
              ))
            ) : (
              <Text style={[styles.noResult, { color: colors.textSecondary }]}>Không tìm thấy thực chứng phù hợp.</Text>
            )}
          </Card>
        </>
      ) : (
        <EmptyState
          colors={colors}
          icon={Box}
          title="Chưa có thực chứng"
          description="Các thực chứng bạn nhận được sẽ xuất hiện tại đây để sử dụng và chia sẻ an toàn."
          action="Quét để nhận thực chứng"
          onAction={onScan}
        />
      )}

      <View style={[styles.infoCard, { backgroundColor: colors.surfaceMuted }]}>
        <View style={styles.infoIcon}>
          <Info color={colors.primaryDark} size={24} />
        </View>
        <View style={styles.infoMain}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Giới thiệu về Verifiable Credential</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            VC là dữ liệu số được ký bởi tổ chức phát hành và bạn có thể chia sẻ một cách an toàn.
          </Text>
        </View>
        <ListChevron colors={colors} />
      </View>

      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <View nativeID="screen-credentials-filter" testID="screen-credentials-filter" style={styles.filterOverlay}>
          <Pressable accessibilityLabel="Đóng bộ lọc thực chứng" style={styles.filterBackdrop} onPress={() => setFilterOpen(false)} />
          <View style={[styles.filterSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.filterSheetHeader}>
              <Text style={[styles.filterSheetTitle, { color: colors.text }]}>Bộ lọc thực chứng</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Đóng bộ lọc" onPress={() => setFilterOpen(false)} style={styles.filterClose}>
                <X color={colors.textSecondary} size={22} />
              </Pressable>
            </View>
            <Text style={[styles.filterSheetLabel, { color: colors.textSecondary }]}>Trạng thái</Text>
            <View style={styles.filterOptions}>
              {filters.map((item) => {
                const active = draftFilter === item.key;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() => setDraftFilter(item.key)}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: active ? colors.surfaceMuted : colors.surface,
                        borderColor: active ? colors.primaryDark : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.filterOptionText, { color: active ? colors.primaryDark : colors.textSecondary }]}>{item.label}</Text>
                    {active ? <Check color={colors.primaryDark} size={16} strokeWidth={2.5} /> : null}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.filterActions}>
              <Pressable onPress={() => setDraftFilter('all')} style={[styles.filterReset, { borderColor: colors.primaryDark }]}>
                <Text style={[styles.filterResetText, { color: colors.primaryDark }]}>Đặt lại</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setFilter(draftFilter);
                  setFilterOpen(false);
                }}
                style={[styles.filterApply, { backgroundColor: colors.primaryDark }]}
              >
                <Text style={styles.filterApplyText}>Áp dụng</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenScroll>
  );
}

function Stat({
  colors,
  label,
  value,
  color,
  background,
  icon: Icon,
  divider,
}: {
  colors: AppColors;
  label: string;
  value: string;
  color: string;
  background: string;
  icon: typeof ShieldCheck;
  divider?: boolean;
}) {
  return (
    <View style={[styles.stat, divider && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: background }]}>
        <Icon color={color} size={18} />
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 22, paddingHorizontal: 2, marginBottom: 3 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBox: { height: 50, flex: 1, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, minWidth: 0, height: 48, fontSize: 16 },
  filterButton: { height: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  filterText: { fontSize: 13, fontWeight: '600' },
  tabs: { height: 52, padding: 0, flexDirection: 'row', overflow: 'hidden', elevation: 1, shadowOpacity: 0.035, shadowRadius: 8 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  tabActive: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  stats: { paddingHorizontal: 8, paddingVertical: 14, flexDirection: 'row', elevation: 1, shadowOpacity: 0.035, shadowRadius: 8 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  statValue: { fontSize: 21, lineHeight: 24, fontWeight: '800' },
  list: { paddingHorizontal: 14, paddingVertical: 0, overflow: 'hidden', elevation: 1, shadowOpacity: 0.035, shadowRadius: 8 },
  row: { minHeight: 93, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12 },
  rowMain: { flex: 1, minWidth: 0, gap: 3 },
  rowTitle: { fontSize: 14, fontWeight: '800' },
  rowIssuer: { fontSize: 12, fontWeight: '500' },
  dateBox: { alignItems: 'flex-end', gap: 2 },
  dateText: { fontSize: 11, fontWeight: '500' },
  noResult: { paddingVertical: 44, textAlign: 'center', fontSize: 14 },
  infoCard: { minHeight: 94, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center' },
  infoMain: { flex: 1 },
  infoTitle: { fontSize: 13, fontWeight: '800' },
  infoText: { fontSize: 11, lineHeight: 17, marginTop: 5 },
  filterOverlay: { flex: 1, justifyContent: 'flex-end' },
  filterBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(11, 15, 26, 0.42)' },
  filterSheet: { borderTopWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 28, gap: 15 },
  filterSheetHeader: { flexDirection: 'row', alignItems: 'center' },
  filterSheetTitle: { flex: 1, fontSize: 19, fontWeight: '800' },
  filterClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  filterSheetLabel: { fontSize: 13, fontWeight: '700' },
  filterOptions: { gap: 8 },
  filterOption: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterOptionText: { fontSize: 13, fontWeight: '700' },
  filterActions: { flexDirection: 'row', gap: 10, marginTop: 3 },
  filterReset: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterResetText: { fontSize: 14, fontWeight: '700' },
  filterApply: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterApplyText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
