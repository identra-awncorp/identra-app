import { memo, useCallback, useMemo } from 'react';
import { Bell, ChevronDown, ChevronRight, MoreVertical, Search } from 'lucide-react-native';
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ScreenScroll } from '../../components/AppUiPrimitives';
import { MainTopHeader } from '../../components/MainTopHeader';
import {
  featuredMiniAppCollections,
  frequentMiniApps,
  miniAppHeroBanner,
  popularMiniAppCategories,
  recommendedMiniApps,
  type MiniAppCollection,
  type MiniAppTile,
  type MiniAppTone,
  type RecommendedMiniApp,
} from '../../data/demo/miniAppDemoData';
import { useI18n } from '../../i18n';
import { border, layout, palette, radius, shadows, spacing, typography } from '../../theme';
import type { AppColors } from '../../theme';
import { paymentHomeStyles } from '../payment/components/paymentHomeStyles';

const miniAppBannerAspectRatio = 1635 / 962;
const miniAppTileHeight = 88;
const miniAppTileIconSize = 42;

export function MiniAppScreen({
  colors,
  onOpenMenu,
  onOpenNotifications,
  onOpenSearch,
}: {
  colors: AppColors;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
}) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const screenWidth = Math.max(layout.minWidth, width);
  const contentWidth = screenWidth - layout.screenPadding * 2;
  const miniAppTileWidth = Math.max(80, (contentWidth - spacing.sm * 3) / 4);
  const frequentItemWidth = miniAppTileWidth;
  const frequentColumnCount = Math.ceil(frequentMiniApps.length / 2);
  const frequentTrackWidth = frequentItemWidth * frequentColumnCount + spacing.sm * Math.max(0, frequentColumnCount - 1);
  const categoryItemWidth = miniAppTileWidth;
  const heroHeight = Math.round(contentWidth / miniAppBannerAspectRatio);
  const collectionWidth = (contentWidth - spacing.md) / 2;
  const collectionHeight = Math.round(collectionWidth / miniAppBannerAspectRatio);

  const headerActions = useMemo(
    () => [
      {
        key: 'search',
        label: t('miniApp.header.search'),
        icon: Search,
        onPress: onOpenSearch,
      },
      {
        key: 'notifications',
        label: t('miniApp.header.notifications'),
        icon: Bell,
        onPress: onOpenNotifications,
        badge: '3',
      },
    ],
    [onOpenNotifications, onOpenSearch, t],
  );
  const showComingSoon = useCallback(
    (label: string) => {
      Alert.alert(label, t('miniApp.comingSoon'));
    },
    [t],
  );

  return (
    <View nativeID="screen-mini-app" testID="screen-mini-app" style={[paymentHomeStyles.screen, { backgroundColor: colors.background }]}>
      <MainTopHeader
        actions={headerActions}
        colors={colors}
        menuLabel={t('miniApp.openMenu')}
        onOpenMenu={onOpenMenu}
      />

      <ScreenScroll
        id="screen-mini-app-content"
        colors={colors}
        contentStyle={[
          paymentHomeStyles.screenContent,
          styles.screenContent,
        ]}
        includeTopInset={false}
      >
        <MiniAppSectionHeader
          action={t('common.seeAll')}
          colors={colors}
          title={t('miniApp.sections.frequent')}
          onAction={() => showComingSoon(t('miniApp.sections.frequent'))}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.frequentScroller}>
          <View style={[styles.frequentGrid, { width: frequentTrackWidth }]}>
            {frequentMiniApps.map((item) => (
              <MiniAppTileCard
                key={item.id}
                colors={colors}
                item={item}
                width={frequentItemWidth}
                onPress={() => showComingSoon(t(item.titleKey))}
              />
            ))}
          </View>
        </ScrollView>

        <MiniAppHeroBanner
          colors={colors}
          height={heroHeight}
          onPress={() => showComingSoon(t('miniApp.hero.action'))}
        />

        <MiniAppSectionHeader
          action={t('common.seeAll')}
          colors={colors}
          title={t('miniApp.sections.categories')}
          onAction={() => showComingSoon(t('miniApp.sections.categories'))}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroller}>
          {popularMiniAppCategories.map((item) => (
            <MiniAppCategoryCard
              key={item.id}
              colors={colors}
              item={item}
              width={categoryItemWidth}
              onPress={() => showComingSoon(t(item.titleKey))}
            />
          ))}
        </ScrollView>

        <MiniAppSectionHeader colors={colors} title={t('miniApp.sections.recommended')} />
        <View style={[styles.recommendationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {recommendedMiniApps.map((item, index) => (
            <RecommendedMiniAppRow
              key={item.id}
              colors={colors}
              item={item}
              last={index === recommendedMiniApps.length - 1}
            />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('miniApp.recommended.more')}
            onPress={() => showComingSoon(t('miniApp.recommended.more'))}
            style={({ pressed }) => [styles.moreButton, { opacity: pressed ? 0.65 : 1 }]}
          >
            <Text style={[styles.moreButtonText, { color: colors.primaryDark }]}>{t('miniApp.recommended.more')}</Text>
            <ChevronDown color={colors.primaryDark} size={18} strokeWidth={2.2} />
          </Pressable>
        </View>

        <MiniAppSectionHeader
          action={t('common.seeAll')}
          colors={colors}
          title={t('miniApp.sections.collections')}
          onAction={() => showComingSoon(t('miniApp.sections.collections'))}
        />
        <View style={styles.collectionRow}>
          {featuredMiniAppCollections.map((item) => (
            <MiniAppCollectionCard
              key={item.id}
              colors={colors}
              height={collectionHeight}
              item={item}
              width={collectionWidth}
              onPress={() => showComingSoon(t(item.titleKey))}
            />
          ))}
        </View>
      </ScreenScroll>
    </View>
  );
}

const MiniAppSectionHeader = memo(function MiniAppSectionHeader({
  action,
  colors,
  onAction,
  title,
}: {
  action?: string;
  colors: AppColors;
  onAction?: () => void;
  title: string;
}) {
  return (
    <View style={paymentHomeStyles.sectionHeader}>
      <Text numberOfLines={1} style={[paymentHomeStyles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
      {action ? (
        <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction} hitSlop={8} style={styles.sectionActionButton}>
          <Text numberOfLines={1} style={[paymentHomeStyles.sectionAction, { color: colors.primaryDark }]}>
            {action}
          </Text>
          <ChevronRight color={colors.primaryDark} size={18} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </View>
  );
});

const MiniAppTileCard = memo(function MiniAppTileCard({
  colors,
  item,
  onPress,
  width,
}: {
  colors: AppColors;
  item: MiniAppTile;
  onPress: () => void;
  width: number;
}) {
  const { t } = useI18n();
  const title = t(item.titleKey);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.frequentCard,
        { width, backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Image source={item.icon} style={styles.frequentIcon} resizeMode="contain" />
      <Text numberOfLines={2} style={[styles.frequentLabel, { color: colors.text }]}>
        {title}
      </Text>
    </Pressable>
  );
});

const MiniAppCategoryCard = memo(function MiniAppCategoryCard({
  colors,
  item,
  onPress,
  width,
}: {
  colors: AppColors;
  item: MiniAppTile;
  onPress: () => void;
  width: number;
}) {
  const { t } = useI18n();
  const title = t(item.titleKey);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryCard,
        { width, backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Image source={item.icon} style={styles.categoryIcon} resizeMode="contain" />
      <Text numberOfLines={1} style={[styles.categoryLabel, { color: colors.text }]}>
        {title}
      </Text>
    </Pressable>
  );
});

const MiniAppHeroBanner = memo(function MiniAppHeroBanner({
  colors,
  height,
  onPress,
}: {
  colors: AppColors;
  height: number;
  onPress: () => void;
}) {
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('miniApp.hero.action')}
      onPress={onPress}
      style={({ pressed }) => [styles.heroFrame, shadows.card, { opacity: pressed ? 0.92 : 1 }]}
    >
      <ImageBackground
        source={miniAppHeroBanner}
        resizeMode="cover"
        imageStyle={styles.heroImage}
        style={[styles.heroBanner, { height }]}
      >
        <View style={styles.heroCopy}>
          <Text numberOfLines={3} style={styles.heroTitle}>
            {t('miniApp.hero.title')}
          </Text>
          <Text numberOfLines={2} style={styles.heroDescription}>
            {t('miniApp.hero.description')}
          </Text>
          <View style={styles.heroButton}>
            <Text numberOfLines={1} style={[styles.heroButtonText, { color: colors.primaryDark }]}>
              {t('miniApp.hero.action')}
            </Text>
            <ChevronRight color={colors.primaryDark} size={20} strokeWidth={2.3} />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
});

const toneStyles: Record<MiniAppTone, { background: string; color: string }> = {
  finance: { background: '#EEF3FF', color: palette.blue[700] },
  utility: { background: palette.green[100], color: palette.green[600] },
  payment: { background: palette.purple[100], color: palette.purple[500] },
  transport: { background: palette.orange[100], color: palette.orange[500] },
};

const RecommendedMiniAppRow = memo(function RecommendedMiniAppRow({
  colors,
  item,
  last,
}: {
  colors: AppColors;
  item: RecommendedMiniApp;
  last: boolean;
}) {
  const { t } = useI18n();
  const tone = toneStyles[item.tone];
  const title = t(item.titleKey);

  return (
    <View style={[styles.recommendationRow, !last && { borderBottomColor: colors.border, borderBottomWidth: border.hairline }]}>
      <Image source={item.icon} style={styles.recommendationIcon} resizeMode="contain" />
      <View style={styles.recommendationCopy}>
        <View style={styles.recommendationTitleRow}>
          <Text numberOfLines={1} style={[styles.recommendationTitle, { color: colors.text }]}>
            {title}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: tone.background }]}>
            <Text numberOfLines={1} style={[styles.categoryBadgeText, { color: tone.color }]}>
              {t(item.categoryKey)}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={[styles.recommendationDescription, { color: colors.textSecondary }]}>
          {t(item.descriptionKey)}
        </Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('miniApp.moreOptions')} hitSlop={8} style={styles.moreIconButton}>
        <MoreVertical color={colors.text} size={22} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
});

const MiniAppCollectionCard = memo(function MiniAppCollectionCard({
  colors,
  height,
  item,
  onPress,
  width,
}: {
  colors: AppColors;
  height: number;
  item: MiniAppCollection;
  onPress: () => void;
  width: number;
}) {
  const { t } = useI18n();
  const titleColor = item.tone === 'transport' ? '#8D3F12' : colors.primaryDark;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(item.titleKey)}
      onPress={onPress}
      style={({ pressed }) => [styles.collectionCard, { width, height, opacity: pressed ? 0.78 : 1 }]}
    >
      <ImageBackground
        source={item.image}
        resizeMode="cover"
        imageStyle={styles.collectionImage}
        style={styles.collectionImageBackground}
      >
        <View style={styles.collectionCopy}>
          <Text numberOfLines={1} style={[styles.collectionTitle, { color: titleColor }]}>
            {t(item.titleKey)}
          </Text>
          <Text numberOfLines={2} style={[styles.collectionDescription, { color: item.tone === 'transport' ? '#9B4D1F' : colors.text }]}>
            {t(item.descriptionKey)}
          </Text>
          <View style={styles.collectionAction}>
            <Text style={[styles.collectionActionText, { color: colors.primaryDark }]}>{t(item.actionKey)}</Text>
            <ChevronRight color={colors.primaryDark} size={16} strokeWidth={2.2} />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.sm + spacing.xs,
  },
  sectionActionButton: {
    flexShrink: 0,
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  frequentScroller: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  frequentGrid: {
    height: miniAppTileHeight * 2 + spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequentCard: {
    height: miniAppTileHeight,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    ...shadows.subtle,
  },
  frequentIcon: {
    width: miniAppTileIconSize,
    height: miniAppTileIconSize,
  },
  frequentLabel: {
    minHeight: 31,
    fontSize: typography.size.xs,
    lineHeight: 15,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  heroFrame: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.blue[700],
  },
  heroBanner: {
    width: '100%',
    justifyContent: 'center',
  },
  heroImage: {
    borderRadius: radius.xl,
  },
  heroCopy: {
    maxWidth: '51%',
    paddingLeft: spacing.md + spacing.xs,
    gap: spacing.xs + 1,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0,
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: typography.size.xs,
    lineHeight: 18,
    fontWeight: typography.weight.medium,
  },
  heroButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    minWidth: 124,
    borderRadius: radius.md + 2,
    backgroundColor: palette.white,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  heroButtonText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.extraBold,
  },
  categoryScroller: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  categoryCard: {
    height: miniAppTileHeight,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    ...shadows.subtle,
  },
  categoryIcon: {
    width: miniAppTileIconSize,
    height: miniAppTileIconSize,
  },
  categoryLabel: {
    fontSize: typography.size.xs,
    lineHeight: 15,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  recommendationCard: {
    borderRadius: radius.xl,
    borderWidth: border.hairline,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    ...shadows.subtle,
  },
  recommendationRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recommendationIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
  },
  recommendationCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  recommendationTitleRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recommendationTitle: {
    flexShrink: 1,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.extraBold,
  },
  categoryBadge: {
    flexShrink: 0,
    minHeight: 21,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: typography.weight.semibold,
  },
  recommendationDescription: {
    fontSize: typography.size.xs + 1,
    lineHeight: 19,
    fontWeight: typography.weight.medium,
  },
  moreIconButton: {
    width: 26,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  moreButtonText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.extraBold,
  },
  collectionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  collectionCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.blue[100],
  },
  collectionImageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  collectionImage: {
    borderRadius: radius.lg,
  },
  collectionCopy: {
    width: '58%',
    paddingLeft: spacing.sm + spacing.xs,
    gap: spacing.xxs,
  },
  collectionTitle: {
    fontSize: typography.size.md,
    lineHeight: 21,
    fontWeight: typography.weight.extraBold,
  },
  collectionDescription: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: typography.weight.medium,
  },
  collectionAction: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  collectionActionText: {
    fontSize: typography.size.xs,
    lineHeight: 15,
    fontWeight: typography.weight.extraBold,
  },
});
