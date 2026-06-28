import { LinearGradient } from 'expo-linear-gradient';
import { Music, Smile, X } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { demoAvatars } from '../../data/demo/chatDemoData';
import type { AppColors } from '../../theme';
import { styles } from './ChatListStyles';

export function ShareThoughtScreen({
  bottomInset,
  colors,
  onChangeThought,
  onClose,
  onSubmit,
  thought,
}: {
  bottomInset: number;
  colors: AppColors;
  onChangeThought: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  thought: string;
}) {
  const { width } = useWindowDimensions();
  const compactHeader = width < 360;

  return (
    <ScrollView
      contentContainerStyle={[styles.shareThoughtContent, { paddingBottom: Math.max(bottomInset, 18) + 18 }]}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.shareThoughtScreen}
    >
      <View style={styles.shareThoughtHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đóng chia sẻ suy nghĩ"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [styles.shareThoughtCloseButton, { opacity: pressed ? 0.62 : 1 }]}
        >
          <X color={colors.text} size={31} strokeWidth={2} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={[
            styles.shareThoughtTitle,
            compactHeader && styles.shareThoughtTitleCompact,
            { color: colors.text },
          ]}
        >
          Chia sẻ suy nghĩ
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chia sẻ suy nghĩ"
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.shareThoughtSubmitButton,
            compactHeader && styles.shareThoughtSubmitButtonCompact,
            { opacity: pressed ? 0.84 : 1 },
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareThoughtSubmitGradient}
          >
            <Text style={styles.shareThoughtSubmitText}>Chia sẻ</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.shareThoughtMain}>
        <View style={styles.shareThoughtBubbleWrap}>
          <View style={[styles.shareThoughtBubbleTail, { backgroundColor: colors.surface, borderColor: colors.border }]} />
          <View style={[styles.shareThoughtBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.shareThoughtCaret, { backgroundColor: colors.primaryDark }]} />
            <TextInput
              accessibilityLabel="Bạn đang nghĩ gì hôm nay?"
              maxLength={60}
              onChangeText={onChangeThought}
              placeholder="Bạn đang nghĩ gì hôm nay?"
              placeholderTextColor="#9AA3B8"
              returnKeyType="done"
              selectionColor={colors.primaryDark}
              style={[styles.shareThoughtInput, { color: colors.text }]}
              value={thought}
            />
          </View>
        </View>

        <View style={[styles.shareThoughtAvatarFrame, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
          <Image source={demoAvatars.catMask} style={styles.shareThoughtAvatar} />
        </View>

        <View style={styles.shareThoughtActions}>
          <ThoughtActionChip colors={colors} icon="music" label="Âm nhạc" />
          <ThoughtActionChip colors={colors} icon="gif" label="GIF" />
          <ThoughtActionChip colors={colors} icon="mood" label="Cảm xúc" />
        </View>
      </View>

      <View style={styles.shareThoughtFooter}>
        <Text style={[styles.shareThoughtHint, { color: colors.textSecondary }]}>
          Suy nghĩ của bạn sẽ hiển thị với bạn bè trong vòng 24 giờ
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Thay đổi quyền riêng tư" hitSlop={8}>
          <Text style={[styles.shareThoughtPrivacy, { color: colors.primaryDark }]}>Thay đổi quyền riêng tư</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ThoughtActionChip({
  colors,
  icon,
  label,
}: {
  colors: AppColors;
  icon: 'music' | 'gif' | 'mood';
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.thoughtActionChip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      {icon === 'music' ? <Music color={colors.primaryDark} size={28} strokeWidth={2.2} /> : null}
      {icon === 'gif' ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thoughtGifBadge}
        >
          <Text style={styles.thoughtGifText}>GIF</Text>
        </LinearGradient>
      ) : null}
      {icon === 'mood' ? (
        <View style={[styles.thoughtMoodIcon, { backgroundColor: colors.primary }]}>
          <Smile color="#FFFFFF" size={20} strokeWidth={2.4} />
        </View>
      ) : null}
      <Text style={[styles.thoughtActionText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}
