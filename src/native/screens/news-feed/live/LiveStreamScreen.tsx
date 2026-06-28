import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Eye,
  Heart,
  MoreHorizontal,
  Send,
  Smile,
  ThumbsUp,
} from 'lucide-react-native';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../../theme';
import {
  liveHostAvatar,
  liveStreamImage,
  liveViewerAvatar,
  liveViewerAvatarAlt,
} from '../../../data/demo/newsFeedDemoData';

export function LiveStreamScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <View nativeID="screen-live-stream-viewer" testID="screen-live-stream-viewer" style={styles.screen}>
      <ImageBackground source={liveStreamImage} style={styles.background} resizeMode="cover">
        <LinearGradient
          colors={['rgba(0, 39, 78, 0.48)', 'rgba(0, 0, 0, 0.06)', 'rgba(0, 0, 0, 0.74)']}
          style={[styles.overlay, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xl) }]}
        >
          <View style={styles.topArea}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('notifications.backToFeed')}
                onPress={onBack}
                style={({ pressed }) => [styles.glassButton, { opacity: pressed ? 0.68 : 1 }]}
              >
                <ArrowLeft color={palette.white} size={24} strokeWidth={2.2} />
              </Pressable>

              <View style={styles.hostAvatarWrap}>
                <Image source={liveHostAvatar} style={[styles.hostAvatar, { borderColor: colors.primaryDark }]} resizeMode="cover" />
              </View>
              <View style={styles.hostInfo}>
                <Text numberOfLines={1} style={styles.hostName}>Dương Tôn Sơn</Text>
                <View style={styles.hostMetaRow}>
                  <View style={styles.liveStatePill}>
                    <Text style={styles.liveStateText}>{t('newsFeed.live.state')}</Text>
                  </View>
                  <Text style={styles.hostMetaText}>2 phút</Text>
                </View>
              </View>

              <View style={styles.viewerPill}>
                <Eye color={palette.white} size={19} strokeWidth={2.2} />
                <Text style={styles.viewerPillText}>128</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('newsFeed.live.options')}
                style={({ pressed }) => [styles.glassButton, { opacity: pressed ? 0.68 : 1 }]}
              >
                <MoreHorizontal color={palette.white} size={24} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveBadgeDot} />
              <Text style={styles.liveBadgeText}>{t('newsFeed.live.badge')}</Text>
            </View>
          </View>

          <View style={styles.bottomArea}>
            <View style={styles.liveContentRow}>
              <View style={styles.commentStack}>
                <LiveViewerComment avatar={liveViewerAvatar} name="Minh Anh" text="Đẹp quá Sơn ơi!" />
                <LiveViewerComment avatar={liveViewerAvatarAlt} name="Khánh" text="Thời tiết hôm nay tuyệt quá!" />
                <LiveViewerComment avatar={liveHostAvatar} name="Tuấn" text="Chào Sơn nhé" />
              </View>

              <View style={styles.reactionRail}>
                <LiveReaction avatar={liveViewerAvatar} icon="heart" />
                <LiveReaction avatar={liveViewerAvatarAlt} icon="like" />
                <View style={styles.reactionMore}>
                  <Text style={styles.reactionMoreText}>+24</Text>
                </View>
              </View>
            </View>

            <View style={styles.composerRow}>
              <Pressable accessibilityRole="button" accessibilityLabel={t('newsFeed.live.writeComment')} style={styles.commentInput}>
                <Text numberOfLines={1} style={styles.commentPlaceholder}>{t('newsFeed.live.commentsPlaceholder')}</Text>
                <Smile color={palette.white} size={22} strokeWidth={2} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={t('newsFeed.live.share')} style={styles.roundControl}>
                <Send color={palette.white} size={22} strokeWidth={2} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={t('newsFeed.live.like')} style={styles.heartControl}>
                <Heart color={palette.white} fill={palette.white} size={26} strokeWidth={1.8} />
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

function LiveViewerComment({
  avatar,
  name,
  text,
}: {
  avatar: ImageSourcePropType;
  name: string;
  text: string;
}) {
  return (
    <View style={styles.viewerComment}>
      <Image source={avatar} style={styles.viewerCommentAvatar} resizeMode="cover" />
      <View style={styles.viewerCommentCopy}>
        <Text numberOfLines={1} style={styles.viewerCommentName}>{name}</Text>
        <Text numberOfLines={1} style={styles.viewerCommentText}>{text}</Text>
      </View>
    </View>
  );
}

function LiveReaction({ avatar, icon }: { avatar: ImageSourcePropType; icon: 'heart' | 'like' }) {
  const Icon = icon === 'heart' ? Heart : ThumbsUp;
  return (
    <View style={styles.reactionAvatarWrap}>
      <Image source={avatar} style={styles.reactionAvatar} resizeMode="cover" />
      <View style={[styles.reactionIcon, { backgroundColor: icon === 'heart' ? '#F02850' : '#FFB545' }]}>
        <Icon color={palette.white} fill={icon === 'heart' ? palette.white : 'none'} size={17} strokeWidth={2.2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.black },
  background: { flex: 1 },
  overlay: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md, justifyContent: 'space-between' },
  topArea: { gap: spacing.lg },
  header: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  glassButton: {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostAvatarWrap: { width: 46, height: 46, borderRadius: 23 },
  hostAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    backgroundColor: palette.gray[100],
  },
  hostInfo: { flex: 1, minWidth: 0 },
  hostName: { color: palette.white, fontSize: typography.size.md + 1, lineHeight: 22, fontWeight: typography.weight.black },
  hostMetaRow: { marginTop: spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  liveStatePill: { borderRadius: radius.round, backgroundColor: 'rgba(53, 92, 255, 0.86)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  liveStateText: { color: palette.white, fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },
  hostMetaText: { color: palette.white, fontSize: typography.size.xs + 1, fontWeight: typography.weight.medium },
  viewerPill: {
    minWidth: 66,
    height: touchTarget.minimum,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  viewerPillText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  liveBadge: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: radius.sm,
    backgroundColor: '#E62C5B',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.white },
  liveBadgeText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black, letterSpacing: 0.2 },
  bottomArea: { gap: spacing.md },
  liveContentRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  commentStack: { flex: 1, gap: spacing.xs },
  viewerComment: {
    maxWidth: 224,
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(11, 15, 26, 0.48)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewerCommentAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.gray[100] },
  viewerCommentCopy: { flex: 1, minWidth: 0 },
  viewerCommentName: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black },
  viewerCommentText: { marginTop: spacing.xxs, color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  reactionRail: { width: 48, alignItems: 'center', gap: spacing.sm },
  reactionAvatarWrap: { width: 42, height: 42, borderRadius: 21 },
  reactionAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.gray[100] },
  reactionIcon: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionMore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(11, 15, 26, 0.66)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionMoreText: { color: palette.white, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  roundControl: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInput: {
    flex: 1,
    minWidth: 0,
    height: touchTarget.comfortable,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.54)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  commentPlaceholder: { flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  heartControl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F02850',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
