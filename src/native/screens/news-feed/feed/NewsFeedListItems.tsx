import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Code2,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Share,
  ShieldCheck,
  Smile,
  ThumbsUp,
  Ticket,
  type LucideIcon,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Image, ImageBackground, Pressable, Text, View, type ImageSourcePropType } from 'react-native';
import { AppLogo } from '../../../components/AppLogo';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, palette } from '../../../theme';
import {
  liveHostAvatar,
  liveStreamImage,
  liveViewerAvatar,
  verifiedBadgeIcon,
} from '../../../data/demo/newsFeedDemoData';
import type { SmartContractFeedPost } from '../../../types';
import { newsFeedStyles as styles } from './newsFeedStyles';

export function LiveFeedPost({ colors, onOpen }: { colors: AppColors; onOpen: () => void }) {
  const { t } = useI18n();

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
            <Text style={styles.liveMetaPillText}>{t('newsFeed.live.state')}</Text>
          </View>
        </View>

        <Text style={[styles.livePostText, { color: colors.text }]}>
          Chia sẻ nhanh buổi chiều ở Đà Lạt
          {'\n'}
          Ai đang xem thì chào mình nhé
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('newsFeed.live.openStream', { name: 'Dương Tôn Sơn' })}
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
                  <Text numberOfLines={1} style={styles.liveComposerPlaceholder}>{t('newsFeed.live.commentsPlaceholder')}</Text>
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

export function FeedPost({
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
  image: ImageSourcePropType;
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

export function SmartContractFeedPostCard({
  colors,
  onOpenDetail,
  post,
}: {
  colors: AppColors;
  onOpenDetail: () => void;
  post?: SmartContractFeedPost | null;
}) {
  const { t } = useI18n();

  if (!post) return null;

  const { contract, stats } = post;
  const isSoldOut = contract.availability === 'soldOut';
  const isAvailable = contract.availability === 'available';
  const statusColor = isSoldOut ? colors.textSecondary : colors.success;
  const statusBackground = isSoldOut ? colors.surfaceMuted : palette.green[100];
  const contractStatusLabel = isSoldOut
    ? t('newsFeed.smartContract.soldOut')
    : t('newsFeed.smartContract.availableTickets', { count: contract.remainingCount });
  const assetStateLabel = isSoldOut
    ? t('newsFeed.smartContract.assetSoldOut')
    : t('newsFeed.smartContract.availableTickets', { count: contract.remainingCount });
  const remainingLabel = t('newsFeed.smartContract.remainingItems', { count: contract.remainingCount });

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
              <Text numberOfLines={1} style={[styles.smartStatusText, { color: statusColor }]}>{contractStatusLabel}</Text>
            </View>
          </View>

          <View style={styles.smartTradeRow}>
            <View style={[styles.smartTradePanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.smartTradeLabel, { color: colors.text }]}>{t('newsFeed.smartContract.tradeItem')}</Text>
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
                        <Text style={[styles.smartAssetStateText, { color: isAvailable ? colors.success : colors.textSecondary }]}>{assetStateLabel}</Text>
                      </View>
                      <Text numberOfLines={1} style={[styles.smartRemainingText, { color: colors.textSecondary }]}>{remainingLabel}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={[styles.smartTradePanel, styles.smartPaymentPanel, { borderColor: colors.border }]}>
              <Text style={[styles.smartTradeLabel, { color: colors.text }]}>{t('newsFeed.smartContract.counterItem')}</Text>
              <View style={styles.smartPaymentBox}>
                <Text numberOfLines={1} style={styles.smartAmount}>{contract.amount}</Text>
                <Text numberOfLines={1} style={styles.smartPaymentText}>{t('newsFeed.smartContract.payWithIdentraPay')}</Text>
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
            <SmartContractInfoRow colors={colors} icon={CalendarDays} label={t('newsFeed.smartContract.deadline')} value={contract.deadline} />
            <SmartContractInfoRow colors={colors} icon={Code2} label={t('newsFeed.smartContract.condition')} value={contract.condition} />
            <SmartContractInfoRow colors={colors} icon={ShieldCheck} label={t('newsFeed.smartContract.security')} value={contract.security} last />
          </View>

          <View style={styles.smartContractActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('newsFeed.smartContract.detailAccessibility')}
              onPress={onOpenDetail}
              style={({ pressed }) => [styles.smartRejectButton, { borderColor: colors.primaryDark, opacity: pressed ? 0.72 : 1 }]}
            >
              <Text style={[styles.smartRejectText, { color: colors.primaryDark }]}>{t('newsFeed.smartContract.detail')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('newsFeed.smartContract.tradeAccessibility')}
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
                {isSoldOut ? t('newsFeed.smartContract.soldOut') : t('newsFeed.smartContract.trade')}
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

export function IdentraAvatar() {
  return (
    <LinearGradient colors={[palette.blue[400], palette.purple[500]]} style={styles.identraAvatar}>
      <View style={styles.identraAvatarInner}>
        <AppLogo size={32} />
      </View>
    </LinearGradient>
  );
}

export function InitialAvatar({ colors, initials }: { colors: AppColors; initials: string }) {
  return (
    <LinearGradient colors={[colors.primaryDark, colors.secondary]} style={styles.initialAvatar}>
      <Text style={styles.initialAvatarText}>{initials}</Text>
    </LinearGradient>
  );
}

function LiveBadge() {
  const { t } = useI18n();

  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveBadgeDot} />
      <Text style={styles.liveBadgeText}>{t('newsFeed.live.badge')}</Text>
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
  const { t } = useI18n();
  const actionColor = active ? '#E91E83' : colors.textSecondary;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label ? t('newsFeed.actions.interact', { label }) : t('common.share')} style={styles.action}>
      <Icon color={actionColor} fill={active ? actionColor : 'none'} size={20} strokeWidth={1.8} />
      {label ? <Text style={[styles.actionText, { color: actionColor }]}>{label}</Text> : null}
    </Pressable>
  );
}

function GenfestAvatar() {
  return (
    <LinearGradient colors={['#2300D8', '#7C2DFF']} style={styles.genfestAvatar}>
      <Text style={styles.genfestAvatarText}>GEN</Text>
    </LinearGradient>
  );
}
