import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  ImageIcon,
  Info,
  MapPin,
  MoreVertical,
  Plus,
  ShieldCheck,
  Smile,
  Ticket,
  X,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ImageStyle, StyleProp } from 'react-native';
import Reanimated, { Extrapolation, interpolate, useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assetManifest } from '../../assets/assetManifest';
import { AppLogo } from '../../components/AppLogo';
import { IconButton } from '../../components/AppUiPrimitives';
import { mediaPreviewImage } from '../../data/demo/chatDemoData';
import { useI18n } from '../../i18n';
import type {
  ChatMediaPreview,
  ChatMessage,
  ChatThread,
  ContractChatPayload,
  CredentialChatPayload,
  DeliveryStatus,
} from '../../data/demo/chatDemoData';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, typography } from '../../theme';

const QUICK_ACTIONS_HEIGHT = 49;
const verifiedBadgeIcon = assetManifest.badges.verified;

export function ChatConversation({
  colors,
  thread,
  onBack,
  onOpenActionSheet,
}: {
  colors: AppColors;
  thread: ChatThread;
  onBack: () => void;
  onOpenActionSheet: () => void;
}) {
  const { locale, t } = useI18n();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [messageInputFocused, setMessageInputFocused] = useState(false);
  const keyboard = useAnimatedKeyboard();
  const contactVerified = Boolean(thread.verified || thread.subtitle.toLocaleLowerCase(locale).includes(t('chat.conversation.verifiedKeyword').toLocaleLowerCase(locale)));
  useEffect(() => {
    setNoticeVisible(true);
  }, [thread.id]);

  const composerKeyboardStyle = useAnimatedStyle(() => {
    const keyboardProgress = interpolate(keyboard.height.value, [0, 160], [0, 1], Extrapolation.CLAMP);
    return {
      paddingBottom: Math.max(8, insets.bottom + 8 - keyboard.height.value),
      transform: [{ translateY: -(keyboard.height.value * keyboardProgress) }],
    };
  });
  const quickActionsKeyboardStyle = useAnimatedStyle(() => {
    const keyboardProgress = interpolate(keyboard.height.value, [0, 160], [0, 1], Extrapolation.CLAMP);
    return {
      height: QUICK_ACTIONS_HEIGHT * (1 - keyboardProgress),
      marginBottom: 7 * (1 - keyboardProgress),
      opacity: 1 - keyboardProgress,
      transform: [{ translateY: 16 * keyboardProgress }],
    };
  });

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <IconButton label={t('chat.conversation.back')} colors={colors} onPress={onBack}>
          <ArrowLeft color={colors.text} size={25} />
        </IconButton>
        <ThreadAvatar colors={colors} thread={thread} size={42} style={styles.headerAvatar} />
        <View style={styles.headerMain}>
          <View style={styles.headerNameRow}>
            <Text numberOfLines={1} style={[styles.headerName, { color: colors.text }]}>{thread.name}</Text>
            {contactVerified ? <VerifiedBadgeIcon size={20} /> : null}
          </View>
          <View style={styles.verifiedRow}>
            <ShieldCheck color={colors.success} fill={colors.success} size={15} />
            <Text numberOfLines={1} style={[styles.verifiedText, { color: colors.success }]}>{thread.subtitle}</Text>
          </View>
        </View>
        <View style={[styles.headerShield, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={25} />
        </View>
        <IconButton label={t('chat.conversation.options')} colors={colors}>
          <MoreVertical color={colors.text} size={24} />
        </IconButton>
      </View>

      <ScrollView
        style={styles.conversationScroll}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.conversation}
      >
        {thread.messages.map((item) => (
          <ChatMessageItem key={item.id} colors={colors} message={item} thread={thread} />
        ))}
        {thread.notice && noticeVisible ? (
          <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
            <ShieldCheck color={colors.primaryDark} size={27} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              {thread.notice}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('chat.conversation.closeNotice')} onPress={() => setNoticeVisible(false)} style={styles.noticeClose}>
              <X color={colors.textSecondary} size={20} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <Reanimated.View
        style={[styles.composerArea, { backgroundColor: colors.background, borderTopColor: colors.border }, composerKeyboardStyle]}
      >
        <Reanimated.View
          pointerEvents={messageInputFocused ? 'none' : 'auto'}
          style={[styles.quickActionsClip, quickActionsKeyboardStyle]}
        >
          <View style={[styles.quickActions, { backgroundColor: colors.surfaceMuted }]}>
            <QuickChatAction colors={colors} icon={ShieldCheck} label={t('chat.conversation.quickCredential')} />
            <QuickChatAction colors={colors} icon={FileCheck2} label={t('chat.conversation.quickContract')} />
            <QuickChatAction colors={colors} icon={CircleDollarSign} label={t('chat.conversation.quickPayment')} success />
          </View>
        </Reanimated.View>
        <View style={styles.composerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('chat.conversation.addContent')} onPress={onOpenActionSheet} style={[styles.roundButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Plus color={colors.primaryDark} size={25} />
          </Pressable>
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              placeholder={t('chat.conversation.messagePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              onBlur={() => setMessageInputFocused(false)}
              onFocus={() => setMessageInputFocused(true)}
              style={[styles.input, { color: colors.text }]}
            />
            <Smile color={colors.primaryDark} size={24} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t('chat.conversation.sendImage')} style={[styles.roundButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ImageIcon color={colors.primaryDark} size={23} />
          </Pressable>
        </View>
      </Reanimated.View>
    </>
  );
}

function VerifiedBadgeIcon({ size = 20 }: { size?: number }) {
  return <Image source={verifiedBadgeIcon} style={{ width: size, height: size }} resizeMode="contain" />;
}

function ChatMessageItem({
  colors,
  message,
  thread,
}: {
  colors: AppColors;
  message: ChatMessage;
  thread: ChatThread;
}) {
  if (message.type === 'text') {
    return message.direction === 'incoming' ? (
      <IncomingMessage colors={colors} text={message.text} time={message.time} thread={thread} senderName={message.senderName} />
    ) : (
      <OutgoingMessage colors={colors} text={message.text} time={message.time} deliveryStatus={message.deliveryStatus} />
    );
  }

  if (message.type === 'media') {
    return <MediaMessage colors={colors} message={message} thread={thread} />;
  }

  if (message.type === 'credential') {
    return (
      <View style={styles.outgoingWrap}>
        <CredentialMessage colors={colors} credential={message.credential} />
        <MessageTime colors={colors} time={message.time} outgoing deliveryStatus={message.deliveryStatus} />
      </View>
    );
  }

  return (
    <View style={styles.outgoingWrap}>
      <ContractMessage colors={colors} contract={message.contract} />
      <MessageTime colors={colors} time={message.time} outgoing deliveryStatus={message.deliveryStatus} />
    </View>
  );
}

function ThreadAvatar({
  colors,
  thread,
  size,
  style,
}: {
  colors: AppColors;
  thread: ChatThread;
  size: number;
  style?: StyleProp<ImageStyle>;
}) {
  if (thread.avatarSource) {
    return <Image source={thread.avatarSource} style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
  }

  if (thread.avatar === 'identra') {
    return (
      <View
        style={[
          styles.fallbackAvatar,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceMuted },
          style,
        ]}
      >
        <AppLogo size={Math.floor(size * 0.62)} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallbackAvatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceMuted },
        style,
      ]}
    >
      <Text style={[styles.fallbackAvatarText, { color: colors.primaryDark, fontSize: Math.max(12, size * 0.32) }]}>
        {thread.initials ?? thread.name.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

function IncomingMessage({
  colors,
  text,
  time,
  thread,
  senderName,
}: {
  colors: AppColors;
  text: string;
  time: string;
  thread: ChatThread;
  senderName?: string;
}) {
  return (
    <View style={styles.incomingRow}>
      <ThreadAvatar colors={colors} thread={thread} size={34} style={styles.messageAvatar} />
      <View style={styles.incomingMain}>
        {senderName ? <Text style={[styles.senderName, { color: colors.textSecondary }]}>{senderName}</Text> : null}
        <View style={[styles.incomingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.messageText, { color: colors.text }]}>{text}</Text>
        </View>
        <MessageTime colors={colors} time={time} />
      </View>
    </View>
  );
}

function OutgoingMessage({
  colors,
  text,
  time,
  deliveryStatus,
}: {
  colors: AppColors;
  text: string;
  time: string;
  deliveryStatus?: DeliveryStatus;
}) {
  return (
    <View style={styles.outgoingWrap}>
      <View style={[styles.outgoingBubble, { backgroundColor: colors.surfaceMuted, borderColor: '#BFD1FF' }]}>
        <Text style={[styles.messageText, { color: colors.text }]}>{text}</Text>
      </View>
      <MessageTime colors={colors} time={time} outgoing deliveryStatus={deliveryStatus} />
    </View>
  );
}

function MediaMessage({
  colors,
  message,
  thread,
}: {
  colors: AppColors;
  message: Extract<ChatMessage, { type: 'media' }>;
  thread: ChatThread;
}) {
  const { t } = useI18n();
  const content = (
    <View style={[styles.mediaBubble, { backgroundColor: message.direction === 'outgoing' ? colors.surfaceMuted : colors.surface, borderColor: message.direction === 'outgoing' ? '#BFD1FF' : colors.border }]}>
      <MediaPreview colors={colors} media={message.media} />
      <Text numberOfLines={2} style={[styles.mediaMessageText, { color: message.media.type === 'photo' && !message.text ? colors.primaryDark : colors.text }]}>
        {message.text || getMediaLabel(message.media, t)}
      </Text>
    </View>
  );

  if (message.direction === 'incoming') {
    return (
      <View style={styles.incomingRow}>
        <ThreadAvatar colors={colors} thread={thread} size={34} style={styles.messageAvatar} />
        <View style={styles.incomingMain}>
          {message.senderName ? <Text style={[styles.senderName, { color: colors.textSecondary }]}>{message.senderName}</Text> : null}
          {content}
          <MessageTime colors={colors} time={message.time} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outgoingWrap}>
      {content}
      <MessageTime colors={colors} time={message.time} outgoing deliveryStatus={message.deliveryStatus} />
    </View>
  );
}

function MediaPreview({ colors, media }: { colors: AppColors; media: ChatMediaPreview }) {
  const count = Math.min(media.count ?? 1, 4);
  const overflowCount = Math.max((media.count ?? 1) - count, 0);

  return (
    <View style={styles.mediaPreviewStack}>
      {Array.from({ length: count }).map((_, index) => {
        const showOverflow = index === count - 1 && overflowCount > 0;
        return (
          <View
            key={`${media.type}-${index}`}
            style={[
              styles.mediaPreviewThumb,
              index > 0 && styles.mediaPreviewOverlap,
              { backgroundColor: media.type === 'file' ? colors.surfaceMuted : '#EAF2FF', borderColor: colors.surface },
            ]}
          >
            {media.type === 'photo' ? (
              <Image source={mediaPreviewImage} style={styles.mediaPreviewImage} />
            ) : media.type === 'gif' ? (
              <Text style={[styles.gifPreviewText, { color: colors.primaryDark }]}>GIF</Text>
            ) : (
              <FileText color={colors.primaryDark} size={20} strokeWidth={2} />
            )}
            {showOverflow ? (
              <View style={styles.mediaPreviewOverlay}>
                <Text style={styles.mediaPreviewOverlayText}>+{overflowCount}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function MessageTime({
  colors,
  time,
  outgoing = false,
  deliveryStatus,
}: {
  colors: AppColors;
  time: string;
  outgoing?: boolean;
  deliveryStatus?: DeliveryStatus;
}) {
  return (
    <View style={[styles.timeRow, outgoing && styles.timeRowOutgoing]}>
      <Text style={[styles.timeText, { color: colors.textSecondary }]}>{time}</Text>
      {outgoing && deliveryStatus ? <DeliveryStatusIcon colors={colors} status={deliveryStatus} /> : null}
    </View>
  );
}

function DeliveryStatusIcon({ colors, status }: { colors: AppColors; status: DeliveryStatus }) {
  if (status === 'pending') return <Clock3 color="#F59E0B" size={14} strokeWidth={2.2} />;
  if (status === 'seen') return <CheckCheck color={colors.primaryDark} size={15} strokeWidth={2.2} />;
  return <Check color={colors.textSecondary} size={14} strokeWidth={2.2} />;
}

function getMediaLabel(media: ChatMediaPreview, t: ReturnType<typeof useI18n>['t']) {
  if (media.type === 'photo') return t('chat.common.mediaPhoto');
  if (media.type === 'gif') return 'GIF';
  return media.fileName ?? t('chat.common.mediaFile');
}

function CredentialMessage({ colors, credential }: { colors: AppColors; credential: CredentialChatPayload }) {
  const { t } = useI18n();
  return (
    <View style={[styles.richCard, { backgroundColor: colors.surface, borderColor: '#BFD1FF' }]}>
      <View style={styles.richHeader}>
        <View style={styles.ticketIcon}><Ticket color="#FFFFFF" size={25} /></View>
        <View style={styles.richHeaderMain}>
          <Text style={[styles.richTitle, { color: colors.text }]}>{credential.title}</Text>
          <Text style={[styles.richSubtitle, { color: colors.textSecondary }]}>{credential.issuer}</Text>
        </View>
        <View style={[styles.miniVerified, { backgroundColor: colors.surfaceMuted }]}><ShieldCheck color={colors.success} fill={colors.success} size={17} /></View>
      </View>
      <View style={[styles.ticketDetails, { borderColor: colors.border }]}>
        {credential.details.map((item) => (
          <DetailRow key={`${item.label}-${item.value}`} colors={colors} icon={detailIconMap[item.icon]} label={item.label} value={item.value} />
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => Alert.alert(credential.title, t('chat.conversation.credentialVerifiedBy', { issuer: credential.issuer }))} style={[styles.richFooter, { borderTopColor: colors.border }]}>
        <View style={styles.verifiedRow}><Check color={colors.success} size={15} /><Text style={[styles.verifiedText, { color: colors.success }]}>{t('chat.common.verified')}</Text></View>
        <Text style={[styles.richLink, { color: colors.primaryDark }]}>{t('chat.common.viewCredential')}</Text>
        <ChevronRight color={colors.primaryDark} size={18} />
      </Pressable>
    </View>
  );
}

const detailIconMap = {
  ticket: Ticket,
  clock: Clock3,
  map: MapPin,
};

function ContractMessage({ colors, contract }: { colors: AppColors; contract: ContractChatPayload }) {
  const { t } = useI18n();
  return (
    <View style={[styles.contractCard, { backgroundColor: colors.surface, borderColor: '#BFD1FF' }]}>
      <View style={styles.contractHeader}>
        <View style={[styles.contractIcon, { backgroundColor: colors.surfaceMuted }]}><FileCheck2 color={colors.primaryDark} size={22} /></View>
        <Text style={[styles.contractTitle, { color: colors.text }]}>{contract.title}</Text>
        <View style={styles.pendingPill}><Clock3 color="#F57900" size={13} /><Text style={styles.pendingText}>{contract.status}</Text></View>
      </View>
      <View style={[styles.exchangeBox, { borderColor: colors.border }]}>
        <View style={styles.exchangeColumn}>
          <Text style={[styles.exchangeLabel, { color: colors.textSecondary }]}>{t('chat.common.tradeItem')}</Text>
          <View style={styles.exchangeValueRow}><Ticket color={colors.primaryDark} size={20} /><Text style={[styles.exchangeValue, { color: colors.text }]}>{contract.asset}</Text></View>
        </View>
        <View style={[styles.exchangeColumn, styles.exchangeDivider, { borderLeftColor: colors.border }]}>
          <Text style={[styles.exchangeLabel, { color: colors.textSecondary }]}>{t('chat.common.counterItem')}</Text>
          <View style={styles.exchangeValueRow}><CircleDollarSign color={colors.success} size={22} /><Text style={[styles.exchangeValue, { color: colors.text }]}>{contract.amount}</Text></View>
        </View>
        <View style={[styles.paymentRow, { borderTopColor: colors.border }]}><CircleDollarSign color={colors.textSecondary} size={17} /><Text style={[styles.paymentText, { color: colors.textSecondary }]}>{t('chat.common.payment')}: {t('chat.common.fiatOrUsdt')}</Text></View>
      </View>
      <View style={styles.contractInfo}><Info color={colors.primaryDark} size={15} /><Text style={[styles.contractInfoText, { color: colors.textSecondary }]}>{t('chat.common.contractExecutionNotice')}</Text></View>
      <View style={styles.contractActions}>
        <Pressable style={[styles.contractSecondary, { borderColor: colors.primaryDark }]}><Text style={[styles.contractButtonText, { color: colors.primaryDark }]}>{t('chat.common.reject')}</Text></Pressable>
        <Pressable style={[styles.contractPrimary, { backgroundColor: colors.primaryDark }]}><Text style={styles.contractPrimaryText}>{t('chat.common.exchange')}</Text></Pressable>
      </View>
    </View>
  );
}

function DetailRow({ colors, icon: Icon, label, value }: { colors: AppColors; icon: typeof Ticket; label: string; value: string }) {
  return <View style={styles.detailRow}><Icon color={colors.primaryDark} size={17} /><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text><Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text></View>;
}

function QuickChatAction({ colors, icon: Icon, label, success }: { colors: AppColors; icon: typeof ShieldCheck; label: string; success?: boolean }) {
  return (
    <Pressable style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon color={success ? colors.success : colors.primaryDark} size={18} />
      <Text style={[styles.quickActionText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 66, borderBottomWidth: border.thin, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm - 1 },
  headerAvatar: { width: 38, height: 38, borderRadius: 21 },
  headerMain: { flex: 1, minWidth: 0 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerName: { flexShrink: 1, fontSize: typography.size.md, lineHeight: typography.lineHeight.sm, fontWeight: typography.weight.black },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { fontSize: 11, fontWeight: typography.weight.extraBold },
  headerShield: { width: 38, height: 38, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  conversationScroll: { flex: 1 },
  conversation: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 18, gap: 9 },
  incomingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, maxWidth: '72%' },
  messageAvatar: { width: 34, height: 34, borderRadius: 17 },
  incomingMain: { flex: 1, minWidth: 0 },
  senderName: { marginBottom: 3, paddingHorizontal: 4, fontSize: 10, lineHeight: 13, fontWeight: '800' },
  incomingBubble: { borderWidth: border.thin, borderRadius: radius.lg, borderTopLeftRadius: 5, paddingHorizontal: 13, paddingVertical: 10 },
  outgoingWrap: { alignSelf: 'flex-end', width: '82%' },
  outgoingBubble: { borderWidth: border.thin, borderRadius: radius.lg, borderTopRightRadius: 5, paddingHorizontal: 13, paddingVertical: 11 },
  messageText: { fontSize: 13, lineHeight: 19, fontWeight: typography.weight.medium },
  fallbackAvatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fallbackAvatarText: { fontWeight: typography.weight.black },
  mediaBubble: { borderWidth: border.thin, borderRadius: radius.lg, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  mediaMessageText: { flex: 1, fontSize: typography.size.xs, lineHeight: 17, fontWeight: typography.weight.extraBold },
  mediaPreviewStack: { flexDirection: 'row', alignItems: 'center', paddingRight: 2 },
  mediaPreviewThumb: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaPreviewOverlap: { marginLeft: -14 },
  mediaPreviewImage: { width: '100%', height: '100%' },
  gifPreviewText: { fontSize: 11, lineHeight: 13, fontWeight: '900' },
  mediaPreviewOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.56)',
  },
  mediaPreviewOverlayText: { color: palette.white, fontSize: 11, lineHeight: 13, fontWeight: typography.weight.black },
  timeRow: { marginTop: 4, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeRowOutgoing: { justifyContent: 'flex-end' },
  timeText: { fontSize: 10, fontWeight: typography.weight.semibold },
  richCard: { borderWidth: border.thin, borderRadius: radius.lg, overflow: 'hidden' },
  richHeader: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ticketIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#075CF6', alignItems: 'center', justifyContent: 'center' },
  richHeaderMain: { flex: 1 },
  richTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  richSubtitle: { marginTop: 3, fontSize: 11, fontWeight: typography.weight.semibold },
  miniVerified: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  ticketDetails: { marginHorizontal: spacing.md, borderWidth: border.thin, borderBottomWidth: 0, borderTopLeftRadius: 13, borderTopRightRadius: 13, padding: 10, gap: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  detailLabel: { width: 73, fontSize: 11, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 11, fontWeight: '800' },
  richFooter: { minHeight: 42, borderTopWidth: border.thin, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center' },
  richLink: { marginLeft: 'auto', fontSize: 11, fontWeight: typography.weight.extraBold },
  contractCard: { borderWidth: border.thin, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm + spacing.xxs },
  contractHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contractIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  contractTitle: { flex: 1, fontSize: 13, fontWeight: '900' },
  pendingPill: { minHeight: 28, borderRadius: radius.md + 2, paddingHorizontal: spacing.sm, backgroundColor: palette.orange[100], flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pendingText: { color: palette.orange[500], fontSize: 8.5, fontWeight: typography.weight.extraBold },
  exchangeBox: { borderWidth: border.thin, borderRadius: radius.md + 1, flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' },
  exchangeColumn: { width: '50%', padding: 10, gap: 7 },
  exchangeDivider: { borderLeftWidth: 1 },
  exchangeLabel: { fontSize: 9.5, fontWeight: '600' },
  exchangeValueRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  exchangeValue: { flex: 1, fontSize: 10.5, lineHeight: 15, fontWeight: '800' },
  paymentRow: { width: '100%', minHeight: 38, borderTopWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  paymentText: { fontSize: 9.5, fontWeight: '600' },
  contractInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contractInfoText: { flex: 1, fontSize: 9.5, lineHeight: 14, fontWeight: '600' },
  contractActions: { flexDirection: 'row', gap: 8 },
  contractSecondary: { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  contractPrimary: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  contractButtonText: { fontSize: 12, fontWeight: '900' },
  contractPrimaryText: { color: palette.white, fontSize: typography.size.xs, fontWeight: typography.weight.black },
  notice: { marginHorizontal: 34, borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeText: { flex: 1, fontSize: 10.5, lineHeight: 16, fontWeight: '600' },
  noticeClose: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  composerArea: { borderTopWidth: border.thin, paddingHorizontal: 10, paddingTop: 7 },
  quickActionsClip: { height: QUICK_ACTIONS_HEIGHT, marginBottom: 7, overflow: 'hidden' },
  quickActions: { borderRadius: 17, height: 42, padding: 4, flexDirection: 'row', gap: 5 },
  quickAction: { flex: 1, minHeight: 38, borderWidth: border.thin, borderRadius: radius.lg - 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs + spacing.xxs },
  quickActionText: { fontSize: 10.5, fontWeight: typography.weight.extraBold },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  roundButton: { width: 44, height: 44, borderRadius: 22, borderWidth: border.thin, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flex: 1, minHeight: 44, borderRadius: 22, borderWidth: border.thin, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, minHeight: 42, fontSize: 12 },
});
