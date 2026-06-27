import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bot,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Clock3,
  Code2,
  Heart,
  Landmark,
  MoreVertical,
  Music2,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemo, useState, type ReactNode } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from '../components/AppLogo';
import type { AppColors } from '../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../theme';

const verifiedBadgeIcon = require('../../assets/images/verified-badge-icon.png');
const beeIcon = require('../../assets/images/mini-app-logo/bee-icon.png');
const publicServiceIcon = require('../../assets/images/mini-app-logo/quoc-huy-vn-icon.png');
const accountAvatarA = require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-02 (2).jpg');
const accountAvatarB = require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03 (2).jpg');
const accountAvatarC = require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03 (3).jpg');
const accountAvatarD = require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03 (4).jpg');

type TrendSuggestion = {
  title: string;
  category: string;
  count: string;
  verified?: boolean;
  bars: number[];
};

type AccountSuggestion = {
  name: string;
  handle: string;
  bio: string;
  verified?: boolean;
  avatarSource?: ImageSourcePropType;
  avatarKind?: 'identra';
};

type GroupSuggestion = {
  name: string;
  description: string;
  members: string;
  colors: [string, string];
  icon: LucideIcon;
};

type MiniAppSuggestion = {
  name: string;
  category: string;
  description: string;
  approved?: boolean;
  imageSource?: ImageSourcePropType;
  colors?: [string, string];
  icon?: LucideIcon;
};

type NewsFeedSearchTab = 'all' | 'trends' | 'accounts' | 'groups' | 'miniApps';
type FilterDateDirection = 'after' | 'before';
type FilterSortMode = 'relevant' | 'latest';

const tabs: Array<{ key: NewsFeedSearchTab; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'trends', label: 'Xu hướng' },
  { key: 'accounts', label: 'Tài khoản' },
  { key: 'groups', label: 'Nhóm' },
  { key: 'miniApps', label: 'Mini App' },
];

const interestSuggestions = [
  'Công nghệ',
  'Blockchain',
  'AI',
  'Âm nhạc',
  'Web3',
  'SSI',
  'Bảo mật',
  'Thanh toán',
  'Sự kiện',
  'Thể thao',
  'Mini App',
  'DeFi',
  'Smart Contract',
  'Dữ liệu cá nhân',
];

const initialFilterInterests = ['Công nghệ', 'Blockchain', 'AI', 'Âm nhạc'];

const trends: TrendSuggestion[] = [
  { title: '#GENfest2025', category: 'Sự kiện · Âm nhạc', count: '128.6K bài viết', verified: true, bars: [22, 30, 27, 38, 34, 29, 36, 46, 42, 58] },
  { title: 'Tuyển Việt Nam', category: 'Thể thao', count: '85.3K bài viết', bars: [18, 16, 23, 34, 30, 24, 38, 26, 31, 48] },
  { title: 'AI Agents', category: 'Công nghệ', count: '71.2K bài viết', bars: [12, 16, 15, 14, 17, 22, 19, 18, 24, 56] },
  { title: 'Identra Pay', category: 'Tài chính số', count: '64.8K bài viết', verified: true, bars: [16, 18, 26, 22, 30, 27, 36, 41, 44, 52] },
  { title: 'Ví danh tính số', category: 'SSI · Web3', count: '52.4K bài viết', bars: [14, 20, 18, 27, 25, 29, 33, 31, 42, 47] },
  { title: 'Blockchain Việt Nam', category: 'Cộng đồng', count: '49.1K bài viết', bars: [10, 14, 18, 16, 24, 30, 29, 34, 39, 45] },
  { title: 'Mini App', category: 'Sản phẩm số', count: '38.9K bài viết', bars: [12, 19, 23, 22, 28, 27, 31, 35, 37, 44] },
  { title: 'Bảo mật dữ liệu', category: 'An toàn số', count: '33.7K bài viết', bars: [9, 13, 15, 21, 18, 24, 29, 32, 34, 42] },
  { title: 'Smart Contract', category: 'Web3', count: '29.5K bài viết', bars: [11, 12, 18, 20, 22, 26, 23, 30, 36, 40] },
  { title: 'IDPass', category: 'Danh tính', count: '24.2K bài viết', bars: [8, 12, 16, 19, 18, 21, 28, 27, 33, 38] },
];

const accounts: AccountSuggestion[] = [
  { name: 'Identra', handle: '@identra_app', bio: 'Super App cho cộng đồng Web3 Việt Nam.', verified: true, avatarKind: 'identra' },
  { name: 'Minh Anh', handle: '@minhanh.eth', bio: 'Kỹ sư Blockchain tại SSI. Yêu thích smart contracts & DeFi.', avatarSource: accountAvatarA },
  { name: 'Linh Trần', handle: '@linhtran', bio: 'Chia sẻ về công nghệ, danh tính số và cộng đồng sáng tạo.', verified: true, avatarSource: accountAvatarB },
  { name: 'Dương Tôn Sơn', handle: '@duongtonson', bio: 'Builder, creator, thích các sản phẩm tôn trọng quyền riêng tư.', avatarSource: accountAvatarC },
  { name: 'CyberJutsu Academy', handle: '@cyberjutsu', bio: 'Đào tạo an toàn thông tin, AI security và bảo mật ứng dụng.', verified: true, avatarSource: accountAvatarD },
];

const groups: GroupSuggestion[] = [
  { name: 'AI Việt Nam', description: 'Chia sẻ kiến thức và ứng dụng AI trong thực tế.', members: '12.5K thành viên', colors: ['#692BFF', '#8B5CF6'], icon: Bot },
  { name: 'Lập Trình Việt Nam', description: 'Cộng đồng lập trình viên Việt Nam.', members: '28.3K thành viên', colors: ['#0077FF', '#00B2FF'], icon: Code2 },
  { name: 'Web3 Builders', description: 'Xây sản phẩm phi tập trung, ví và smart contract.', members: '9.8K thành viên', colors: ['#355CFF', '#6D5DFB'], icon: Sparkles },
  { name: 'An toàn dữ liệu cá nhân', description: 'Thảo luận về bảo mật, quyền riêng tư và dữ liệu cá nhân.', members: '7.4K thành viên', colors: ['#12B76A', '#2DD4BF'], icon: ShieldCheck },
  { name: 'Nhà sáng tạo Identra', description: 'Không gian kết nối creator, mini app và cộng đồng.', members: '6.1K thành viên', colors: ['#F57900', '#FB923C'], icon: Users },
];

const miniApps: MiniAppSuggestion[] = [
  { name: 'Bee', category: 'Di chuyển', description: 'Đặt xe nhanh chóng, giao hàng tiện lợi mọi lúc.', approved: true, imageSource: beeIcon },
  { name: 'Dịch vụ công', category: 'Tiện ích công', description: 'Xử lý dịch vụ công trực tuyến, theo dõi hồ sơ dễ dàng.', approved: true, imageSource: publicServiceIcon },
  { name: 'IDPay', category: 'Thanh toán', description: 'Thanh toán an toàn bằng danh tính số và ví Identra.', approved: true, colors: ['#355CFF', '#60A5FA'], icon: Briefcase },
  { name: 'EventPass', category: 'Sự kiện', description: 'Quản lý vé, check-in và chuyển nhượng qua hợp đồng.', colors: ['#9747FF', '#B986FF'], icon: Music2 },
  { name: 'Gov Connect', category: 'Định danh', description: 'Kết nối hồ sơ công dân, tổ chức và dịch vụ tin cậy.', approved: true, colors: ['#12B76A', '#22C55E'], icon: Landmark },
];

export function NewsFeedSearchScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NewsFeedSearchTab>('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [dateDirection, setDateDirection] = useState<FilterDateDirection>('after');
  const [sortMode, setSortMode] = useState<FilterSortMode>('relevant');
  const [interestQuery, setInterestQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState(initialFilterInterests);
  const canShowFilter = activeTab !== 'all';
  const showTrends = activeTab === 'all' || activeTab === 'trends';
  const showAccounts = activeTab === 'all' || activeTab === 'accounts';
  const showGroups = activeTab === 'all' || activeTab === 'groups';
  const showMiniApps = activeTab === 'all' || activeTab === 'miniApps';
  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? '';
  const normalizedInterestQuery = interestQuery.trim().toLocaleLowerCase('vi-VN');
  const customInterest = interestQuery.trim();
  const filteredInterestSuggestions = useMemo(
    () =>
      interestSuggestions
        .filter((interest) => !selectedInterests.some((selected) => selected.toLocaleLowerCase('vi-VN') === interest.toLocaleLowerCase('vi-VN')))
        .filter((interest) => !normalizedInterestQuery || interest.toLocaleLowerCase('vi-VN').includes(normalizedInterestQuery))
        .slice(0, 8),
    [normalizedInterestQuery, selectedInterests],
  );
  const canAddCustomInterest =
    customInterest.length > 1 &&
    !selectedInterests.some((interest) => interest.toLocaleLowerCase('vi-VN') === customInterest.toLocaleLowerCase('vi-VN')) &&
    !interestSuggestions.some((interest) => interest.toLocaleLowerCase('vi-VN') === customInterest.toLocaleLowerCase('vi-VN'));

  const addInterest = (interest: string) => {
    const trimmedInterest = interest.trim();

    if (!trimmedInterest) {
      return;
    }

    setSelectedInterests((current) => {
      if (current.some((item) => item.toLocaleLowerCase('vi-VN') === trimmedInterest.toLocaleLowerCase('vi-VN'))) {
        return current;
      }

      return [...current, trimmedInterest];
    });
    setInterestQuery('');
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests((current) => current.filter((item) => item !== interest));
  };

  const resetFilters = () => {
    setDateDirection('after');
    setSortMode('relevant');
    setInterestQuery('');
    setSelectedInterests([]);
  };

  return (
    <View nativeID="screen-news-feed-search" testID="screen-news-feed-search" style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.searchHeader}>
        <Pressable
          accessibilityLabel="Quay lại bảng tin"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.58 : 1 }]}
        >
          <ArrowLeft color={colors.text} size={25} strokeWidth={2.2} />
        </Pressable>

        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search color={colors.textSecondary} size={22} strokeWidth={1.9} />
          <TextInput
            accessibilityLabel="Tìm kiếm trên Identra"
            placeholder="Tìm kiếm trên Identra"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {canShowFilter ? (
          <Pressable
            accessibilityLabel={`Mở bộ lọc ${activeTabLabel}`}
            accessibilityRole="button"
            onPress={() => setFilterVisible(true)}
            style={({ pressed }) => [
              styles.filterButton,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.66 : 1 },
            ]}
          >
            <SlidersHorizontal color={colors.textSecondary} size={24} strokeWidth={1.9} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityLabel={`Chuyển sang tab ${tab.label}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setActiveTab(tab.key);
                if (tab.key === 'all') {
                  setFilterVisible(false);
                }
              }}
              style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.62 : 1 }]}
            >
              <Text numberOfLines={1} style={[styles.tabText, { color: active ? colors.primaryDark : colors.textSecondary }, active && styles.activeTabText]}>
                {tab.label}
              </Text>
              {active ? <View style={[styles.tabIndicator, { backgroundColor: colors.primaryDark }]} /> : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.xxxl) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showTrends ? (
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('trends')} showViewAll={activeTab === 'all'} title="Xu hướng nổi bật">
            {trends.map((trend) => (
              <TrendRow key={trend.title} colors={colors} trend={trend} />
            ))}
          </SuggestionSection>
        ) : null}

        {showAccounts ? (
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('accounts')} showViewAll={activeTab === 'all'} title="Tài khoản">
            {accounts.map((account) => (
              <AccountRow key={account.handle} account={account} colors={colors} />
            ))}
          </SuggestionSection>
        ) : null}

        {showGroups ? (
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('groups')} showViewAll={activeTab === 'all'} title="Nhóm">
            {groups.map((group) => (
              <GroupRow key={group.name} colors={colors} group={group} />
            ))}
          </SuggestionSection>
        ) : null}

        {showMiniApps ? (
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('miniApps')} showViewAll={activeTab === 'all'} title="Mini app">
            {miniApps.map((app) => (
              <MiniAppRow key={app.name} app={app} colors={colors} />
            ))}
          </SuggestionSection>
        ) : null}

        {activeTab !== 'all' ? <EndOfContent colors={colors} /> : null}
      </ScrollView>

      <NewsFeedSearchFilterModal
        activeTabLabel={activeTabLabel}
        bottomInset={insets.bottom}
        canAddCustomInterest={canAddCustomInterest}
        colors={colors}
        customInterest={customInterest}
        dateDirection={dateDirection}
        interestQuery={interestQuery}
        interestSuggestions={filteredInterestSuggestions}
        onAddInterest={addInterest}
        onApply={() => setFilterVisible(false)}
        onClose={() => setFilterVisible(false)}
        onDateDirectionChange={setDateDirection}
        onInterestQueryChange={setInterestQuery}
        onRemoveInterest={removeInterest}
        onReset={resetFilters}
        onSortModeChange={setSortMode}
        selectedInterests={selectedInterests}
        sortMode={sortMode}
        visible={filterVisible && canShowFilter}
      />
    </View>
  );
}

function SuggestionSection({
  children,
  colors,
  onViewAll,
  showViewAll,
  title,
}: {
  children: ReactNode;
  colors: AppColors;
  onViewAll: () => void;
  showViewAll: boolean;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {showViewAll ? (
          <Pressable
            accessibilityLabel={`Xem tất cả ${title}`}
            accessibilityRole="button"
            onPress={onViewAll}
            style={({ pressed }) => [styles.viewAllButton, { opacity: pressed ? 0.62 : 1 }]}
          >
            <Text style={[styles.viewAllText, { color: colors.primaryDark }]}>Xem tất cả</Text>
            <ChevronRight color={colors.primaryDark} size={18} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.sectionList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {children}
      </View>
    </View>
  );
}

function EndOfContent({ colors }: { colors: AppColors }) {
  return (
    <View accessibilityRole="text" style={styles.endOfContent}>
      <View style={[styles.endLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.endText, { color: colors.textSecondary }]}>Đã hết nội dung</Text>
      <View style={[styles.endLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function NewsFeedSearchFilterModal({
  activeTabLabel,
  bottomInset,
  canAddCustomInterest,
  colors,
  customInterest,
  dateDirection,
  interestQuery,
  interestSuggestions,
  onAddInterest,
  onApply,
  onClose,
  onDateDirectionChange,
  onInterestQueryChange,
  onRemoveInterest,
  onReset,
  onSortModeChange,
  selectedInterests,
  sortMode,
  visible,
}: {
  activeTabLabel: string;
  bottomInset: number;
  canAddCustomInterest: boolean;
  colors: AppColors;
  customInterest: string;
  dateDirection: FilterDateDirection;
  interestQuery: string;
  interestSuggestions: string[];
  onAddInterest: (interest: string) => void;
  onApply: () => void;
  onClose: () => void;
  onDateDirectionChange: (direction: FilterDateDirection) => void;
  onInterestQueryChange: (query: string) => void;
  onRemoveInterest: (interest: string) => void;
  onReset: () => void;
  onSortModeChange: (mode: FilterSortMode) => void;
  selectedInterests: string[];
  sortMode: FilterSortMode;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View nativeID="news-feed-search-filter-modal" testID="news-feed-search-filter-modal" style={styles.modalLayer}>
        <Pressable accessibilityLabel="Đóng bộ lọc" accessibilityRole="button" onPress={onClose} style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} />

        <View style={[styles.filterSheet, { backgroundColor: colors.surface, paddingBottom: Math.max(bottomInset + spacing.md, spacing.lg) }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.filterHeader}>
            <View style={styles.filterTitleGroup}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Bộ lọc</Text>
              <Text style={[styles.filterSubtitle, { color: colors.textSecondary }]}>Đang lọc trong {activeTabLabel}</Text>
            </View>
            <Pressable
              accessibilityLabel="Đặt lại bộ lọc"
              accessibilityRole="button"
              onPress={onReset}
              style={({ pressed }) => [styles.resetButton, { opacity: pressed ? 0.62 : 1 }]}
            >
              <RotateCcw color={colors.primaryDark} size={18} strokeWidth={2} />
              <Text style={[styles.resetText, { color: colors.primaryDark }]}>Đặt lại</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.filterBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <FilterSectionTitle colors={colors} icon={CalendarDays} title="Thời gian" />
              <View style={styles.optionGrid}>
                <FilterOptionButton
                  active={dateDirection === 'after'}
                  colors={colors}
                  icon={CalendarDays}
                  label="Sau ngày cụ thể"
                  onPress={() => onDateDirectionChange('after')}
                />
                <FilterOptionButton
                  active={dateDirection === 'before'}
                  colors={colors}
                  icon={CalendarDays}
                  label="Trước ngày cụ thể"
                  onPress={() => onDateDirectionChange('before')}
                />
              </View>
              <Pressable
                accessibilityLabel="Chọn ngày lọc"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.dateField,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.dateCopy}>
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Chọn ngày</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>15/06/2026</Text>
                </View>
                <CalendarDays color={colors.primaryDark} size={22} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.filterSection}>
              <FilterSectionTitle colors={colors} icon={Heart} title="Mối quan tâm" tint={palette.red[500]} />
              <View style={[styles.interestSearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search color={colors.textSecondary} size={21} strokeWidth={1.9} />
                <TextInput
                  accessibilityLabel="Tìm chủ đề quan tâm"
                  onChangeText={onInterestQueryChange}
                  onSubmitEditing={() => onAddInterest(customInterest)}
                  placeholder="Tìm chủ đề quan tâm"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="done"
                  style={[styles.interestInput, { color: colors.text }]}
                  value={interestQuery}
                />
              </View>

              {selectedInterests.length > 0 ? (
                <View style={styles.chipWrap}>
                  {selectedInterests.map((interest) => (
                    <InterestChip key={interest} colors={colors} label={interest} onPress={() => onRemoveInterest(interest)} removable />
                  ))}
                </View>
              ) : null}

              <View style={styles.chipWrap}>
                {canAddCustomInterest ? (
                  <InterestChip colors={colors} label={`Thêm "${customInterest}"`} onPress={() => onAddInterest(customInterest)} />
                ) : null}
                {interestSuggestions.map((interest) => (
                  <InterestChip key={interest} colors={colors} label={interest} onPress={() => onAddInterest(interest)} />
                ))}
              </View>

              {interestSuggestions.length === 0 && !canAddCustomInterest ? (
                <Text style={[styles.filterHint, { color: colors.textSecondary }]}>Không có gợi ý phù hợp.</Text>
              ) : null}
            </View>

            <View style={styles.filterSection}>
              <FilterSectionTitle colors={colors} icon={Sparkles} title="Sắp xếp" />
              <View style={styles.optionGrid}>
                <FilterOptionButton
                  active={sortMode === 'relevant'}
                  colors={colors}
                  icon={Sparkles}
                  label="Phù hợp nhất"
                  onPress={() => onSortModeChange('relevant')}
                />
                <FilterOptionButton
                  active={sortMode === 'latest'}
                  colors={colors}
                  icon={Clock3}
                  label="Mới nhất"
                  onPress={() => onSortModeChange('latest')}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <Pressable
              accessibilityLabel="Hủy bộ lọc"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.footerButton,
                styles.cancelFilterButton,
                { borderColor: colors.primaryDark, opacity: pressed ? 0.66 : 1 },
              ]}
            >
              <Text style={[styles.cancelFilterText, { color: colors.primaryDark }]}>Hủy</Text>
            </Pressable>
            <Pressable accessibilityLabel="Áp dụng bộ lọc" accessibilityRole="button" onPress={onApply} style={({ pressed }) => [styles.footerButton, { opacity: pressed ? 0.84 : 1 }]}>
              <LinearGradient colors={[colors.gradientStart, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.applyFilterButton}>
                <Text style={styles.applyFilterText}>Áp dụng</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterSectionTitle({
  colors,
  icon: Icon,
  tint,
  title,
}: {
  colors: AppColors;
  icon: LucideIcon;
  tint?: string;
  title: string;
}) {
  const iconColor = tint ?? colors.primaryDark;

  return (
    <View style={styles.filterSectionTitleRow}>
      <Icon color={iconColor} size={24} strokeWidth={2} />
      <Text style={[styles.filterSectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function FilterOptionButton({
  active,
  colors,
  icon: Icon,
  label,
  onPress,
}: {
  active: boolean;
  colors: AppColors;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionButton,
        {
          backgroundColor: active ? colors.surfaceMuted : colors.surface,
          borderColor: active ? colors.primaryDark : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Icon color={active ? colors.primaryDark : colors.textSecondary} size={20} strokeWidth={1.9} />
      <Text numberOfLines={1} style={[styles.optionButtonText, { color: active ? colors.primaryDark : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function InterestChip({
  colors,
  label,
  onPress,
  removable,
}: {
  colors: AppColors;
  label: string;
  onPress: () => void;
  removable?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={removable ? `Bỏ mối quan tâm ${label}` : `Chọn mối quan tâm ${label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.interestChip,
        {
          backgroundColor: removable ? colors.surfaceMuted : colors.surface,
          borderColor: removable ? colors.primaryDark : colors.border,
          opacity: pressed ? 0.66 : 1,
        },
      ]}
    >
      <Text numberOfLines={1} style={[styles.interestChipText, { color: removable ? colors.primaryDark : colors.textSecondary }]}>
        {label}
      </Text>
      {removable ? <X color={colors.primaryDark} size={16} strokeWidth={2.2} /> : null}
    </Pressable>
  );
}

function TrendRow({ colors, trend }: { colors: AppColors; trend: TrendSuggestion }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={trend.title} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
      <View style={styles.trendCopy}>
        <View style={styles.inlineTitle}>
          <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>{trend.title}</Text>
          {trend.verified ? <Image source={verifiedBadgeIcon} style={styles.verifiedBadge} resizeMode="contain" /> : null}
        </View>
        <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textSecondary }]}>{trend.category}</Text>
        <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textSecondary }]}>{trend.count}</Text>
      </View>
      <Sparkline bars={trend.bars} color={colors.primaryDark} />
      <MoreMenu colors={colors} label={`Tuỳ chọn ${trend.title}`} />
    </Pressable>
  );
}

function AccountRow({ account, colors }: { account: AccountSuggestion; colors: AppColors }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={account.name} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
      <AccountAvatar account={account} colors={colors} />
      <View style={styles.suggestionCopy}>
        <View style={styles.inlineTitle}>
          <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>{account.name}</Text>
          {account.verified ? <Image source={verifiedBadgeIcon} style={styles.verifiedBadge} resizeMode="contain" /> : null}
        </View>
        <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textSecondary }]}>{account.handle}</Text>
        <Text numberOfLines={2} style={[styles.itemDescription, { color: colors.textSecondary }]}>{account.bio}</Text>
      </View>
      <OutlineAction colors={colors} label="Theo dõi" />
      <MoreMenu colors={colors} label={`Tuỳ chọn ${account.name}`} />
    </Pressable>
  );
}

function GroupRow({ colors, group }: { colors: AppColors; group: GroupSuggestion }) {
  const Icon = group.icon;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={group.name} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
      <LinearGradient colors={group.colors} style={styles.squareAvatar}>
        <Icon color={palette.white} size={27} strokeWidth={2.1} />
      </LinearGradient>
      <View style={styles.suggestionCopy}>
        <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>{group.name}</Text>
        <Text numberOfLines={2} style={[styles.itemDescription, { color: colors.textSecondary }]}>{group.description}</Text>
        <View style={styles.metaRow}>
          <Users color={colors.textSecondary} size={14} strokeWidth={2} />
          <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textSecondary }]}>{group.members}</Text>
        </View>
      </View>
      <OutlineAction colors={colors} label="Tham gia" />
      <MoreMenu colors={colors} label={`Tuỳ chọn ${group.name}`} />
    </Pressable>
  );
}

function MiniAppRow({ app, colors }: { app: MiniAppSuggestion; colors: AppColors }) {
  const Icon = app.icon;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={app.name} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
      {app.imageSource ? (
        <Image source={app.imageSource} style={styles.squareAvatar} resizeMode="cover" />
      ) : (
        <LinearGradient colors={app.colors ?? [colors.primaryDark, colors.gradientEnd]} style={styles.squareAvatar}>
          {Icon ? <Icon color={palette.white} size={27} strokeWidth={2.1} /> : null}
        </LinearGradient>
      )}
      <View style={styles.suggestionCopy}>
        <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>{app.name}</Text>
        <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textSecondary }]}>{app.category}</Text>
        <Text numberOfLines={2} style={[styles.itemDescription, { color: colors.textSecondary }]}>{app.description}</Text>
        {app.approved ? (
          <View style={styles.metaRow}>
            <Image source={verifiedBadgeIcon} style={styles.approvedBadge} resizeMode="contain" />
            <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textSecondary }]}>Đã kiểm duyệt</Text>
          </View>
        ) : null}
      </View>
      <OutlineAction colors={colors} label="Mở" />
      <MoreMenu colors={colors} label={`Tuỳ chọn ${app.name}`} />
    </Pressable>
  );
}

function AccountAvatar({ account, colors }: { account: AccountSuggestion; colors: AppColors }) {
  if (account.avatarKind === 'identra') {
    return (
      <LinearGradient colors={[colors.primaryDark, colors.purple]} style={styles.accountAvatar}>
        <AppLogo size={30} />
      </LinearGradient>
    );
  }

  if (account.avatarSource) {
    return <Image source={account.avatarSource} style={styles.accountAvatar} resizeMode="cover" />;
  }

  return (
    <LinearGradient colors={[colors.primaryDark, colors.gradientEnd]} style={styles.accountAvatar}>
      <Text style={styles.fallbackAvatarText}>{account.name.slice(0, 1)}</Text>
    </LinearGradient>
  );
}

function OutlineAction({ colors, label }: { colors: AppColors; label: string }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.outlineButton,
        {
          borderColor: colors.primaryDark,
          opacity: pressed ? 0.62 : 1,
        },
      ]}
    >
      <Text style={[styles.outlineButtonText, { color: colors.primaryDark }]}>{label}</Text>
    </Pressable>
  );
}

function MoreMenu({ colors, label }: { colors: AppColors; label: string }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" style={styles.moreButton}>
      <MoreVertical color={colors.textSecondary} size={20} strokeWidth={2.2} />
    </Pressable>
  );
}

function Sparkline({ bars, color }: { bars: number[]; color: string }) {
  return (
    <View style={styles.sparkline} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={[
            styles.sparkBar,
            {
              height,
              backgroundColor: color,
              opacity: 0.24 + index * 0.055,
            },
          ]}
        />
      ))}
      <View style={[styles.sparkDot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchHeader: {
    minHeight: 72,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    height: 50,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.medium,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    minHeight: 52,
    borderBottomWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
    position: 'relative',
  },
  tabText: { fontSize: typography.size.xs + 1, fontWeight: typography.weight.black },
  activeTabText: { fontWeight: typography.weight.black },
  tabIndicator: { position: 'absolute', bottom: 0, width: '72%', height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionHeader: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { fontSize: typography.size.md + 1, lineHeight: 23, fontWeight: typography.weight.black },
  viewAllButton: { minHeight: touchTarget.minimum, flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  viewAllText: { fontSize: typography.size.xs + 1, fontWeight: typography.weight.black },
  endOfContent: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  endLine: { flex: 1, height: border.hairline },
  endText: { fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.semibold },
  modalLayer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  filterSheet: {
    maxHeight: '86%',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: radius.round,
    marginBottom: spacing.md,
    opacity: 0.86,
  },
  filterHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  filterTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  filterTitle: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.black,
  },
  filterSubtitle: {
    marginTop: spacing.xxs,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  resetButton: {
    minHeight: touchTarget.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  resetText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.black,
  },
  filterBody: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  filterSection: {
    gap: spacing.md,
  },
  filterSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterSectionTitle: {
    fontSize: typography.size.md + 1,
    lineHeight: 24,
    fontWeight: typography.weight.black,
  },
  optionGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  optionButtonText: {
    minWidth: 0,
    flexShrink: 1,
    fontSize: typography.size.xs + 1,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.black,
    textAlign: 'center',
  },
  dateField: {
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dateCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  dateLabel: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  dateValue: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semibold,
  },
  interestSearchBox: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  interestInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.medium,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestChip: {
    minHeight: touchTarget.minimum,
    maxWidth: '100%',
    borderRadius: radius.md,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  interestChipText: {
    minWidth: 0,
    flexShrink: 1,
    fontSize: typography.size.xs + 1,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.black,
  },
  filterHint: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  filterFooter: {
    paddingTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  cancelFilterButton: {
    borderWidth: border.thin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelFilterText: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.black,
  },
  applyFilterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterText: {
    color: palette.white,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.black,
  },
  sectionList: {
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  row: {
    minHeight: 82,
    borderBottomWidth: border.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trendCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  suggestionCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  inlineTitle: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  itemTitle: { minWidth: 0, flexShrink: 1, fontSize: typography.size.sm + 1, lineHeight: 20, fontWeight: typography.weight.black },
  itemMeta: { fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.medium },
  itemDescription: { fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.medium },
  verifiedBadge: { width: 17, height: 17, flexShrink: 0 },
  approvedBadge: { width: 14, height: 14, flexShrink: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  accountAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray[100],
  },
  fallbackAvatarText: { color: palette.white, fontSize: typography.size.lg, fontWeight: typography.weight.black },
  squareAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray[100],
  },
  outlineButton: {
    minWidth: 72,
    minHeight: 36,
    borderRadius: radius.sm,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: { fontSize: typography.size.xs + 1, fontWeight: typography.weight.black },
  moreButton: {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  sparkline: {
    width: 92,
    height: 52,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 2,
    paddingRight: spacing.xs,
  },
  sparkBar: { width: 5, borderRadius: 3 },
  sparkDot: { position: 'absolute', right: 0, top: 5, width: 9, height: 9, borderRadius: 5 },
});
