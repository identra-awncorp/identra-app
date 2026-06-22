import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { ChatPreview } from '../../data/chatDemoData';
import type { AppColors } from '../../theme';
import { QUICK_AVATAR_INNER_SIZE, THOUGHT_BUBBLE_MAX_LENGTH } from './ChatListData';
import { ChatAvatar } from './ChatListAvatar';
import { styles } from './ChatListStyles';

export function QuickContact({
  colors,
  contact,
  onAvatarPress,
  onThoughtPress,
}: {
  colors: AppColors;
  contact: ChatPreview;
  onAvatarPress: (contact: ChatPreview) => void;
  onThoughtPress: (contact: ChatPreview) => void;
}) {
  const isStory = contact.id === 'story';
  const thought = contact.thought?.slice(0, THOUGHT_BUBBLE_MAX_LENGTH);
  const bubbleBackgroundColor = contact.thoughtBackgroundColor ?? '#FFFFFF';
  const bubbleTextColor = contact.thoughtTextColor ?? '#1F2A44';
  const avatarAccessibilityLabel = isStory
    ? 'Tạo tin mới'
    : contact.hasNewPost
      ? `Xem Reels của ${contact.name}`
      : `Mở trò chuyện với ${contact.name}`;
  const thoughtAccessibilityLabel = isStory ? 'Chia sẻ suy nghĩ' : `Xem suy nghĩ của ${contact.name}`;
  return (
    <View style={styles.quickContact}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={thoughtAccessibilityLabel}
        onPress={() => onThoughtPress(contact)}
        style={({ pressed }) => [styles.thoughtSlot, { opacity: pressed ? 0.7 : 1 }]}
      >
        {thought ? (
          <View style={styles.thoughtBubbleWrap}>
            <View
              style={[
                styles.thoughtBubble,
                {
                  backgroundColor: bubbleBackgroundColor,
                  borderColor: contact.hasNewPost ? bubbleBackgroundColor : `${bubbleTextColor}22`,
                },
              ]}
            >
              <Text
                ellipsizeMode="tail"
                numberOfLines={2}
                style={[styles.thoughtBubbleText, { color: bubbleTextColor }]}
              >
                {thought}
              </Text>
            </View>
            <View
              style={[
                styles.thoughtTailLarge,
                {
                  backgroundColor: bubbleBackgroundColor,
                  borderColor: contact.hasNewPost ? bubbleBackgroundColor : `${bubbleTextColor}20`,
                },
              ]}
            />
            <View style={[styles.thoughtTailSmall, { backgroundColor: bubbleBackgroundColor }]} />
          </View>
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={avatarAccessibilityLabel}
        onPress={() => onAvatarPress(contact)}
        style={({ pressed }) => [styles.quickAvatarPressable, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View
          style={[
            styles.quickAvatarOuter,
            isStory && { borderColor: `${colors.primaryDark}55`, borderStyle: 'dashed' },
            contact.hasNewPost && !isStory && { borderColor: colors.primaryDark, borderWidth: 2.2 },
          ]}
        >
          {isStory ? (
            <Plus color={colors.primaryDark} size={32} strokeWidth={2.1} />
          ) : (
            <ChatAvatar colors={colors} item={contact} size={QUICK_AVATAR_INNER_SIZE} />
          )}
          {contact.online && !isStory ? (
            <View style={[styles.onlineDotLarge, { borderColor: colors.background }]} />
          ) : null}
        </View>
        <Text numberOfLines={1} style={[styles.quickName, { color: colors.text }]}>
          {contact.name}
        </Text>
      </Pressable>
    </View>
  );
}
