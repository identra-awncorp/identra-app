import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
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
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Reanimated, { Extrapolation, interpolate, useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../../components/ui';
import type { AppColors } from '../../theme';

const avatar = require('../../../assets/images/student_avatar_png_1781051105999.png');
const QUICK_ACTIONS_HEIGHT = 49;

export function ChatConversation({
  colors,
  onBack,
  onOpenActionSheet,
}: {
  colors: AppColors;
  onBack: () => void;
  onOpenActionSheet: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [messageInputFocused, setMessageInputFocused] = useState(false);
  const keyboard = useAnimatedKeyboard();
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
        <IconButton label="Quay lại" colors={colors} onPress={onBack}>
          <ArrowLeft color={colors.text} size={25} />
        </IconButton>
        <Image source={avatar} style={styles.headerAvatar} />
        <View style={styles.headerMain}>
          <Text style={[styles.headerName, { color: colors.text }]}>Minh Anh</Text>
          <View style={styles.verifiedRow}>
            <ShieldCheck color={colors.success} fill={colors.success} size={15} />
            <Text style={[styles.verifiedText, { color: colors.success }]}>Kết nối SSI đã xác minh</Text>
          </View>
        </View>
        <View style={[styles.headerShield, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={25} />
        </View>
        <IconButton label="Tùy chọn cuộc trò chuyện" colors={colors}>
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
        <IncomingMessage colors={colors} text="Chào bạn, mình muốn mua vé xem phim Dune 2 suất 20:00 tối nay." time="10:30" />
        <OutgoingMessage
          colors={colors}
          text="Mình còn 1 vé. Mình sẽ gửi thực chứng vé và hợp đồng để giao dịch an toàn."
          time="10:32"
        />
        <View style={styles.outgoingWrap}>
          <CredentialMessage colors={colors} />
          <MessageTime colors={colors} time="10:33" outgoing />
        </View>
        <IncomingMessage colors={colors} text="Cảm ơn bạn! Gửi mình hợp đồng nhé." time="10:34" />
        <View style={styles.outgoingWrap}>
          <ContractMessage colors={colors} />
          <MessageTime colors={colors} time="10:35" outgoing />
        </View>
        {noticeVisible ? (
          <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
            <ShieldCheck color={colors.primaryDark} size={27} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              Thực chứng và khoản thanh toán sẽ được xử lý theo hợp đồng thông minh để giảm rủi ro lừa đảo.
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Đóng cảnh báo" onPress={() => setNoticeVisible(false)} style={styles.noticeClose}>
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
            <QuickChatAction colors={colors} icon={ShieldCheck} label="Thực chứng" />
            <QuickChatAction colors={colors} icon={FileCheck2} label="Hợp đồng" />
            <QuickChatAction colors={colors} icon={CircleDollarSign} label="Thanh toán" success />
          </View>
        </Reanimated.View>
        <View style={styles.composerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Thêm nội dung" onPress={onOpenActionSheet} style={[styles.roundButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Plus color={colors.primaryDark} size={25} />
          </Pressable>
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              placeholder="Nhắn tin hoặc gửi thực chứng..."
              placeholderTextColor={colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              onBlur={() => setMessageInputFocused(false)}
              onFocus={() => setMessageInputFocused(true)}
              style={[styles.input, { color: colors.text }]}
            />
            <Smile color={colors.primaryDark} size={24} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Gửi ảnh" style={[styles.roundButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ImageIcon color={colors.primaryDark} size={23} />
          </Pressable>
        </View>
      </Reanimated.View>
    </>
  );
}

function IncomingMessage({ colors, text, time }: { colors: AppColors; text: string; time: string }) {
  return (
    <View style={styles.incomingRow}>
      <Image source={avatar} style={styles.messageAvatar} />
      <View style={styles.incomingMain}>
        <View style={[styles.incomingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.messageText, { color: colors.text }]}>{text}</Text>
        </View>
        <MessageTime colors={colors} time={time} />
      </View>
    </View>
  );
}

function OutgoingMessage({ colors, text, time }: { colors: AppColors; text: string; time: string }) {
  return (
    <View style={styles.outgoingWrap}>
      <View style={[styles.outgoingBubble, { backgroundColor: colors.surfaceMuted, borderColor: '#BFD1FF' }]}>
        <Text style={[styles.messageText, { color: colors.text }]}>{text}</Text>
      </View>
      <MessageTime colors={colors} time={time} outgoing />
    </View>
  );
}

function MessageTime({ colors, time, outgoing = false }: { colors: AppColors; time: string; outgoing?: boolean }) {
  return (
    <View style={[styles.timeRow, outgoing && styles.timeRowOutgoing]}>
      <Text style={[styles.timeText, { color: colors.textSecondary }]}>{time}</Text>
      {outgoing ? <CheckCheck color={colors.primaryDark} size={15} /> : null}
    </View>
  );
}

function CredentialMessage({ colors }: { colors: AppColors }) {
  return (
    <View style={[styles.richCard, { backgroundColor: colors.surface, borderColor: '#BFD1FF' }]}>
      <View style={styles.richHeader}>
        <View style={styles.ticketIcon}><Ticket color="#FFFFFF" size={25} /></View>
        <View style={styles.richHeaderMain}>
          <Text style={[styles.richTitle, { color: colors.text }]}>Thực chứng vé xem phim</Text>
          <Text style={[styles.richSubtitle, { color: colors.textSecondary }]}>CGV Vincom</Text>
        </View>
        <View style={[styles.miniVerified, { backgroundColor: colors.surfaceMuted }]}><ShieldCheck color={colors.success} fill={colors.success} size={17} /></View>
      </View>
      <View style={[styles.ticketDetails, { borderColor: colors.border }]}>
        <DetailRow colors={colors} icon={Ticket} label="Phim:" value="Dune 2" />
        <DetailRow colors={colors} icon={Clock3} label="Suất chiếu:" value="20:00, 22/06/2024" />
        <DetailRow colors={colors} icon={MapPin} label="Ghế:" value="A12" />
      </View>
      <Pressable accessibilityRole="button" onPress={() => Alert.alert('Thực chứng vé xem phim', 'Thực chứng đã được xác minh bởi CGV Vincom.')} style={[styles.richFooter, { borderTopColor: colors.border }]}>
        <View style={styles.verifiedRow}><Check color={colors.success} size={15} /><Text style={[styles.verifiedText, { color: colors.success }]}>Đã xác minh</Text></View>
        <Text style={[styles.richLink, { color: colors.primaryDark }]}>Xem thực chứng</Text>
        <ChevronRight color={colors.primaryDark} size={18} />
      </Pressable>
    </View>
  );
}

function ContractMessage({ colors }: { colors: AppColors }) {
  return (
    <View style={[styles.contractCard, { backgroundColor: colors.surface, borderColor: '#BFD1FF' }]}>
      <View style={styles.contractHeader}>
        <View style={[styles.contractIcon, { backgroundColor: colors.surfaceMuted }]}><FileCheck2 color={colors.primaryDark} size={22} /></View>
        <Text style={[styles.contractTitle, { color: colors.text }]}>Hợp đồng trao đổi an toàn</Text>
        <View style={styles.pendingPill}><Clock3 color="#F57900" size={13} /><Text style={styles.pendingText}>Đang chờ phản hồi</Text></View>
      </View>
      <View style={[styles.exchangeBox, { borderColor: colors.border }]}>
        <View style={styles.exchangeColumn}>
          <Text style={[styles.exchangeLabel, { color: colors.textSecondary }]}>Vật phẩm giao dịch</Text>
          <View style={styles.exchangeValueRow}><Ticket color={colors.primaryDark} size={20} /><Text style={[styles.exchangeValue, { color: colors.text }]}>Thực chứng vé xem phim Dune 2</Text></View>
        </View>
        <View style={[styles.exchangeColumn, styles.exchangeDivider, { borderLeftColor: colors.border }]}>
          <Text style={[styles.exchangeLabel, { color: colors.textSecondary }]}>Đối ứng</Text>
          <View style={styles.exchangeValueRow}><CircleDollarSign color={colors.success} size={22} /><Text style={[styles.exchangeValue, { color: colors.text }]}>450.000 VND</Text></View>
        </View>
        <View style={[styles.paymentRow, { borderTopColor: colors.border }]}><CircleDollarSign color={colors.textSecondary} size={17} /><Text style={[styles.paymentText, { color: colors.textSecondary }]}>Thanh toán: Tiền pháp định hoặc USDT</Text></View>
      </View>
      <View style={styles.contractInfo}><Info color={colors.primaryDark} size={15} /><Text style={[styles.contractInfoText, { color: colors.textSecondary }]}>Hợp đồng chỉ thực thi khi cả hai bên chấp nhận.</Text></View>
      <View style={styles.contractActions}>
        <Pressable style={[styles.contractSecondary, { borderColor: colors.primaryDark }]}><Text style={[styles.contractButtonText, { color: colors.primaryDark }]}>Từ chối</Text></Pressable>
        <Pressable style={[styles.contractPrimary, { backgroundColor: colors.primaryDark }]}><Text style={styles.contractPrimaryText}>Trao đổi</Text></Pressable>
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
  header: { minHeight: 72, borderBottomWidth: 1, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerAvatar: { width: 48, height: 48, borderRadius: 24 },
  headerMain: { flex: 1, minWidth: 0 },
  headerName: { fontSize: 20, fontWeight: '900' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { fontSize: 11, fontWeight: '800' },
  headerShield: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  conversationScroll: { flex: 1 },
  conversation: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 18, gap: 9 },
  incomingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, maxWidth: '72%' },
  messageAvatar: { width: 34, height: 34, borderRadius: 17 },
  incomingMain: { flex: 1, minWidth: 0 },
  incomingBubble: { borderWidth: 1, borderRadius: 16, borderTopLeftRadius: 5, paddingHorizontal: 13, paddingVertical: 10 },
  outgoingWrap: { alignSelf: 'flex-end', width: '82%' },
  outgoingBubble: { borderWidth: 1, borderRadius: 16, borderTopRightRadius: 5, paddingHorizontal: 13, paddingVertical: 11 },
  messageText: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  timeRow: { marginTop: 4, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeRowOutgoing: { justifyContent: 'flex-end' },
  timeText: { fontSize: 10, fontWeight: '600' },
  richCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  richHeader: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ticketIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#075CF6', alignItems: 'center', justifyContent: 'center' },
  richHeaderMain: { flex: 1 },
  richTitle: { fontSize: 14, fontWeight: '900' },
  richSubtitle: { marginTop: 3, fontSize: 11, fontWeight: '600' },
  miniVerified: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  ticketDetails: { marginHorizontal: 12, borderWidth: 1, borderBottomWidth: 0, borderTopLeftRadius: 13, borderTopRightRadius: 13, padding: 10, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  detailLabel: { width: 73, fontSize: 11, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 11, fontWeight: '800' },
  richFooter: { minHeight: 42, borderTopWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  richLink: { marginLeft: 'auto', fontSize: 11, fontWeight: '800' },
  contractCard: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 10 },
  contractHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contractIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  contractTitle: { flex: 1, fontSize: 13, fontWeight: '900' },
  pendingPill: { minHeight: 28, borderRadius: 14, paddingHorizontal: 8, backgroundColor: '#FFF3E8', flexDirection: 'row', alignItems: 'center', gap: 4 },
  pendingText: { color: '#F57900', fontSize: 8.5, fontWeight: '800' },
  exchangeBox: { borderWidth: 1, borderRadius: 13, flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' },
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
  contractPrimaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  notice: { marginHorizontal: 34, borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeText: { flex: 1, fontSize: 10.5, lineHeight: 16, fontWeight: '600' },
  noticeClose: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  composerArea: { borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 7 },
  quickActionsClip: { height: QUICK_ACTIONS_HEIGHT, marginBottom: 7, overflow: 'hidden' },
  quickActions: { borderRadius: 17, height: 42, padding: 4, flexDirection: 'row', gap: 5 },
  quickAction: { flex: 1, minHeight: 38, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  quickActionText: { fontSize: 10.5, fontWeight: '800' },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  roundButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flex: 1, minHeight: 44, borderRadius: 22, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 42, fontSize: 12 },
});
