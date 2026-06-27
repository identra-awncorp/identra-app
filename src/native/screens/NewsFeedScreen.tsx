import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Code2,
  Eye,
  Heart,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  Search,
  Send,
  Share,
  ShieldCheck,
  Smile,
  ThumbsUp,
  Ticket,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemo, useRef, type ReactNode } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { AppBrandLogo, AppLogo } from '../components/AppLogo';
import type { AppColors } from '../theme';
import { border, palette, radius, shadows, spacing, touchTarget, typography } from '../theme';
import type { SmartContractFeedPost } from '../types';

const identraFeedImage = require('../../assets/images/news-feed-demo/identra-feed-demo.png');
const dalatFeedImage = require('../../assets/images/news-feed-demo/8d353b31-b11d-443f-b55c-5760f92e2068.png');
const linhFeedImage = require('../../assets/images/news-feed-demo/photo_2026-06-26_11-13-00 (6).jpg');
const liveStreamImage = dalatFeedImage;
const liveHostAvatar = require('../../assets/images/student_avatar_png_1781051105999.png');
const liveViewerAvatar = require('../../assets/images/chat-list-demo-icon/photo_2026-06-21_11-00-03 (4).jpg');
const verifiedBadgeIcon = require('../../assets/images/verified-badge-icon.png');

export const NEWS_FEED_HEADER_HEIGHT = 74;
const NEWS_FEED_TABS_HEIGHT = 62;
export const NEWS_FEED_OVERLAY_HEIGHT = NEWS_FEED_HEADER_HEIGHT + NEWS_FEED_TABS_HEIGHT;

const demoSmartContractPosts: SmartContractFeedPost[] = [
  {
    id: 'genfest-official-ticket-sale',
    authorName: 'GENfest Official',
    handle: '@genfest_official',
    time: '30 phút',
    text: 'GENfest 2025 mở bán vé VIP A qua hợp đồng thông minh.\nSố lượng giới hạn, giao dịch an toàn qua Identra Pay.',
    authorKind: 'organization',
    contract: {
      id: 'genfest-official-available',
      title: 'Bán vé concert GENfest 2025',
      status: 'Còn 1 vé',
      availability: 'available',
      assetTitle: 'Vé concert GENfest 2025',
      assetSubtitle: 'Hạng: VIP A · 08/06/2025',
      assetCode: 'Mã vé: GEN2025-VPA-0832',
      assetStateLabel: 'Còn 1 vé',
      remainingLabel: '1 vật phẩm còn lại',
      remainingCount: 1,
      amount: '₫ 1.500.000 VNĐ',
      paymentLabel: 'Thanh toán qua Identra Pay',
      deadline: '23:59 · 18/05/2025',
      condition: 'Chỉ chuyển quyền sở hữu sau khi thanh toán được xác nhận',
      security: 'Mọi giao dịch được lưu vết minh bạch trên blockchain',
      eventDate: '08/06/2025',
      location: 'TP.HCM',
      owner: 'GENfest Official',
      issuer: 'GENfest Official',
      itemType: 'Thực chứng vé sự kiện',
      transferability: 'Theo hợp đồng',
      verificationMethod: 'Ký số + blockchain',
      transactionStatus: 'Sẵn sàng giao dịch',
    },
    stats: {
      comments: '32',
      reposts: '86',
      likes: '420',
      views: '9,8K',
    },
  },
  {
    id: 'minh-khoa-ticket-resale',
    authorName: 'Minh Khoa',
    handle: '@minhkhoa.eth',
    time: '1 giờ',
    text: 'Tôi vừa tạo một hợp đồng trao đổi vé an toàn.\nCùng kiểm tra chi tiết bên dưới nhé.',
    authorKind: 'person',
    contract: {
      id: 'minh-khoa-sold-out',
      title: 'Bán lại vé concert GENfest 2025',
      status: 'Đã hết vật phẩm',
      availability: 'soldOut',
      assetTitle: 'Vé concert GENfest 2025',
      assetSubtitle: 'Hạng: VIP A · 08/06/2025',
      assetCode: 'Mã vé: GEN2025-VPA-0832',
      assetStateLabel: 'Đã hết',
      remainingLabel: '0 vật phẩm còn lại',
      remainingCount: 0,
      limitMessage: 'Hợp đồng đã đạt giới hạn số lượng vật phẩm giao dịch.',
      amount: '₫ 1.500.000 VNĐ',
      paymentLabel: 'Thanh toán qua Identra Pay',
      deadline: '23:59 · 18/05/2025',
      condition: 'Chỉ chuyển quyền sở hữu sau khi thanh toán được xác nhận',
      security: 'Mọi giao dịch được lưu vết minh bạch trên blockchain',
      eventDate: '08/06/2025',
      location: 'TP.HCM',
      owner: 'Minh Khoa',
      issuer: 'GENfest Official',
      itemType: 'Thực chứng vé sự kiện',
      transferability: 'Theo hợp đồng',
      verificationMethod: 'Ký số + blockchain',
      transactionStatus: 'Hết lượt giao dịch',
    },
    stats: {
      comments: '18',
      reposts: '42',
      likes: '203',
      views: '5,2K',
    },
  },
];

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
    outputRange: [0, - (NEWS_FEED_HEADER_HEIGHT + 30)],
    extrapolate: 'clamp',
  });
  const tabsTranslateY = stickyTabsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, - (NEWS_FEED_HEADER_HEIGHT + 30)],
    extrapolate: 'clamp',
  });
  const fabScale = chromeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

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
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở menu"
          onPress={onOpenMenu}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.62 : 1 }]}
        >
          <Menu color={colors.text} size={29} strokeWidth={1.9} />
        </Pressable>
        <AppBrandLogo colors={colors} logoSize={30} wordmarkSize={20} style={styles.brand} />
        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Tìm kiếm trên bảng tin"
          onPress={onOpenSearch}
          style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Search color={colors.textSecondary} size={22} strokeWidth={1.9} />
          <Text numberOfLines={1} style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Tìm kiếm</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở thông báo"
          onPress={onOpenNotifications}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.62 : 1 }]}
        >
          <Heart color={colors.textSecondary} size={29} strokeWidth={1.9} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </Pressable>
      </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.tabsOverlay,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: tabsTranslateY }],
          },
        ]}
      >
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <Pressable accessibilityRole="tab" accessibilityState={{ selected: true }} style={styles.tab}>
          <Text style={[styles.activeTabText, { color: colors.text }]}>Dành cho bạn</Text>
          <View style={[styles.activeIndicator, { backgroundColor: colors.primaryDark }]} />
        </Pressable>
        <Pressable accessibilityRole="tab" accessibilityState={{ selected: false }} style={styles.tab}>
          <Text style={[styles.tabText, { color: colors.textSecondary }]}>Đang theo dõi</Text>
        </Pressable>
      </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <LiveFeedPost colors={colors} onOpen={onOpenLiveStream} />
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
        {demoSmartContractPosts.map((post) => (
          <SmartContractFeedPostCard
            key={post.id}
            colors={colors}
            post={post}
            onOpenDetail={() => onOpenSmartContractDetail(post)}
          />
        ))}
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
      </Animated.ScrollView>

      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tạo bài viết mới"
        onPress={onOpenCompose}
        style={({ pressed }) => [styles.fabButton, { backgroundColor: colors.primaryDark, opacity: pressed ? 0.78 : 1 }]}
      >
        <Plus color={palette.white} size={38} strokeWidth={1.9} />
      </Pressable>
      </Animated.View>
    </View>
  );
}

function LiveFeedPost({ colors, onOpen }: { colors: AppColors; onOpen: () => void }) {
  return (
    <View style={[styles.livePost, { borderBottomColor: colors.border }]}>
      <View style={styles.avatarColumn}>
        <View style={styles.livePostAvatarWrap}>
          <Image source={liveHostAvatar} style={styles.livePostAvatar} resizeMode="cover" />
        </View>
      </View>
      <View style={styles.postBody}>
        <View style={styles.livePostMetaRow}>
          <Text numberOfLines={1} style={[styles.livePostName, { color: colors.text }]}>Dương Tôn Sơn</Text>
          <Image source={verifiedBadgeIcon} style={styles.verifiedBadge} resizeMode="contain" />
          <Text numberOfLines={1} style={[styles.livePostHandle, { color: colors.textSecondary }]}>@duongtonson</Text>
          <Text numberOfLines={1} style={[styles.livePostTime, { color: colors.textSecondary }]}>· 2 phút</Text>
          <MoreHorizontal color={colors.textSecondary} size={22} strokeWidth={2} style={styles.livePostMore} />
        </View>
        <View style={styles.liveStateRow}>
          <View style={styles.liveMetaPill}>
            <Text style={styles.liveMetaPillText}>Đang phát trực tiếp</Text>
          </View>
        </View>

        <Text style={[styles.livePostText, { color: colors.text }]}>
          Chia sẻ nhanh buổi chiều ở Đà Lạt
          {'\n'}
          Ai đang xem thì chào mình nhé
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xem phát trực tiếp của Dương Tôn Sơn"
          onPress={onOpen}
          style={({ pressed }) => [styles.livePreviewFrame, { opacity: pressed ? 0.88 : 1 }]}
        >
          <ImageBackground source={liveStreamImage} style={styles.livePreviewImage} imageStyle={styles.livePreviewImageRadius} resizeMode="cover">
            <LinearGradient colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.58)']} style={styles.livePreviewOverlay}>
              <View style={styles.livePreviewTop}>
                <LiveBadge />
                <View style={styles.liveViewerCount}>
                  <Eye color={palette.white} size={15} strokeWidth={2.2} />
                  <Text style={styles.liveViewerCountText}>128</Text>
                </View>
              </View>

              <View style={styles.livePreviewBody}>
                <View style={styles.liveCommentStack}>
                  <LiveComment name="Minh Anh" text="Đẹp quá Sơn ơi!" />
                  <LiveComment name="Khánh" text="Thời tiết hôm nay tuyệt quá!" />
                  <LiveComment name="Tuấn" text="Chào Sơn nhé" />
                </View>

                <View style={styles.liveReactionRail}>
                  <LiveReactionAvatar source={liveViewerAvatar} icon="heart" />
                  <LiveReactionAvatar source={liveHostAvatar} icon="like" />
                  <View style={styles.liveReactionMore}>
                    <Text style={styles.liveReactionMoreText}>+24</Text>
                  </View>
                </View>
              </View>

              <View style={styles.liveComposerRow}>
                <View style={styles.liveComposerInput}>
                  <Text numberOfLines={1} style={styles.liveComposerPlaceholder}>Viết bình luận...</Text>
                  <Smile color={palette.white} size={18} strokeWidth={2} />
                </View>
                <View style={styles.liveComposerIconButton}>
                  <Send color={palette.white} size={18} strokeWidth={2} />
                </View>
                <View style={styles.liveHeartButton}>
                  <Heart color={palette.white} fill={palette.white} size={20} strokeWidth={1.8} />
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Pressable>

        <View style={styles.actions}>
          <FeedAction colors={colors} icon={MessageCircle} label="24" />
          <FeedAction colors={colors} icon={Repeat2} label="36" />
          <FeedAction colors={colors} active icon={Heart} label="258" />
          <FeedAction colors={colors} icon={BarChart3} label="6,1K" />
          <FeedAction colors={colors} icon={Share} />
        </View>
      </View>
    </View>
  );
}

function LiveBadge() {
  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveBadgeDot} />
      <Text style={styles.liveBadgeText}>TRỰC TIẾP</Text>
    </View>
  );
}

function LiveComment({ name, text }: { name: string; text: string }) {
  return (
    <View style={styles.liveCommentBubble}>
      <Image source={liveHostAvatar} style={styles.liveCommentAvatar} resizeMode="cover" />
      <View style={styles.liveCommentCopy}>
        <Text numberOfLines={1} style={styles.liveCommentName}>{name}</Text>
        <Text numberOfLines={1} style={styles.liveCommentText}>{text}</Text>
      </View>
    </View>
  );
}

function LiveReactionAvatar({ icon, source }: { icon: 'heart' | 'like'; source: ImageSourcePropType }) {
  const Icon = icon === 'heart' ? Heart : ThumbsUp;
  return (
    <View style={styles.liveReactionAvatarWrap}>
      <Image source={source} style={styles.liveReactionAvatar} resizeMode="cover" />
      <View style={[styles.liveReactionIcon, { backgroundColor: icon === 'heart' ? '#F02850' : '#FFB545' }]}>
        <Icon color={palette.white} fill={icon === 'heart' ? palette.white : 'none'} size={12} strokeWidth={2.2} />
      </View>
    </View>
  );
}

function FeedPost({
  avatar,
  colors,
  comments,
  handle,
  image,
  imageBadge,
  liked = false,
  likes,
  name,
  reposts,
  text,
  time,
  views,
}: {
  avatar: ReactNode;
  colors: AppColors;
  comments: string;
  handle: string;
  image: number;
  imageBadge?: string;
  liked?: boolean;
  likes: string;
  name: string;
  reposts: string;
  text: string;
  time: string;
  views: string;
}) {
  return (
    <View style={[styles.post, { borderBottomColor: colors.border }]}>
      <View style={styles.avatarColumn}>{avatar}</View>
      <View style={styles.postBody}>
        <View style={styles.postMetaRow}>
          <Text numberOfLines={1} style={[styles.authorName, { color: colors.text }]}>{name}</Text>
          <Image source={verifiedBadgeIcon} style={styles.verifiedBadge} resizeMode="contain" />
          <Text numberOfLines={1} style={[styles.authorMeta, { color: colors.textSecondary }]}>{handle} · {time}</Text>
          <MoreHorizontal color={colors.textSecondary} size={22} strokeWidth={2} style={styles.moreIcon} />
        </View>
        <Text style={[styles.postText, { color: colors.text }]}>{text}</Text>
        <View style={styles.imageWrap}>
          <Image source={image} style={styles.postImage} resizeMode="cover" />
          {imageBadge ? (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{imageBadge}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          <FeedAction colors={colors} icon={MessageCircle} label={comments} />
          <FeedAction colors={colors} icon={Repeat2} label={reposts} />
          <FeedAction colors={colors} active={liked} icon={Heart} label={likes} />
          <FeedAction colors={colors} icon={BarChart3} label={views} />
          <FeedAction colors={colors} icon={Share} />
        </View>
      </View>
    </View>
  );
}

function SmartContractFeedPostCard({
  colors,
  onOpenDetail,
  post,
}: {
  colors: AppColors;
  onOpenDetail: () => void;
  post?: SmartContractFeedPost | null;
}) {
  if (!post) return null;

  const { contract, stats } = post;
  const isSoldOut = contract.availability === 'soldOut';
  const isAvailable = contract.availability === 'available';
  const statusColor = isSoldOut ? colors.textSecondary : colors.success;
  const statusBackground = isSoldOut ? colors.surfaceMuted : palette.green[100];

  return (
    <View style={[styles.post, { borderBottomColor: colors.border }]}>
      <View style={styles.avatarColumn}>
        {post.authorKind === 'organization' ? <GenfestAvatar /> : <InitialAvatar colors={colors} initials="MK" />}
      </View>
      <View style={styles.postBody}>
        <View style={styles.postMetaRow}>
          <Text numberOfLines={1} style={[styles.authorName, { color: colors.text }]}>{post.authorName}</Text>
          <Image source={verifiedBadgeIcon} style={styles.verifiedBadge} resizeMode="contain" />
          <Text numberOfLines={1} style={[styles.authorMeta, { color: colors.textSecondary }]}>{post.handle} · {post.time}</Text>
          <MoreHorizontal color={colors.textSecondary} size={22} strokeWidth={2} style={styles.moreIcon} />
        </View>

        <Text style={[styles.postText, { color: colors.text }]}>{post.text}</Text>

        <View style={[styles.smartContractCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.smartContractHeader}>
            <Text style={[styles.smartContractTitle, { color: colors.text }]}>{contract.title}</Text>
            <View style={[styles.smartStatusPill, { backgroundColor: statusBackground }]}>
              <Clock3 color={statusColor} size={13} strokeWidth={2.1} />
              <Text numberOfLines={1} style={[styles.smartStatusText, { color: statusColor }]}>{contract.status}</Text>
            </View>
          </View>

          <View style={styles.smartTradeRow}>
            <View style={[styles.smartTradePanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.smartTradeLabel, { color: colors.text }]}>Vật phẩm giao dịch</Text>
              <View style={styles.smartTicketRow}>
                <LinearGradient colors={['#1B1E75', '#4727D9']} style={styles.smartTicketArt}>
                  <Ticket color={palette.white} size={15} strokeWidth={2.1} />
                  <Text style={styles.smartTicketBrand}>GENFEST</Text>
                  <Text style={styles.smartTicketYear}>2025</Text>
                </LinearGradient>
                <View style={styles.smartTicketCopy}>
                  <View style={styles.smartTicketTitleRow}>
                    <Text numberOfLines={1} style={[styles.smartTicketTitle, { color: colors.text }]}>{contract.assetTitle}</Text>
                    <Image source={verifiedBadgeIcon} style={styles.smartTinyBadge} resizeMode="contain" />
                  </View>
                  <Text numberOfLines={1} style={[styles.smartTicketMeta, { color: colors.textSecondary }]}>{contract.assetSubtitle}</Text>
                  <Text numberOfLines={1} style={[styles.smartTicketMeta, { color: colors.textSecondary }]}>{contract.assetCode}</Text>
                  {isSoldOut || isAvailable ? (
                    <View style={styles.smartSoldOutMetaRow}>
                      <View style={[styles.smartAssetStatePill, { backgroundColor: colors.surfaceMuted }]}>
                        <Text style={[styles.smartAssetStateText, { color: isAvailable ? colors.success : colors.textSecondary }]}>{contract.assetStateLabel}</Text>
                      </View>
                      <Text numberOfLines={1} style={[styles.smartRemainingText, { color: colors.textSecondary }]}>{contract.remainingLabel}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={[styles.smartTradePanel, styles.smartPaymentPanel, { borderColor: colors.border }]}>
              <Text style={[styles.smartTradeLabel, { color: colors.text }]}>Vật phẩm đối ứng</Text>
              <View style={styles.smartPaymentBox}>
                <Text numberOfLines={1} style={styles.smartAmount}>{contract.amount}</Text>
                <Text numberOfLines={1} style={styles.smartPaymentText}>{contract.paymentLabel}</Text>
              </View>
            </View>
          </View>

          {isSoldOut ? (
            <View style={[styles.smartLimitNotice, { backgroundColor: colors.surfaceMuted }]}>
              <Clock3 color={colors.textSecondary} size={14} strokeWidth={2} />
              <Text style={[styles.smartLimitNoticeText, { color: colors.textSecondary }]}>{contract.limitMessage}</Text>
            </View>
          ) : null}

          <View style={[styles.smartInfoList, { borderColor: colors.border }]}>
            <SmartContractInfoRow colors={colors} icon={CalendarDays} label="Hạn chót phản hồi" value={contract.deadline} />
            <SmartContractInfoRow colors={colors} icon={Code2} label="Điều kiện thực thi" value={contract.condition} />
            <SmartContractInfoRow colors={colors} icon={ShieldCheck} label="An toàn & minh bạch" value={contract.security} last />
          </View>

          <View style={styles.smartContractActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xem chi tiết hợp đồng thông minh"
              onPress={onOpenDetail}
              style={({ pressed }) => [styles.smartRejectButton, { borderColor: colors.primaryDark, opacity: pressed ? 0.72 : 1 }]}
            >
              <Text style={[styles.smartRejectText, { color: colors.primaryDark }]}>Xem chi tiết</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Giao dịch hợp đồng thông minh"
              disabled={isSoldOut}
              accessibilityState={{ disabled: isSoldOut }}
              style={({ pressed }) => [
                styles.smartPrimaryButton,
                isSoldOut
                  ? { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderWidth: border.thin }
                  : { backgroundColor: colors.primaryDark },
                { opacity: pressed && !isSoldOut ? 0.78 : 1 },
              ]}
            >
              <Text style={[styles.smartPrimaryText, isSoldOut && { color: colors.textSecondary }]}>
                {isSoldOut ? 'Đã hết vật phẩm' : 'Giao dịch'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <FeedAction colors={colors} icon={MessageCircle} label={stats.comments} />
          <FeedAction colors={colors} icon={Repeat2} label={stats.reposts} />
          <FeedAction colors={colors} icon={Heart} label={stats.likes} />
          <FeedAction colors={colors} icon={BarChart3} label={stats.views} />
          <FeedAction colors={colors} icon={Share} />
        </View>
      </View>
    </View>
  );
}

function SmartContractInfoRow({
  colors,
  icon: Icon,
  label,
  last = false,
  value,
}: {
  colors: AppColors;
  icon: LucideIcon;
  label: string;
  last?: boolean;
  value: string;
}) {
  return (
    <View style={[styles.smartInfoRow, !last && { borderBottomColor: colors.border, borderBottomWidth: border.hairline }]}>
      <View style={styles.smartInfoLabelWrap}>
        <Icon color={colors.primaryDark} size={16} strokeWidth={2} />
        <Text numberOfLines={1} style={[styles.smartInfoLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.smartInfoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function FeedAction({
  active = false,
  colors,
  icon: Icon,
  label,
}: {
  active?: boolean;
  colors: AppColors;
  icon: LucideIcon;
  label?: string;
}) {
  const actionColor = active ? '#E91E83' : colors.textSecondary;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label ? `Tương tác ${label}` : 'Chia sẻ'} style={styles.action}>
      <Icon color={actionColor} fill={active ? actionColor : 'none'} size={20} strokeWidth={1.8} />
      {label ? <Text style={[styles.actionText, { color: actionColor }]}>{label}</Text> : null}
    </Pressable>
  );
}

function IdentraAvatar() {
  return (
    <LinearGradient colors={[palette.blue[400], palette.purple[500]]} style={styles.identraAvatar}>
      <View style={styles.identraAvatarInner}>
        <AppLogo size={32} />
      </View>
    </LinearGradient>
  );
}

function GenfestAvatar() {
  return (
    <LinearGradient colors={['#2300D8', '#7C2DFF']} style={styles.genfestAvatar}>
      <Text style={styles.genfestAvatarText}>GEN</Text>
    </LinearGradient>
  );
}

function InitialAvatar({ colors, initials }: { colors: AppColors; initials: string }) {
  return (
    <LinearGradient colors={[colors.primaryDark, colors.secondary]} style={styles.initialAvatar}>
      <Text style={styles.initialAvatarText}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerOverlay: { position: 'absolute', top: 0, right: 0, left: 0, zIndex: 4 },
  tabsOverlay: { position: 'absolute', top: NEWS_FEED_HEADER_HEIGHT, right: 0, left: 0, zIndex: 5 },
  header: {
    minHeight: NEWS_FEED_HEADER_HEIGHT,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: { width: touchTarget.minimum, height: touchTarget.minimum, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center' },
  brand: { flexShrink: 0 },
  searchBox: {
    flex: 1,
    minWidth: 92,
    minHeight: 46,
    borderRadius: radius.round,
    borderWidth: border.thin,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchPlaceholder: { flex: 1, fontSize: typography.size.md, fontWeight: typography.weight.medium },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F02850',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  notificationBadgeText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black },
  tabs: { minHeight: NEWS_FEED_TABS_HEIGHT, borderBottomWidth: border.thin, flexDirection: 'row', alignItems: 'flex-end' },
  tab: { flex: 1, minHeight: NEWS_FEED_TABS_HEIGHT, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.md, position: 'relative' },
  activeTabText: { fontSize: typography.size.md, fontWeight: typography.weight.black },
  tabText: { fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  activeIndicator: { position: 'absolute', bottom: 0, width: '72%', height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  content: { paddingTop: NEWS_FEED_OVERLAY_HEIGHT, paddingBottom: 108 },
  livePost: { borderBottomWidth: border.thin, paddingHorizontal: spacing.md, paddingVertical: spacing.lg, flexDirection: 'row', gap: spacing.md },
  livePostAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: border.thick,
    borderColor: palette.blue[700],
    padding: 2,
  },
  livePostAvatar: { width: '100%', height: '100%', borderRadius: radius.round, backgroundColor: palette.gray[100] },
  livePostMetaRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  livePostName: { maxWidth: 100, flexShrink: 1, fontSize: typography.size.md, fontWeight: typography.weight.black },
  livePostHandle: { maxWidth: 82, flexShrink: 1, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  livePostTime: { flexShrink: 0, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  livePostMore: { marginLeft: 'auto' },
  liveStateRow: { marginTop: spacing.xs, flexDirection: 'row', alignItems: 'center' },
  liveMetaPill: { borderRadius: radius.round, backgroundColor: 'rgba(53, 92, 255, 0.14)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  liveMetaPillText: { color: palette.blue[700], fontSize: typography.size.xs + 1, lineHeight: 17, fontWeight: typography.weight.semibold },
  livePostText: { marginTop: spacing.sm, fontSize: typography.size.md, lineHeight: typography.lineHeight.md, fontWeight: typography.weight.regular },
  livePreviewFrame: {
    marginTop: spacing.md,
    width: '100%',
    aspectRatio: 0.92,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.gray[100],
  },
  livePreviewImage: { flex: 1 },
  livePreviewImageRadius: { borderRadius: radius.xl },
  livePreviewOverlay: { flex: 1, padding: spacing.sm, justifyContent: 'space-between' },
  livePreviewTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  liveBadge: {
    minHeight: 26,
    borderRadius: radius.sm,
    backgroundColor: '#E62C5B',
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.white },
  liveBadgeText: { color: palette.white, fontSize: 10, fontWeight: typography.weight.black, letterSpacing: 0.2 },
  liveViewerCount: {
    minHeight: 26,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liveViewerCountText: { color: palette.white, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  livePreviewBody: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  liveCommentStack: { flex: 1, gap: spacing.xs },
  liveCommentBubble: {
    maxWidth: 166,
    minHeight: 40,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(11, 15, 26, 0.46)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveCommentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.gray[100] },
  liveCommentCopy: { flex: 1, minWidth: 0 },
  liveCommentName: { color: palette.white, fontSize: typography.size.xs, fontWeight: typography.weight.black },
  liveCommentText: { marginTop: spacing.xxs, color: palette.white, fontSize: typography.size.xs, fontWeight: typography.weight.medium },
  liveReactionRail: { width: 32, alignItems: 'center', gap: spacing.xs },
  liveReactionAvatarWrap: { width: 30, height: 30, borderRadius: 15 },
  liveReactionAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: palette.gray[100] },
  liveReactionIcon: {
    position: 'absolute',
    right: -5,
    bottom: -3,
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveReactionMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 15, 26, 0.64)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveReactionMoreText: { color: palette.white, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  liveComposerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  liveComposerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveComposerInput: {
    flex: 1,
    minWidth: 0,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  liveComposerPlaceholder: { flex: 1, color: 'rgba(255,255,255,0.82)', fontSize: typography.size.xs, fontWeight: typography.weight.medium },
  liveHeartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F02850',
    alignItems: 'center',
    justifyContent: 'center',
  },
  post: { borderBottomWidth: border.thin, paddingHorizontal: spacing.md, paddingVertical: spacing.lg, flexDirection: 'row', gap: spacing.md },
  avatarColumn: { width: 52, alignItems: 'center' },
  identraAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  identraAvatarInner: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  genfestAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  genfestAvatarText: { color: palette.white, fontSize: 11, fontWeight: typography.weight.black, letterSpacing: -0.3 },
  initialAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  initialAvatarText: { color: palette.white, fontSize: typography.size.md, fontWeight: typography.weight.black },
  postBody: { flex: 1, minWidth: 0 },
  postMetaRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  authorName: { maxWidth: 112, fontSize: typography.size.md, fontWeight: typography.weight.black },
  authorMeta: { flex: 1, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  moreIcon: { marginLeft: 'auto' },
  postText: { marginTop: spacing.xs, fontSize: typography.size.md, lineHeight: 23, fontWeight: typography.weight.regular },
  verifiedBadge: { width: 17, height: 17, flexShrink: 0 },
  imageWrap: {
    marginTop: spacing.md,
    width: '94%',
    maxWidth: 318,
    aspectRatio: 1.88,
    alignSelf: 'flex-start',
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.gray[100],
  },
  postImage: { width: '100%', height: '100%' },
  imageBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    minWidth: 45,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  imageBadgeText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  smartContractCard: {
    marginTop: spacing.md,
    width: '100%',
    borderWidth: border.thin,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.subtle,
  },
  smartContractHeader: { alignItems: 'flex-start', gap: spacing.sm },
  smartContractTitle: { fontSize: typography.size.md, lineHeight: typography.lineHeight.md, fontWeight: typography.weight.black },
  smartStatusPill: {
    minHeight: 30,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  smartStatusText: { flexShrink: 1, fontSize: typography.size.xs, fontWeight: typography.weight.extraBold },
  smartTradeRow: { gap: spacing.sm },
  smartTradePanel: {
    borderWidth: border.thin,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  smartPaymentPanel: { backgroundColor: '#F1FCF5' },
  smartTradeLabel: { fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs, fontWeight: typography.weight.semibold },
  smartTicketRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  smartTicketArt: {
    width: 46,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  smartTicketBrand: { color: palette.white, fontSize: 6.8, lineHeight: 8, fontWeight: typography.weight.black, letterSpacing: 0.2 },
  smartTicketYear: { color: 'rgba(255,255,255,0.8)', fontSize: 6.5, lineHeight: 8, fontWeight: typography.weight.semibold },
  smartTicketCopy: { flex: 1, minWidth: 0, gap: 2 },
  smartTicketTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  smartTicketTitle: { flex: 1, minWidth: 0, fontSize: 10.5, lineHeight: 14, fontWeight: typography.weight.extraBold },
  smartTinyBadge: { width: 11, height: 11, flexShrink: 0 },
  smartTicketMeta: { fontSize: 8.5, lineHeight: 12, fontWeight: typography.weight.medium },
  smartSoldOutMetaRow: { marginTop: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  smartAssetStatePill: { borderRadius: radius.round, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  smartAssetStateText: { fontSize: 10, lineHeight: 12, fontWeight: typography.weight.extraBold },
  smartRemainingText: { flex: 1, minWidth: 0, fontSize: 10, lineHeight: 13, fontWeight: typography.weight.semibold },
  smartPaymentBox: {
    minHeight: 58,
    borderRadius: radius.md,
    backgroundColor: palette.green[100],
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    gap: 3,
  },
  smartAmount: { color: '#159447', fontSize: typography.size.md, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.black },
  smartPaymentText: { color: '#159447', fontSize: 10.5, lineHeight: 14, fontWeight: typography.weight.semibold },
  smartLimitNotice: {
    minHeight: 34,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smartLimitNoticeText: { flex: 1, minWidth: 0, fontSize: 10.5, lineHeight: 15, fontWeight: typography.weight.semibold },
  smartInfoList: { borderWidth: border.thin, borderRadius: radius.md, overflow: 'hidden' },
  smartInfoRow: { minHeight: 36, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  smartInfoLabelWrap: { width: 116, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  smartInfoLabel: { flex: 1, minWidth: 0, fontSize: 10.5, lineHeight: 14, fontWeight: typography.weight.semibold },
  smartInfoValue: { flex: 1, minWidth: 0, textAlign: 'right', fontSize: 10.5, lineHeight: 15, fontWeight: typography.weight.semibold },
  smartContractActions: { flexDirection: 'row', gap: spacing.sm },
  smartRejectButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: border.thin,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartPrimaryButton: { flex: 1, minHeight: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  smartRejectText: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  smartPrimaryText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black },
  actions: { marginTop: spacing.md, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  action: { minHeight: touchTarget.minimum, minWidth: touchTarget.minimum, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 92,
    zIndex: 5,
  },
  fabButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
});
