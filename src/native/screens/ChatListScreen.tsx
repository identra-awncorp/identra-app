import { LinearGradient } from 'expo-linear-gradient';
import {
  BadgeCheck,
  BellOff,
  Check,
  CheckCheck,
  Clock3,
  FileText,
  MessageCircle,
  Newspaper,
  Plus,
  ScanLine,
  Search,
  SquarePen,
  UserRound,
  WalletCards,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBrandLogo, AppLogo } from '../components/AppLogo';
import { chatConversations, demoAvatars, mediaPreviewImage, quickContacts } from '../data/chatDemoData';
import type { ChatMediaPreview, ChatPreview, DeliveryStatus } from '../data/chatDemoData';
import { IconButton } from '../components/ui';
import type { AppColors } from '../theme';

const QUICK_AVATAR_SIZE = 68;
const QUICK_AVATAR_INNER_SIZE = 62;
const QUICK_CONTACT_WIDTH = 86;
const THOUGHT_BUBBLE_WIDTH = 86;
const THOUGHT_BUBBLE_HEIGHT = 42;
const THOUGHT_BUBBLE_OVERLAP = 7;
const THOUGHT_BUBBLE_MAX_LENGTH = 60;
const LIST_AVATAR_SIZE = 56;

export function ChatListScreen({
  colors,
  onOpenFeed,
  onOpenIDPay,
  onOpenConversation,
  onOpenProfile,
  onOpenScan,
}: {
  colors: AppColors;
  onOpenFeed: () => void;
  onOpenIDPay: () => void;
  onOpenConversation: (conversationId: string) => void;
  onOpenProfile: () => void;
  onOpenScan: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
  const filteredConversations = useMemo(() => {
    if (!normalizedQuery) return chatConversations;
    return chatConversations.filter((item) =>
      `${item.name} ${item.message} ${item.groupSender ?? ''} ${item.media?.fileName ?? ''} ${item.media?.type ?? ''}`
        .toLocaleLowerCase('vi-VN')
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  return (
    <View
      nativeID="screen-chat-list"
      testID="screen-chat-list"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <AppBrandLogo colors={colors} logoSize={28} wordmarkSize={20} style={styles.brand} />
        <View style={styles.headerActions}>
          <IconButton colors={colors} label="Soạn tin nhắn mới" style={styles.headerAction}>
            <SquarePen color={colors.text} size={23} strokeWidth={1.9} />
          </IconButton>
          <IconButton colors={colors} label="Tạo cuộc trò chuyện" style={styles.headerAction}>
            <Plus color={colors.text} size={27} strokeWidth={1.8} />
          </IconButton>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 8) + 70 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search color={colors.textSecondary} size={24} strokeWidth={1.9} />
          <TextInput
            accessibilityLabel="Tìm cuộc trò chuyện hoặc danh tính"
            onChangeText={setQuery}
            placeholder="Tìm cuộc trò chuyện hoặc danh tính"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={query}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.quickContacts}
          horizontal
          style={styles.quickContactsScroll}
          showsHorizontalScrollIndicator={false}
        >
          {quickContacts.map((contact) => (
            <QuickContact key={contact.id} colors={colors} contact={contact} onPress={onOpenConversation} />
          ))}
        </ScrollView>

        <View style={styles.conversationList}>
          {filteredConversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              colors={colors}
              conversation={conversation}
              onPress={() => onOpenConversation(conversation.id)}
            />
          ))}
          {filteredConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
                <MessageCircle color={colors.primaryDark} size={30} strokeWidth={1.9} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Không tìm thấy trò chuyện</Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Thử tìm bằng tên liên hệ, tổ chức hoặc nội dung tin nhắn gần đây.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <ChatListBottomMenu
        bottomInset={insets.bottom}
        colors={colors}
        onOpenFeed={onOpenFeed}
        onOpenIDPay={onOpenIDPay}
        onOpenProfile={onOpenProfile}
        onOpenScan={onOpenScan}
      />
    </View>
  );
}

function QuickContact({
  colors,
  contact,
  onPress,
}: {
  colors: AppColors;
  contact: ChatPreview;
  onPress: (conversationId: string) => void;
}) {
  const isStory = contact.id === 'story';
  const thought = contact.thought?.slice(0, THOUGHT_BUBBLE_MAX_LENGTH);
  const bubbleBackgroundColor = contact.thoughtBackgroundColor ?? '#FFFFFF';
  const bubbleTextColor = contact.thoughtTextColor ?? '#1F2A44';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isStory ? 'Tạo tin mới' : `Mở trò chuyện với ${contact.name}`}
      onPress={() => onPress(isStory ? 'minh-anh' : contact.id)}
      style={({ pressed }) => [styles.quickContact, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.thoughtSlot}>
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
      </View>
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
        {contact.online && !isStory ? <View style={[styles.onlineDotLarge, { borderColor: colors.background }]} /> : null}
      </View>
      <Text numberOfLines={1} style={[styles.quickName, { color: colors.text }]}>
        {contact.name}
      </Text>
    </Pressable>
  );
}

function ConversationRow({
  colors,
  conversation,
  onPress,
}: {
  colors: AppColors;
  conversation: ChatPreview;
  onPress: () => void;
}) {
  const hasUnread = Boolean(conversation.unread);
  const visibleDeliveryStatus = conversation.lastMessageFromMe ? conversation.deliveryStatus : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mở trò chuyện ${conversation.name}`}
      onPress={onPress}
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
          {conversation.verified ? <BadgeCheck color={colors.primaryDark} fill={colors.primaryDark} size={17} /> : null}
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
}

function ConversationPreview({
  colors,
  conversation,
  hasUnread,
}: {
  colors: AppColors;
  conversation: ChatPreview;
  hasUnread: boolean;
}) {
  const mediaOnly = Boolean(conversation.media && !conversation.message);
  const previewText = conversation.message || getMediaLabel(conversation.media);

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
      {conversation.groupSender ? (
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
  const count = Math.min(media.count ?? 1, 4);
  const overflowCount = Math.max((media.count ?? 1) - count, 0);

  return (
    <View style={styles.mediaThumbStack}>
      {Array.from({ length: count }).map((_, index) => {
        const showOverflow = index === count - 1 && overflowCount > 0;
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

function getMediaLabel(media?: ChatMediaPreview) {
  if (!media) return '';
  if (media.type === 'photo') return 'Photo';
  if (media.type === 'gif') return 'GIF';
  return media.fileName ?? 'File';
}

function ChatListBottomMenu({
  bottomInset,
  colors,
  onOpenFeed,
  onOpenIDPay,
  onOpenProfile,
  onOpenScan,
}: {
  bottomInset: number;
  colors: AppColors;
  onOpenFeed: () => void;
  onOpenIDPay: () => void;
  onOpenProfile: () => void;
  onOpenScan: () => void;
}) {
  const items = [
    { key: 'chat', label: 'Trò chuyện', icon: MessageCircle, active: true, onPress: () => undefined },
    { key: 'feed', label: 'Bảng tin', icon: Newspaper, active: false, onPress: onOpenFeed },
    { key: 'scan', label: 'Quét mã', icon: ScanLine, active: false, onPress: onOpenScan },
    { key: 'idpay', label: 'IDPay', icon: WalletCards, active: false, onPress: onOpenIDPay },
    { key: 'profile', label: 'Cá nhân', icon: UserRound, active: false, onPress: onOpenProfile },
  ];

  return (
    <View
      nativeID="chat-list-bottom-menu"
      testID="chat-list-bottom-menu"
      style={[
        styles.bottomMenu,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(bottomInset, 8),
        },
      ]}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Pressable
            key={item.key}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: item.active }}
            onPress={item.onPress}
            style={({ pressed }) => [styles.bottomMenuItem, { opacity: pressed ? 0.62 : 1 }]}
          >
            <View style={styles.bottomMenuIcon}>
              <Icon
                color={item.active ? colors.primaryDark : colors.textSecondary}
                fill={item.active && item.key === 'chat' ? colors.primaryDark : 'none'}
                size={23}
                strokeWidth={item.active ? 2.3 : 1.9}
              />
            </View>
            <Text style={[styles.bottomMenuLabel, { color: item.active ? colors.primaryDark : colors.textSecondary }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ChatAvatar({ colors, item, size }: { colors: AppColors; item: ChatPreview; size: number }) {
  if (item.avatarSource) {
    return <Image source={item.avatarSource} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  if (item.avatar === 'photo') {
    return <Image source={demoAvatars.catFlower} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  if (item.avatar === 'identra') {
    return (
      <View
        style={[
          styles.identraAvatar,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceMuted },
        ]}
      >
        <AppLogo size={Math.floor(size * 0.62)} />
      </View>
    );
  }

  if (item.avatar === 'group') {
    return (
      <LinearGradient
        colors={['#1F2937', item.accent ?? '#355CFF']}
        style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={[styles.groupInitials, { fontSize: size * 0.31 }]}>{item.initials}</Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.initialAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: item.accent ?? colors.surfaceMuted,
        },
      ]}
    >
      <UserRound color={colors.primaryDark} size={size * 0.42} strokeWidth={1.8} />
      <Text style={[styles.initials, { color: colors.text, fontSize: size * 0.24 }]}>{item.initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { minHeight: 62, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { flex: 1, minWidth: 0 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerAction: { borderRadius: 22 },
  searchBox: {
    minHeight: 56,
    marginHorizontal: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#27375F',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 1,
  },
  searchInput: { flex: 1, minHeight: 50, fontSize: 16, lineHeight: 22, fontWeight: '400', paddingVertical: 0 },
  content: { paddingTop: 10 },
  quickContactsScroll: { overflow: 'visible' },
  quickContacts: { paddingHorizontal: 18, paddingTop: 8, gap: 13 },
  quickContact: { width: QUICK_CONTACT_WIDTH, alignItems: 'center', gap: 0 },
  thoughtSlot: {
    width: THOUGHT_BUBBLE_WIDTH,
    height: THOUGHT_BUBBLE_HEIGHT + 9,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  thoughtBubbleWrap: {
    width: THOUGHT_BUBBLE_WIDTH,
    alignItems: 'center',
    paddingBottom: 11,
    marginBottom: -THOUGHT_BUBBLE_OVERLAP,
  },
  thoughtBubble: {
    width: THOUGHT_BUBBLE_WIDTH,
    height: THOUGHT_BUBBLE_HEIGHT,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 7,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#20305C',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  thoughtBubbleText: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  thoughtTailLarge: {
    position: 'absolute',
    bottom: 3,
    left: 18,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: '#20305C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  thoughtTailSmall: {
    position: 'absolute',
    bottom: 0,
    left: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  quickAvatarOuter: {
    width: QUICK_AVATAR_SIZE,
    height: QUICK_AVATAR_SIZE,
    borderRadius: QUICK_AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  quickName: { width: QUICK_CONTACT_WIDTH, marginTop: 8, textAlign: 'center', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  onlineDotLarge: { position: 'absolute', right: 0, bottom: 7, width: 17, height: 17, borderRadius: 8.5, borderWidth: 3, backgroundColor: '#22C55E' },
  conversationList: { marginTop: 18 },
  conversationRow: { minHeight: 80, marginHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatarWrap: { width: LIST_AVATAR_SIZE, height: LIST_AVATAR_SIZE },
  onlineDot: { position: 'absolute', right: -1, bottom: 3, width: 16, height: 16, borderRadius: 8, borderWidth: 3, backgroundColor: '#22C55E' },
  muteBadge: {
    position: 'absolute',
    left: -3,
    bottom: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationMain: { flex: 1, minWidth: 0, gap: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  conversationName: { flexShrink: 1, fontSize: 17, lineHeight: 23, fontWeight: '700', letterSpacing: -0.2 },
  unreadName: { fontWeight: '900' },
  previewRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  conversationMessage: { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  unreadMessage: { fontWeight: '800' },
  mediaOnlyText: { fontWeight: '800' },
  groupSender: { maxWidth: 58, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  mediaThumbStack: { flexDirection: 'row', alignItems: 'center', paddingRight: 1 },
  mediaThumb: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaThumbOverlap: { marginLeft: -8 },
  mediaThumbImage: { width: '100%', height: '100%' },
  gifThumbText: { fontSize: 8, lineHeight: 10, fontWeight: '900' },
  mediaThumbOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
  },
  mediaThumbOverlayText: { color: '#FFFFFF', fontSize: 9, lineHeight: 11, fontWeight: '900' },
  trailing: { width: 70, alignItems: 'flex-end', gap: 9 },
  timeStatusRow: { minHeight: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  timeText: { fontSize: 12, lineHeight: 17, fontWeight: '600' },
  unreadDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#0B63FF' },
  unreadCount: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  unreadCountText: { color: '#FFFFFF', fontSize: 11, lineHeight: 14, fontWeight: '900' },
  identraAvatar: { alignItems: 'center', justifyContent: 'center' },
  initialAvatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { position: 'absolute', fontWeight: '900' },
  groupInitials: { color: '#FFFFFF', fontWeight: '900', letterSpacing: -0.5 },
  emptyState: { minHeight: 230, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 15, fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' },
  emptyDescription: { marginTop: 7, fontSize: 13, lineHeight: 19, fontWeight: '500', textAlign: 'center' },
  bottomMenu: {
    minHeight: 72,
    borderTopWidth: 1,
    paddingTop: 7,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bottomMenuItem: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'flex-start', gap: 2 },
  bottomMenuIcon: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center' },
  bottomMenuLabel: { fontSize: 11, lineHeight: 14, fontWeight: '600', textAlign: 'center' },
});
