import { MoreHorizontal, Repeat2, Smile, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { ChatPreview } from '../../data/demo/chatDemoData';
import type { AppColors } from '../../theme';
import { ChatAvatar } from './ChatListAvatar';
import { styles } from './ChatListStyles';

export function ThoughtViewerScreen({
  bottomInset,
  colors,
  contact,
  onClose,
  topInset,
}: {
  bottomInset: number;
  colors: AppColors;
  contact: ChatPreview;
  onClose: () => void;
  topInset: number;
}) {
  const thought = contact.thought ?? '';
  const authorName = contact.id === 'story' ? 'Bạn' : contact.name;
  const postedAt = contact.id === 'story' ? 'Vừa xong' : '22 giờ';
  const bubbleBackgroundColor = contact.thoughtBackgroundColor ?? colors.surface;
  const bubbleTextColor = contact.thoughtTextColor ?? colors.text;
  const reactions = ['😭', '👏', '😮', '🥲', '🔥'];
  const quickReactions = ['❤️', '😂', '😮'];

  return (
    <View
      style={[
        styles.thoughtViewerContainer,
        {
          paddingTop: Math.max(topInset, 12) + 14,
          paddingBottom: Math.max(bottomInset, 12) + 14,
        },
      ]}
    >
      <View style={styles.thoughtViewerHeader}>
        <View style={styles.thoughtViewerAuthor}>
          <View style={styles.thoughtViewerHeaderAvatarWrap}>
            <ChatAvatar colors={colors} item={contact} size={54} />
            {contact.online ? <View style={[styles.thoughtViewerOnlineDot, { borderColor: colors.surface }]} /> : null}
          </View>
          <View style={styles.thoughtViewerAuthorCopy}>
            <Text numberOfLines={1} style={[styles.thoughtViewerName, { color: colors.text }]}>
              {authorName}
            </Text>
            <Text style={[styles.thoughtViewerTime, { color: colors.textSecondary }]}>{postedAt}</Text>
          </View>
        </View>

        <View style={styles.thoughtViewerHeaderActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tùy chọn suy nghĩ"
            style={({ pressed }) => [
              styles.thoughtViewerCircleButton,
              { backgroundColor: colors.surface, opacity: pressed ? 0.68 : 1 },
            ]}
          >
            <MoreHorizontal color={colors.text} size={26} strokeWidth={2.4} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng suy nghĩ"
            onPress={onClose}
            style={({ pressed }) => [
              styles.thoughtViewerCircleButton,
              { backgroundColor: colors.surface, opacity: pressed ? 0.68 : 1 },
            ]}
          >
            <X color={colors.text} size={28} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.thoughtViewerMain}>
        <View style={styles.thoughtViewerBubbleWrap}>
          <View
            style={[
              styles.thoughtViewerBubble,
              {
                backgroundColor: bubbleBackgroundColor,
                borderColor: `${bubbleTextColor}18`,
              },
            ]}
          >
            <Text numberOfLines={3} style={[styles.thoughtViewerBubbleText, { color: bubbleTextColor }]}>
              {thought}
            </Text>
          </View>
          <View
            style={[
              styles.thoughtViewerBubbleTail,
              {
                backgroundColor: bubbleBackgroundColor,
                borderColor: `${bubbleTextColor}14`,
              },
            ]}
          />
        </View>

        <View style={[styles.thoughtViewerLargeAvatarFrame, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
          <ChatAvatar colors={colors} item={contact} size={172} />
        </View>
      </View>

      <View style={styles.thoughtViewerBottom}>
        <View style={styles.thoughtViewerReactionRow}>
          {reactions.map((reaction) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Thả cảm xúc ${reaction}`}
              key={reaction}
              style={({ pressed }) => [
                styles.thoughtViewerReactionChip,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.thoughtViewerReactionText}>{reaction}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.thoughtViewerReplyRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chia sẻ lại suy nghĩ"
            style={({ pressed }) => [
              styles.thoughtViewerShareButton,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Repeat2 color={colors.primaryDark} size={26} strokeWidth={2.1} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Gửi tin nhắn cho ${authorName}`}
            style={({ pressed }) => [
              styles.thoughtViewerInput,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Text numberOfLines={1} style={[styles.thoughtViewerInputText, { color: colors.textSecondary }]}>
              Gửi tin nhắn
            </Text>
            <View style={[styles.thoughtViewerSmileButton, { backgroundColor: colors.primary }]}>
              <Smile color="#FFFFFF" size={21} strokeWidth={2.2} />
            </View>
          </Pressable>

          <View style={styles.thoughtViewerQuickReactions}>
            {quickReactions.map((reaction) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Gửi nhanh ${reaction}`}
                key={reaction}
                style={({ pressed }) => [
                  styles.thoughtViewerQuickReaction,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
                ]}
              >
                <Text style={styles.thoughtViewerQuickReactionText}>{reaction}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
