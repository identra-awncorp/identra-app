import {
  ArrowLeftRight,
  CalendarClock,
  CreditCard,
  FilePlus2,
  QrCode,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppColors } from '../../theme';

export function ChatActionMenu({
  colors,
  onOpenBankAccount,
  onOpenContract,
  onOpenPaymentQr,
  onOpenReminder,
  onOpenTransfer,
  onShareCredential,
}: {
  colors: AppColors;
  onOpenBankAccount: () => void;
  onOpenContract: () => void;
  onOpenPaymentQr: () => void;
  onOpenReminder: () => void;
  onOpenTransfer: () => void;
  onShareCredential: () => void;
}) {
  return (
    <View style={styles.grid}>
      <ActionItem colors={colors} description="Tạo hợp đồng thông minh" icon={FilePlus2} onPress={onOpenContract} title="Hợp đồng" />
      <ActionItem colors={colors} description="Hiển thị mã thanh toán" icon={QrCode} onPress={onOpenPaymentQr} title="QR chuyển khoản" />
      <ActionItem colors={colors} description="Gửi tiền pháp định hoặc crypto" icon={ArrowLeftRight} onPress={onOpenTransfer} title="Chuyển khoản" />
      <ActionItem colors={colors} description="Tạo lịch hẹn trong chat" icon={CalendarClock} onPress={onOpenReminder} title="Nhắc hẹn" />
      <ActionItem colors={colors} description="Chia sẻ thông tin nhận tiền" icon={CreditCard} onPress={onOpenBankAccount} title="Gửi số tài khoản" />
      <ActionItem colors={colors} description="Gửi thực chứng từ ví của bạn" icon={ShieldCheck} onPress={onShareCredential} title="Chia sẻ thực chứng" />
    </View>
  );
}

function ActionItem({
  colors,
  description,
  icon: Icon,
  onPress,
  title,
}: {
  colors: AppColors;
  description: string;
  icon: typeof ShieldCheck;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon color={colors.primaryDark} size={38} strokeWidth={1.8} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { alignContent: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' },
  item: { alignItems: 'center', minHeight: 190, paddingHorizontal: 5, width: '33.333%' },
  itemPressed: { opacity: 0.65 },
  icon: { alignItems: 'center', borderRadius: 17, borderWidth: 1, height: 76, justifyContent: 'center', marginBottom: 10, width: 76 },
  title: { fontSize: 14, fontWeight: '800', lineHeight: 19, textAlign: 'center' },
  description: { fontSize: 12, lineHeight: 17, marginTop: 2, maxWidth: 105, textAlign: 'center' },
});
