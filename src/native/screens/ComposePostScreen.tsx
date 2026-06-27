import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Music2,
  Radio,
  ShieldCheck,
  Smile,
  UserRoundPlus,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppColors } from '../theme';
import { border, palette, radius, shadows, spacing, touchTarget, typography } from '../theme';

const authorAvatar = require('../../assets/images/student_avatar_png_1781051105999.png');

type ComposePostScreenProps = {
  authorName: string;
  colors: AppColors;
  onClose: () => void;
  onSubmit: () => void;
};

type QuickAction = {
  icon: LucideIcon;
  label: string;
  tint: string;
};

export function ComposePostScreen({ authorName, colors, onClose, onSubmit }: ComposePostScreenProps) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const quickActions: QuickAction[] = [
    { icon: Music2, label: 'Nhạc', tint: '#B923F5' },
    { icon: UserRoundPlus, label: 'Gắn thẻ', tint: colors.primaryDark },
    { icon: Smile, label: 'Cảm xúc', tint: colors.success },
    { icon: MapPin, label: 'Vị trí', tint: '#A020F0' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      nativeID="screen-compose-post"
      testID="screen-compose-post"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityLabel="Đóng màn hình đăng bài"
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.62 : 1 },
          ]}
        >
          <X color={colors.text} size={28} strokeWidth={2.2} />
        </Pressable>

        <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>Đăng bài viết</Text>

        <Pressable
          accessibilityLabel="Đăng bài viết"
          accessibilityRole="button"
          onPress={onSubmit}
          style={({ pressed }) => [styles.publishButton, { opacity: pressed ? 0.75 : 1 }]}
        >
          <LinearGradient colors={[colors.primaryDark, colors.primaryHover]} style={styles.publishGradient}>
            <Text style={styles.publishText}>Đăng</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxl) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authorRow}>
          <Image source={authorAvatar} resizeMode="cover" style={styles.avatar} />
          <View style={styles.authorCopy}>
            <Pressable
              accessibilityLabel="Chọn danh tính đăng bài"
              accessibilityRole="button"
              style={({ pressed }) => [styles.authorNameRow, { opacity: pressed ? 0.68 : 1 }]}
            >
              <Text numberOfLines={1} style={[styles.authorName, { color: colors.text }]}>{authorName}</Text>
              <ChevronDown color={colors.text} size={20} strokeWidth={2.1} />
            </Pressable>
            <Pressable
              accessibilityLabel="Chọn ai có thể trả lời"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.replyPill,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.68 : 1 },
              ]}
            >
              <MessageCircle color={colors.textSecondary} size={18} strokeWidth={2} />
              <Text numberOfLines={1} style={[styles.replyText, { color: colors.textSecondary }]}>Mọi người đều có thể trả lời</Text>
              <ChevronDown color={colors.textSecondary} size={16} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.quickStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={action.label}
              action={action}
              colors={colors}
              showDivider={index > 0}
            />
          ))}
        </View>

        <View style={[styles.editorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            accessibilityLabel="Nội dung bài viết"
            multiline
            onChangeText={setContent}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor={colors.textSecondary}
            style={[styles.editorInput, { color: colors.text }]}
            textAlignVertical="top"
            value={content}
          />
        </View>

        <View style={[styles.addCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thêm vào bài viết</Text>
          <View style={styles.attachmentGrid}>
            <AttachmentOption colors={colors} label="Ảnh/video" tint={colors.primaryDark}>
              <ImageIcon color={colors.primaryDark} size={26} strokeWidth={2.1} />
            </AttachmentOption>
            <AttachmentOption colors={colors} label="Ảnh GIF" tint={colors.success}>
              <Text style={[styles.gifText, { color: colors.success }]}>GIF</Text>
            </AttachmentOption>
            <AttachmentOption colors={colors} label="Trực tiếp" tint="#F02B63">
              <Radio color="#F02B63" size={26} strokeWidth={2.1} />
            </AttachmentOption>
            <AttachmentOption colors={colors} label="Hợp đồng thông minh" tint={colors.warning}>
              <FileCheck2 color={colors.warning} size={26} strokeWidth={2.1} />
            </AttachmentOption>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Mở thiết lập nâng cao"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.advancedRow,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <View style={[styles.advancedIcon, { backgroundColor: colors.surfaceMuted }]}>
            <ShieldCheck color={colors.primaryDark} size={24} strokeWidth={2.1} />
          </View>
          <Text style={[styles.advancedText, { color: colors.text }]}>Thiết lập nâng cao</Text>
          <ChevronRight color={colors.textSecondary} size={28} strokeWidth={2.1} />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function QuickActionButton({
  action,
  colors,
  showDivider,
}: {
  action: QuickAction;
  colors: AppColors;
  showDivider: boolean;
}) {
  const Icon = action.icon;

  return (
    <Pressable
      accessibilityLabel={action.label}
      accessibilityRole="button"
      style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.64 : 1 }]}
    >
      {showDivider ? <View style={[styles.quickDivider, { backgroundColor: colors.border }]} /> : null}
      <Icon color={action.tint} size={24} strokeWidth={2.1} />
      <Text numberOfLines={1} style={[styles.quickLabel, { color: colors.textSecondary }]}>{action.label}</Text>
    </Pressable>
  );
}

function AttachmentOption({
  children,
  colors,
  label,
  tint,
}: {
  children: ReactNode;
  colors: AppColors;
  label: string;
  tint: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`Thêm ${label}`}
      accessibilityRole="button"
      style={({ pressed }) => [styles.attachmentOption, { opacity: pressed ? 0.64 : 1 }]}
    >
      <View style={[styles.attachmentIconBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={[styles.attachmentGlow, { backgroundColor: tint }]} />
        {children}
      </View>
      <Text numberOfLines={2} style={[styles.attachmentLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    minHeight: 68,
    borderBottomWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    right: 92,
    left: 92,
    textAlign: 'center',
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.black,
  },
  publishButton: { minWidth: 76, height: 48, borderRadius: radius.md, overflow: 'hidden' },
  publishGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  publishText: { color: palette.white, fontSize: typography.size.md, fontWeight: typography.weight.black },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  authorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: palette.gray[100] },
  authorCopy: { flex: 1, minWidth: 0, gap: spacing.sm },
  authorNameRow: { minHeight: 32, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  authorName: { maxWidth: 190, fontSize: typography.size.md + 2, lineHeight: 24, fontWeight: typography.weight.black },
  replyPill: {
    maxWidth: '100%',
    minHeight: 40,
    borderWidth: border.hairline,
    borderRadius: radius.md + 2,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  replyText: { flexShrink: 1, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  quickStrip: {
    minHeight: 64,
    borderWidth: border.hairline,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.subtle,
  },
  quickAction: { flex: 1, minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  quickDivider: { position: 'absolute', left: 0, width: border.hairline, height: 32, opacity: 0.68 },
  quickLabel: { flexShrink: 1, fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },
  editorCard: {
    minHeight: 260,
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.subtle,
  },
  editorInput: {
    minHeight: 220,
    fontSize: typography.size.lg + 2,
    lineHeight: 30,
    fontWeight: typography.weight.regular,
  },
  addCard: {
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    ...shadows.subtle,
  },
  sectionTitle: { fontSize: typography.size.md + 2, lineHeight: 24, fontWeight: typography.weight.black },
  attachmentGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  attachmentOption: { flex: 1, minHeight: 104, alignItems: 'center', gap: spacing.sm },
  attachmentIconBox: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  attachmentGlow: { position: 'absolute', width: 34, height: 34, borderRadius: 17, opacity: 0.08 },
  attachmentLabel: { minHeight: 40, textAlign: 'center', fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.medium },
  gifText: { fontSize: typography.size.sm + 1, fontWeight: typography.weight.black },
  advancedRow: {
    minHeight: 68,
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.subtle,
  },
  advancedIcon: { width: touchTarget.comfortable, height: touchTarget.comfortable, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  advancedText: { flex: 1, minWidth: 0, fontSize: typography.size.md, fontWeight: typography.weight.black },
});
