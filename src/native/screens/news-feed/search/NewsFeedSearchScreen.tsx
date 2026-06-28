import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Heart,
  MoreVertical,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemo, useState, type ReactNode } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from '../../../components/AppLogo';
import { useI18n, type I18nKey } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../../theme';
import {
  accounts,
  groups,
  initialFilterInterests,
  interestSuggestions,
  miniApps,
  trends,
  verifiedBadgeIcon,
  type AccountSuggestion,
  type FilterDateDirection,
  type FilterSortMode,
  type GroupSuggestion,
  type MiniAppSuggestion,
  type NewsFeedSearchTab,
  type TrendSuggestion,
} from '../../../data/demo/newsFeedSearchDemoData';
import {
  addUniqueInterest,
  canAddCustomInterest,
  getFilteredInterestSuggestions,
  normalizeSearchText,
  shouldShowNewsFeedSearchFilter,
} from './newsFeedSearchLogic';

const searchTabs: Array<{ key: NewsFeedSearchTab; labelKey: I18nKey }> = [
  { key: 'all', labelKey: 'newsFeedSearch.tabs.all' },
  { key: 'trends', labelKey: 'newsFeedSearch.tabs.trends' },
  { key: 'accounts', labelKey: 'newsFeedSearch.tabs.accounts' },
  { key: 'groups', labelKey: 'newsFeedSearch.tabs.groups' },
  { key: 'miniApps', labelKey: 'newsFeedSearch.tabs.miniApps' },
];

export function NewsFeedSearchScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<NewsFeedSearchTab>('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [dateDirection, setDateDirection] = useState<FilterDateDirection>('after');
  const [sortMode, setSortMode] = useState<FilterSortMode>('relevant');
  const [interestQuery, setInterestQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState(initialFilterInterests);
  const canShowFilter = shouldShowNewsFeedSearchFilter(activeTab);
  const showTrends = activeTab === 'all' || activeTab === 'trends';
  const showAccounts = activeTab === 'all' || activeTab === 'accounts';
  const showGroups = activeTab === 'all' || activeTab === 'groups';
  const showMiniApps = activeTab === 'all' || activeTab === 'miniApps';
  const activeTabLabelKey = searchTabs.find((tab) => tab.key === activeTab)?.labelKey ?? 'newsFeedSearch.tabs.all';
  const activeTabLabel = t(activeTabLabelKey);
  const normalizedInterestQuery = normalizeSearchText(interestQuery);
  const customInterest = interestQuery.trim();
  const filteredInterestSuggestions = useMemo(
    () =>
      getFilteredInterestSuggestions({
        query: normalizedInterestQuery,
        selectedInterests,
        suggestions: interestSuggestions,
      }),
    [normalizedInterestQuery, selectedInterests],
  );
  const canAddCustomInterestValue = canAddCustomInterest({
    interest: customInterest,
    selectedInterests,
    suggestions: interestSuggestions,
  });

  const addInterest = (interest: string) => {
    const trimmedInterest = interest.trim();

    if (!trimmedInterest) {
      return;
    }

    setSelectedInterests((current) => addUniqueInterest(current, trimmedInterest));
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
          accessibilityLabel={t('newsFeedSearch.backToFeed')}
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.58 : 1 }]}
        >
          <ArrowLeft color={colors.text} size={25} strokeWidth={2.2} />
        </Pressable>

        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search color={colors.textSecondary} size={22} strokeWidth={1.9} />
          <TextInput
            accessibilityLabel={t('newsFeedSearch.searchPlaceholder')}
            placeholder={t('newsFeedSearch.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {canShowFilter ? (
          <Pressable
            accessibilityLabel={t('newsFeedSearch.openFilter', { tab: activeTabLabel })}
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
        {searchTabs.map((tab) => {
          const active = activeTab === tab.key;
          const tabLabel = t(tab.labelKey);
          return (
            <Pressable
              key={tab.key}
              accessibilityLabel={t('newsFeedSearch.switchTab', { tab: tabLabel })}
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
                {tabLabel}
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
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('trends')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.trends')}>
            {trends.map((trend) => (
              <TrendRow key={trend.title} colors={colors} trend={trend} />
            ))}
          </SuggestionSection>
        ) : null}

        {showAccounts ? (
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('accounts')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.accounts')}>
            {accounts.map((account) => (
              <AccountRow key={account.handle} account={account} colors={colors} />
            ))}
          </SuggestionSection>
        ) : null}

        {showGroups ? (
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('groups')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.groups')}>
            {groups.map((group) => (
              <GroupRow key={group.name} colors={colors} group={group} />
            ))}
          </SuggestionSection>
        ) : null}

        {showMiniApps ? (
          <SuggestionSection colors={colors} onViewAll={() => setActiveTab('miniApps')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.miniApps')}>
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
        canAddCustomInterest={canAddCustomInterestValue}
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
  const { t } = useI18n();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {showViewAll ? (
          <Pressable
            accessibilityLabel={t('newsFeedSearch.viewAllSection', { title })}
            accessibilityRole="button"
            onPress={onViewAll}
            style={({ pressed }) => [styles.viewAllButton, { opacity: pressed ? 0.62 : 1 }]}
          >
            <Text style={[styles.viewAllText, { color: colors.primaryDark }]}>{t('common.seeAll')}</Text>
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
  const { t } = useI18n();

  return (
    <View accessibilityRole="text" style={styles.endOfContent}>
      <View style={[styles.endLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.endText, { color: colors.textSecondary }]}>{t('common.endOfContent')}</Text>
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
  const { t } = useI18n();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View nativeID="news-feed-search-filter-modal" testID="news-feed-search-filter-modal" style={styles.modalLayer}>
        <Pressable accessibilityLabel={t('newsFeedSearch.filter.close')} accessibilityRole="button" onPress={onClose} style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} />

        <View style={[styles.filterSheet, { backgroundColor: colors.surface, paddingBottom: Math.max(bottomInset + spacing.md, spacing.lg) }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.filterHeader}>
            <View style={styles.filterTitleGroup}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>{t('newsFeedSearch.filter.title')}</Text>
              <Text style={[styles.filterSubtitle, { color: colors.textSecondary }]}>{t('newsFeedSearch.filter.subtitle', { tab: activeTabLabel })}</Text>
            </View>
            <Pressable
              accessibilityLabel={t('newsFeedSearch.filter.resetAccessibility')}
              accessibilityRole="button"
              onPress={onReset}
              style={({ pressed }) => [styles.resetButton, { opacity: pressed ? 0.62 : 1 }]}
            >
              <RotateCcw color={colors.primaryDark} size={18} strokeWidth={2} />
              <Text style={[styles.resetText, { color: colors.primaryDark }]}>{t('newsFeedSearch.filter.reset')}</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.filterBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <FilterSectionTitle colors={colors} icon={CalendarDays} title={t('newsFeedSearch.filter.time')} />
              <View style={styles.optionGrid}>
                <FilterOptionButton
                  active={dateDirection === 'after'}
                  colors={colors}
                  icon={CalendarDays}
                  label={t('newsFeedSearch.filter.afterDate')}
                  onPress={() => onDateDirectionChange('after')}
                />
                <FilterOptionButton
                  active={dateDirection === 'before'}
                  colors={colors}
                  icon={CalendarDays}
                  label={t('newsFeedSearch.filter.beforeDate')}
                  onPress={() => onDateDirectionChange('before')}
                />
              </View>
              <Pressable
                accessibilityLabel={t('newsFeedSearch.filter.chooseDateAccessibility')}
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
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{t('newsFeedSearch.filter.chooseDate')}</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>15/06/2026</Text>
                </View>
                <CalendarDays color={colors.primaryDark} size={22} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.filterSection}>
              <FilterSectionTitle colors={colors} icon={Heart} title={t('newsFeedSearch.filter.interests')} tint={palette.red[500]} />
              <View style={[styles.interestSearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search color={colors.textSecondary} size={21} strokeWidth={1.9} />
                <TextInput
                  accessibilityLabel={t('newsFeedSearch.filter.interestSearch')}
                  onChangeText={onInterestQueryChange}
                  onSubmitEditing={() => onAddInterest(customInterest)}
                  placeholder={t('newsFeedSearch.filter.interestSearch')}
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
                  <InterestChip colors={colors} label={t('newsFeedSearch.filter.addInterest', { interest: customInterest })} onPress={() => onAddInterest(customInterest)} />
                ) : null}
                {interestSuggestions.map((interest) => (
                  <InterestChip key={interest} colors={colors} label={interest} onPress={() => onAddInterest(interest)} />
                ))}
              </View>

              {interestSuggestions.length === 0 && !canAddCustomInterest ? (
                <Text style={[styles.filterHint, { color: colors.textSecondary }]}>{t('newsFeedSearch.filter.noInterestSuggestion')}</Text>
              ) : null}
            </View>

            <View style={styles.filterSection}>
              <FilterSectionTitle colors={colors} icon={Sparkles} title={t('newsFeedSearch.filter.sort')} />
              <View style={styles.optionGrid}>
                <FilterOptionButton
                  active={sortMode === 'relevant'}
                  colors={colors}
                  icon={Sparkles}
                  label={t('newsFeedSearch.filter.mostRelevant')}
                  onPress={() => onSortModeChange('relevant')}
                />
                <FilterOptionButton
                  active={sortMode === 'latest'}
                  colors={colors}
                  icon={Clock3}
                  label={t('newsFeedSearch.filter.latest')}
                  onPress={() => onSortModeChange('latest')}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <Pressable
              accessibilityLabel={t('newsFeedSearch.filter.cancel')}
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.footerButton,
                styles.cancelFilterButton,
                { borderColor: colors.primaryDark, opacity: pressed ? 0.66 : 1 },
              ]}
            >
              <Text style={[styles.cancelFilterText, { color: colors.primaryDark }]}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable accessibilityLabel={t('newsFeedSearch.filter.applyAccessibility')} accessibilityRole="button" onPress={onApply} style={({ pressed }) => [styles.footerButton, { opacity: pressed ? 0.84 : 1 }]}>
              <LinearGradient colors={[colors.gradientStart, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.applyFilterButton}>
                <Text style={styles.applyFilterText}>{t('newsFeedSearch.filter.apply')}</Text>
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
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityLabel={removable ? t('newsFeedSearch.filter.removeInterest', { label }) : t('newsFeedSearch.filter.chooseInterest', { label })}
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
  const { t } = useI18n();

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
      <MoreMenu colors={colors} label={t('newsFeedSearch.actions.options', { name: trend.title })} />
    </Pressable>
  );
}

function AccountRow({ account, colors }: { account: AccountSuggestion; colors: AppColors }) {
  const { t } = useI18n();

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
      <OutlineAction colors={colors} label={t('newsFeedSearch.actions.follow')} />
      <MoreMenu colors={colors} label={t('newsFeedSearch.actions.options', { name: account.name })} />
    </Pressable>
  );
}

function GroupRow({ colors, group }: { colors: AppColors; group: GroupSuggestion }) {
  const { t } = useI18n();
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
      <OutlineAction colors={colors} label={t('newsFeedSearch.actions.join')} />
      <MoreMenu colors={colors} label={t('newsFeedSearch.actions.options', { name: group.name })} />
    </Pressable>
  );
}

function MiniAppRow({ app, colors }: { app: MiniAppSuggestion; colors: AppColors }) {
  const { t } = useI18n();
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
            <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.textSecondary }]}>{t('newsFeedSearch.actions.approved')}</Text>
          </View>
        ) : null}
      </View>
      <OutlineAction colors={colors} label={t('newsFeedSearch.actions.open')} />
      <MoreMenu colors={colors} label={t('newsFeedSearch.actions.options', { name: app.name })} />
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
