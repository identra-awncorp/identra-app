import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Clock3, Heart, RotateCcw, Search, Sparkles, X, type LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useI18n } from '../../../../i18n';
import type { AppColors } from '../../../../theme';
import { palette, spacing } from '../../../../theme';
import type { FilterDateDirection, FilterSortMode } from '../../../../data/demo/newsFeedSearchDemoData';
import { newsFeedSearchStyles as styles } from '../newsFeedSearchStyles';

export function NewsFeedSearchFilterModal({
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
