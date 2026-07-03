import { Plus } from 'lucide-react-native';
import { useCallback, useMemo, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  demoSmartContractPosts,
  identraFeedImage,
  linhFeedImage,
} from '../../data/demo/newsFeedDemoData';
import { useI18n } from '../../i18n';
import { palette } from '../../theme';
import type { AppColors } from '../../theme';
import type { SmartContractFeedPost } from '../../types';
import {
  FeedPost,
  IdentraAvatar,
  InitialAvatar,
  LiveFeedPost,
  SmartContractFeedPostCard,
} from './feed/NewsFeedListItems';
import { NewsFeedHeader } from './feed/NewsFeedHeader';
import { NewsFeedTabs } from './feed/NewsFeedTabs';
import { NEWS_FEED_HEADER_HEIGHT, NEWS_FEED_OVERLAY_HEIGHT } from './feed/newsFeedLayout';
import { newsFeedStyles as styles } from './feed/newsFeedStyles';

export { NEWS_FEED_OVERLAY_HEIGHT } from './feed/newsFeedLayout';

type NewsFeedListItem =
  | { id: string; type: 'live' }
  | { id: string; type: 'identra' }
  | { id: string; type: 'smart-contract'; post: SmartContractFeedPost }
  | { id: string; type: 'linh' };

const newsFeedItems: NewsFeedListItem[] = [
  { id: 'live-duong-ton-son', type: 'live' },
  { id: 'identra-value-post', type: 'identra' },
  ...demoSmartContractPosts.map((post) => ({ id: `smart-contract-${post.id}`, type: 'smart-contract' as const, post })),
  { id: 'linh-tran-da-lat', type: 'linh' },
];

const keyExtractor = (item: NewsFeedListItem) => item.id;

export function NewsFeedScreen({
  colors,
  overlayProgress,
  onOpenLiveStream,
  onOpenMenu,
  onOpenNotifications,
  onOpenSearch,
  onOpenCompose,
  onOpenSmartContractDetail,
  scrollY,
}: {
  colors: AppColors;
  overlayProgress?: Animated.AnimatedInterpolation<number>;
  onOpenLiveStream: () => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenCompose: () => void;
  onOpenSmartContractDetail: (post: SmartContractFeedPost) => void;
  scrollY?: Animated.Value;
}) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const internalScrollY = useRef(new Animated.Value(0)).current;
  const drivenScrollY = scrollY ?? internalScrollY;
  const internalOverlayProgress = useMemo(
    () =>
      Animated.diffClamp(internalScrollY, 0, NEWS_FEED_OVERLAY_HEIGHT).interpolate({
        inputRange: [0, NEWS_FEED_OVERLAY_HEIGHT],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    [internalScrollY],
  );
  const chromeProgress = overlayProgress ?? internalOverlayProgress;
  const stickyTabsProgress = useMemo(
    () =>
      Animated.diffClamp(drivenScrollY, 0, NEWS_FEED_HEADER_HEIGHT).interpolate({
        inputRange: [0, NEWS_FEED_HEADER_HEIGHT],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    [drivenScrollY],
  );
  const handleScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: drivenScrollY } } }],
        { useNativeDriver: true },
      ),
    [drivenScrollY],
  );
  const headerTranslateY = stickyTabsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(NEWS_FEED_HEADER_HEIGHT + 30)],
    extrapolate: 'clamp',
  });
  const tabsTranslateY = stickyTabsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(NEWS_FEED_HEADER_HEIGHT + 30)],
    extrapolate: 'clamp',
  });
  const fabScale = chromeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const renderFeedItem = useCallback(({ item }: { item: NewsFeedListItem }) => {
    if (item.type === 'live') {
      return <LiveFeedPost colors={colors} onOpen={onOpenLiveStream} />;
    }

    if (item.type === 'identra') {
      return (
        <FeedPost
          avatar={<IdentraAvatar />}
          colors={colors}
          image={identraFeedImage}
          name="Identra"
          handle="@identra_app"
          time="2 giờ"
          text="Tương lai của danh tính số, tài sản số và các thỏa thuận được xây dựng trên niềm tin, quyền riêng tư và sự tự chủ của bạn."
          comments="24"
          reposts="128"
          likes="512"
          views="12,3K"
          liked
        />
      );
    }

    if (item.type === 'smart-contract') {
      return (
        <SmartContractFeedPostCard
          colors={colors}
          post={item.post}
          onOpenDetail={onOpenSmartContractDetail}
        />
      );
    }

    return (
      <FeedPost
        avatar={<InitialAvatar colors={colors} initials="LT" />}
        colors={colors}
        image={linhFeedImage}
        imageBadge="1/4"
        name="Linh Trần"
        handle="@linhtran"
        time="4 giờ"
        text="Một buổi sáng yên bình ở Đà Lạt. Không khí mát lạnh, tâm trí nhẹ nhàng."
        comments="12"
        reposts="36"
        likes="258"
        views="6,1K"
      />
    );
  }, [colors, onOpenLiveStream, onOpenSmartContractDetail]);

  return (
    <View nativeID="screen-news-feed" testID="screen-news-feed" style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.headerOverlay,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <NewsFeedHeader
          colors={colors}
          onOpenMenu={onOpenMenu}
          onOpenNotifications={onOpenNotifications}
          onOpenSearch={onOpenSearch}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.tabsOverlay,
          {
            backgroundColor: colors.background,
            top: insets.top + NEWS_FEED_HEADER_HEIGHT,
            transform: [{ translateY: tabsTranslateY }],
          },
        ]}
      >
        <NewsFeedTabs colors={colors} />
      </Animated.View>

      <Animated.FlatList
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + NEWS_FEED_OVERLAY_HEIGHT,
            paddingBottom: 108 + insets.bottom,
          },
        ]}
        data={newsFeedItems}
        initialNumToRender={3}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        maxToRenderPerBatch={3}
        onScroll={handleScroll}
        removeClippedSubviews
        renderItem={renderFeedItem}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        updateCellsBatchingPeriod={50}
        windowSize={5}
      />

      <Animated.View style={[styles.fab, { bottom: 92 + insets.bottom, transform: [{ scale: fabScale }] }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('newsFeed.createPost')}
          onPress={onOpenCompose}
          style={({ pressed }) => [styles.fabButton, { backgroundColor: colors.primaryDark, opacity: pressed ? 0.78 : 1 }]}
        >
          <Plus color={palette.white} size={38} strokeWidth={1.9} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
