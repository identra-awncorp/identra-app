import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, MoreVertical, Users } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { AppLogo } from '../../../../components/AppLogo';
import { useI18n } from '../../../../i18n';
import type { AppColors } from '../../../../theme';
import { palette, spacing } from '../../../../theme';
import {
  accounts,
  groups,
  miniApps,
  trends,
  verifiedBadgeIcon,
  type AccountSuggestion,
  type GroupSuggestion,
  type MiniAppSuggestion,
  type NewsFeedSearchTab,
  type TrendSuggestion,
} from '../../../../data/demo/newsFeedSearchDemoData';
import { newsFeedSearchStyles as styles } from '../newsFeedSearchStyles';

export function NewsFeedSearchResults({
  activeTab,
  bottomInset,
  colors,
  onChangeTab,
}: {
  activeTab: NewsFeedSearchTab;
  bottomInset: number;
  colors: AppColors;
  onChangeTab: (tab: NewsFeedSearchTab) => void;
}) {
  const { t } = useI18n();
  const showTrends = activeTab === 'all' || activeTab === 'trends';
  const showAccounts = activeTab === 'all' || activeTab === 'accounts';
  const showGroups = activeTab === 'all' || activeTab === 'groups';
  const showMiniApps = activeTab === 'all' || activeTab === 'miniApps';

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(bottomInset + spacing.xxl, spacing.xxxl) }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {showTrends ? (
        <SuggestionSection colors={colors} onViewAll={() => onChangeTab('trends')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.trends')}>
          {trends.map((trend) => (
            <TrendRow key={trend.title} colors={colors} trend={trend} />
          ))}
        </SuggestionSection>
      ) : null}

      {showAccounts ? (
        <SuggestionSection colors={colors} onViewAll={() => onChangeTab('accounts')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.accounts')}>
          {accounts.map((account) => (
            <AccountRow key={account.handle} account={account} colors={colors} />
          ))}
        </SuggestionSection>
      ) : null}

      {showGroups ? (
        <SuggestionSection colors={colors} onViewAll={() => onChangeTab('groups')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.groups')}>
          {groups.map((group) => (
            <GroupRow key={group.name} colors={colors} group={group} />
          ))}
        </SuggestionSection>
      ) : null}

      {showMiniApps ? (
        <SuggestionSection colors={colors} onViewAll={() => onChangeTab('miniApps')} showViewAll={activeTab === 'all'} title={t('newsFeedSearch.sections.miniApps')}>
          {miniApps.map((app) => (
            <MiniAppRow key={app.name} app={app} colors={colors} />
          ))}
        </SuggestionSection>
      ) : null}

      {activeTab !== 'all' ? <EndOfContent colors={colors} /> : null}
    </ScrollView>
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
