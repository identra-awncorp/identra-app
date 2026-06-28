import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { initialFilterInterests, interestSuggestions, type FilterDateDirection, type FilterSortMode, type NewsFeedSearchTab } from '../../../data/demo/newsFeedSearchDemoData';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { NewsFeedSearchFilterModal } from './components/NewsFeedSearchFilterModal';
import { NewsFeedSearchHeader } from './components/NewsFeedSearchHeader';
import { NewsFeedSearchResults } from './components/NewsFeedSearchResults';
import { NewsFeedSearchTabs } from './components/NewsFeedSearchTabs';
import {
  addUniqueInterest,
  canAddCustomInterest,
  getFilteredInterestSuggestions,
  normalizeSearchText,
  shouldShowNewsFeedSearchFilter,
} from './newsFeedSearchLogic';
import { newsFeedSearchStyles as styles } from './newsFeedSearchStyles';
import { newsFeedSearchTabs } from './newsFeedSearchTabs';

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
  const activeTabLabelKey = newsFeedSearchTabs.find((tab) => tab.key === activeTab)?.labelKey ?? 'newsFeedSearch.tabs.all';
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

  const changeTab = (tab: NewsFeedSearchTab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      setFilterVisible(false);
    }
  };

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
      <NewsFeedSearchHeader
        activeTabLabel={activeTabLabel}
        canShowFilter={canShowFilter}
        colors={colors}
        onBack={onBack}
        onOpenFilter={() => setFilterVisible(true)}
      />

      <NewsFeedSearchTabs activeTab={activeTab} colors={colors} onChangeTab={changeTab} />

      <NewsFeedSearchResults activeTab={activeTab} bottomInset={insets.bottom} colors={colors} onChangeTab={changeTab} />

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
