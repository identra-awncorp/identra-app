import { BellOff, Check, CheckCheck, Clock3, FileText } from 'lucide-react-native';
import { memo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { mediaPreviewImage } from '../../data/demo/chatDemoData';
import type { ChatMediaPreview, ChatPreview, DeliveryStatus } from '../../data/demo/chatDemoData';
import type { AppColors } from '../../theme';
import { useI18n } from '../../i18n';
import { LIST_AVATAR_SIZE } from './ChatListData';
import { ChatAvatar, VerifiedBadgeIcon } from './ChatListAvatar';
import { styles } from './ChatListStyles';
import {
  getMediaThumbPresentation,
  getVisibleDeliveryStatus,
  shouldShowGroupSender,
} from './chatListLogic';

export const ConversationRow = memo(function ConversationRow({
  colors,
  conversation,
  onOpenConversation,
}: {
  colors: AppColors;
  conversation: ChatPreview;
  onOpenConversation: (conversationId: string) => void;
}) {
  const { t } = useI18n();
  const hasUnread = Boolean(conversation.unread);
  const visibleDeliveryStatus = getVisibleDeliveryStatus(conversation);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('chatList.accessibility.openConversation', { name: conversation.name })}
      onPress={() => onOpenConversation(conversation.id)}
      style={({ pressed }) => [
        styles.conversationRow,
        { backgroundColor: pressed ? colors.surfaceMuted : 'transparent' },
      ]}
    >
      <View style={styles.avatarWrap}>
        <ChatAvatar colors={colors} item={conversation} size={LIST_AVATAR_SIZE} />
        {conversation.online ? <View style={[styles.onlineDot, { borderColor: colors.background }]} /> : null}
        {conversation.muted ? (
          <View style={[styles.muteBadge, { backgroundColor: colors.surface, borderColor: colors.background }]}>
            <BellOff color={colors.textSecondary} size={11} strokeWidth={2.2} />
          </View>
        ) : null}
      </View>
      <View style={styles.conversationMain}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.conversationName,
              { color: colors.text },
              hasUnread && styles.unreadName,
            ]}
          >
            {conversation.name}
          </Text>
          {conversation.verified ? <VerifiedBadgeIcon size={20} /> : null}
        </View>
        <ConversationPreview colors={colors} conversation={conversation} hasUnread={hasUnread} />
      </View>
      <View style={styles.trailing}>
        <View style={styles.timeStatusRow}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>{conversation.time}</Text>
          {visibleDeliveryStatus ? (
            <DeliveryStatusIcon colors={colors} status={visibleDeliveryStatus} />
          ) : null}
        </View>
        {hasUnread ? (
          <View style={[styles.unreadDot, conversation.unread !== undefined && conversation.unread > 1 ? styles.unreadCount : null]}>
            {conversation.unread && conversation.unread > 1 ? <Text style={styles.unreadCountText}>{conversation.unread}</Text> : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

function ConversationPreview({
  colors,
  conversation,
  hasUnread,
}: {
  colors: AppColors;
  conversation: ChatPreview;
  hasUnread: boolean;
}) {
  const { t } = useI18n();
  const mediaOnly = Boolean(conversation.media && !conversation.message);
  const previewText = conversation.message || getLocalizedMediaLabel(conversation.media, t);
  const showGroupSender = shouldShowGroupSender(conversation);

  return (
    <View style={styles.previewRow}>
      <View style={styles.previewMain}>
        {conversation.media ? <MediaThumbStack colors={colors} media={conversation.media} /> : null}
        <Text
          numberOfLines={1}
          style={[
            styles.conversationMessage,
            { color: mediaOnly ? colors.primaryDark : hasUnread ? colors.text : colors.textSecondary },
            hasUnread && !mediaOnly && styles.unreadMessage,
            mediaOnly && styles.mediaOnlyText,
          ]}
        >
          {previewText}
        </Text>
      </View>
      {showGroupSender ? (
        <Text numberOfLines={1} style={[styles.groupSender, { color: colors.textSecondary }]}>
          {conversation.groupSender}
        </Text>
      ) : null}
    </View>
  );
}

function DeliveryStatusIcon({ colors, status }: { colors: AppColors; status: DeliveryStatus }) {
  if (status === 'pending') {
    return <Clock3 color="#F59E0B" size={13} strokeWidth={2.2} />;
  }

  if (status === 'seen') {
    return <CheckCheck color={colors.primaryDark} size={15} strokeWidth={2.2} />;
  }

  return <Check color={colors.textSecondary} size={14} strokeWidth={2.2} />;
}

function MediaThumbStack({ colors, media }: { colors: AppColors; media: ChatMediaPreview }) {
  const { overflowCount, visibleCount } = getMediaThumbPresentation(media);

  return (
    <View style={styles.mediaThumbStack}>
      {Array.from({ length: visibleCount }).map((_, index) => {
        const showOverflow = index === visibleCount - 1 && overflowCount > 0;
        return (
          <View
            key={`${media.type}-${index}`}
            style={[
              styles.mediaThumb,
              index > 0 && styles.mediaThumbOverlap,
              {
                backgroundColor: media.type === 'file' ? colors.surfaceMuted : '#EAF2FF',
                borderColor: colors.surface,
              },
            ]}
          >
            {media.type === 'photo' ? (
              <Image source={mediaPreviewImage} style={styles.mediaThumbImage} />
            ) : media.type === 'gif' ? (
              <Text style={[styles.gifThumbText, { color: colors.primaryDark }]}>GIF</Text>
            ) : (
              <FileText color={colors.primaryDark} size={14} strokeWidth={2} />
            )}
            {showOverflow ? (
              <View style={styles.mediaThumbOverlay}>
                <Text style={styles.mediaThumbOverlayText}>+{overflowCount}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function getLocalizedMediaLabel(media: ChatMediaPreview | undefined, t: ReturnType<typeof useI18n>['t']) {
  if (!media) return '';
  if (media.type === 'photo') return t('chat.common.mediaPhoto');
  if (media.type === 'gif') return 'GIF';
  return media.fileName ?? t('chat.common.mediaFile');
}
