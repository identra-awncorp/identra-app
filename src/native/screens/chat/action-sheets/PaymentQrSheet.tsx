import {
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCopy,
  Info,
  Share2,
  ShieldCheck,
  TimerReset,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { border, palette, radius, spacing, touchTarget, typography, type AppColors } from '../../../theme';
import { formatAmount, parseRawAmount, type PaymentUnit } from '../paymentUtils';

export function PaymentQrSheet({
  colors,
  onCancel,
  onShare,
}: {
  colors: AppColors;
  onCancel: () => void;
  onShare: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [rawAmount, setRawAmount] = useState(0);
  const [note, setNote] = useState('');
  const [paymentUnit, setPaymentUnit] = useState<PaymentUnit>('VND');
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [expiryPickerOpen, setExpiryPickerOpen] = useState(false);
  const qrSize = Math.min(230, Math.max(190, width - 120));
  const qrValue = JSON.stringify({
    type: 'idpay-payment',
    recipient: 'idpay:minhanh',
    amount: rawAmount || undefined,
    currency: paymentUnit,
    note: note || undefined,
    expiresInHours: expiryHours,
  });

  return (
    <View
      nativeID="screen-payment-qr"
      testID="screen-payment-qr"
      style={[styles.screen, { paddingTop: Math.max(10, insets.top) }]}
    >
      <View style={styles.header}>
        <Pressable accessibilityLabel="Đóng QR chuyển khoản" accessibilityRole="button" onPress={onCancel} style={styles.headerButton}>
          <X color={colors.text} size={27} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>QR chuyển khoản</Text>
        <View style={[styles.headerButton, styles.headerShield]}><ShieldCheck color={colors.primaryDark} size={25} /></View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Tạo mã QR để người khác quét và thanh toán qua IDPay.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.identityRow}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.avatarText, { color: colors.primaryDark }]}>MA</Text>
            </View>
            <View style={styles.grow}>
              <Text style={[styles.name, { color: colors.text }]}>Minh Anh</Text>
              <View style={styles.providerRow}>
                <Text style={[styles.provider, { color: colors.textSecondary }]}>IDPay by Identra</Text>
                <ShieldCheck color={colors.primaryDark} size={15} />
              </View>
              <Pressable accessibilityLabel="Sao chép IDPay" accessibilityRole="button" onPress={() => Alert.alert('Đã sao chép', 'idpay:minhanh')} style={styles.idRow}>
                <Text style={[styles.id, { color: colors.textSecondary }]}>idpay:minhanh</Text>
                <ClipboardCopy color={colors.textSecondary} size={15} />
              </Pressable>
            </View>
            <View style={styles.brand}>
              <ShieldCheck color={colors.primaryDark} size={27} />
              <Text style={[styles.brandPrimary, { color: colors.primaryDark }]}>ID</Text>
              <Text style={[styles.brandText, { color: colors.text }]}>Pay</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={[styles.qrFrame, { borderColor: colors.primaryDark }]}>
            <QRCode value={qrValue} size={qrSize} backgroundColor="#FFFFFF" color="#050505" ecl="H" />
            <View style={styles.qrLogo}><ShieldCheck color={colors.primaryDark} size={31} /></View>
            <View style={styles.qrBrandRow}>
              <ShieldCheck color={colors.primaryDark} size={17} />
              <Text style={[styles.qrBrandStrong, { color: colors.primaryDark }]}>IDPay</Text>
              <Text style={[styles.qrBrandMuted, { color: colors.textSecondary }]}>by Identra</Text>
            </View>
          </View>

          <View style={[styles.info, { backgroundColor: colors.surfaceMuted }]}>
            <Info color={colors.primaryDark} size={22} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              QR này dùng để nhận thanh toán qua IDPay. Có thể thanh toán bằng VND hoặc Plan A.
            </Text>
          </View>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Số tiền yêu cầu (tùy chọn)</Text>
        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CircleDollarSign color={colors.primaryDark} size={20} />
          <TextInput
            keyboardType="numeric"
            onChangeText={(value) => setRawAmount(parseRawAmount(value))}
            placeholder="Nhập số tiền"
            placeholderTextColor={colors.textSecondary}
            style={[styles.inputText, { color: colors.text }]}
            value={formatAmount(rawAmount)}
          />
          <Pressable accessibilityLabel="Chọn đơn vị thanh toán" accessibilityRole="button" onPress={() => setUnitPickerOpen((value) => !value)} style={styles.unitButton}>
            <Text style={[styles.inputSuffix, { color: colors.text }]}>{paymentUnit}</Text>
            <ChevronDown color={colors.text} size={18} />
          </Pressable>
        </View>
        {unitPickerOpen ? (
          <View style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {(['VND', 'Plan A'] as const).map((unit) => (
              <Pressable
                key={unit}
                accessibilityRole="button"
                onPress={() => {
                  setPaymentUnit(unit);
                  setUnitPickerOpen(false);
                }}
                style={[styles.pickerOption, unit === paymentUnit && { backgroundColor: colors.surfaceMuted }]}
              >
                <Text style={[styles.pickerText, { color: colors.text }]}>{unit}</Text>
                {unit === paymentUnit ? <Check color={colors.primaryDark} size={18} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
        <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>Để trống nếu bạn không muốn đặt số tiền cố định.</Text>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Nội dung chuyển khoản (tùy chọn)</Text>
        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Info color={colors.primaryDark} size={20} />
          <TextInput
            maxLength={100}
            onChangeText={setNote}
            placeholder="Nhập nội dung (ví dụ: Thanh toán vé Dune 2)"
            placeholderTextColor={colors.textSecondary}
            style={[styles.inputText, { color: colors.text }]}
            value={note}
          />
          <Text style={[styles.counter, { color: colors.textSecondary }]}>{note.length}/100</Text>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Cài đặt khác</Text>
        <Pressable accessibilityRole="button" onPress={() => setExpiryPickerOpen((value) => !value)} style={[styles.setting, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TimerReset color={colors.primaryDark} size={21} />
          <View style={styles.grow}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Thời hạn mã QR</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Mã QR sẽ hết hạn sau {expiryHours} giờ</Text>
          </View>
          <ChevronDown color={colors.textSecondary} size={19} />
        </Pressable>
        {expiryPickerOpen ? (
          <View style={[styles.expiryPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[1, 6, 12, 24, 48].map((hours) => (
              <Pressable
                key={hours}
                accessibilityRole="button"
                onPress={() => {
                  setExpiryHours(hours);
                  setExpiryPickerOpen(false);
                }}
                style={[styles.expiryOption, hours === expiryHours && { backgroundColor: colors.surfaceMuted, borderColor: colors.primaryDark }]}
              >
                <Text style={[styles.expiryOptionText, { color: hours === expiryHours ? colors.primaryDark : colors.text }]}>{hours} giờ</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={[styles.warning, { backgroundColor: colors.surfaceMuted }]}>
          <Info color={colors.primaryDark} size={22} />
          <View style={styles.grow}>
            <Text style={[styles.warningTitle, { color: colors.text }]}>Lưu ý</Text>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              Chỉ chia sẻ mã QR này với người bạn tin tưởng. Không chia sẻ công khai để tránh rủi ro.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(12, insets.bottom + 8) }]}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.cancelButton, { borderColor: colors.border }]}>
          <Text style={[styles.cancelText, { color: colors.text }]}>Hủy bỏ</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onShare} style={[styles.shareButton, { backgroundColor: colors.primaryDark }]}>
          <Share2 color={palette.white} size={21} />
          <Text style={styles.shareText}>Chia sẻ QR</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, marginHorizontal: -12, marginTop: -14, marginBottom: Platform.OS === 'ios' ? -30 : -24 },
  header: { minHeight: 56, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: touchTarget.minimum, height: touchTarget.minimum, alignItems: 'center', justifyContent: 'center' },
  headerShield: { marginLeft: 'auto' },
  title: { flex: 1, fontSize: typography.size.lg, fontWeight: typography.weight.black, textAlign: 'center' },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg - spacing.xs },
  description: { marginTop: spacing.sm + spacing.xs + 1, marginBottom: spacing.lg - spacing.xxs, fontSize: typography.size.xs, lineHeight: 18, fontWeight: typography.weight.semibold, textAlign: 'center' },
  card: { borderWidth: border.thin, borderRadius: radius.md + spacing.xs, padding: spacing.md - spacing.xxs },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.size.md + spacing.xxs, fontWeight: typography.weight.extraBold },
  name: { fontSize: typography.size.md, fontWeight: typography.weight.black },
  providerRow: { marginTop: spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  provider: { fontSize: typography.size.xs - 1.5, fontWeight: typography.weight.semibold },
  idRow: { minHeight: 25, flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 1 },
  id: { fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  grow: { flex: 1, minWidth: 0 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  brandPrimary: { fontSize: typography.size.md + spacing.xxs, fontWeight: typography.weight.black },
  brandText: { fontSize: typography.size.md + spacing.xxs, fontWeight: typography.weight.black },
  divider: { height: border.thin, marginVertical: spacing.sm + spacing.xs + 1 },
  qrFrame: { alignSelf: 'center', borderWidth: border.thin, borderRadius: radius.md + 2, padding: spacing.sm + 3, alignItems: 'center', overflow: 'hidden' },
  qrLogo: { position: 'absolute', top: '41%', width: 58, height: 58, borderRadius: radius.round, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' },
  qrBrandRow: { minHeight: 30, marginTop: spacing.xs + 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  qrBrandStrong: { fontSize: typography.size.xs, fontWeight: typography.weight.black },
  qrBrandMuted: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold },
  info: { borderRadius: radius.md, marginTop: spacing.sm + spacing.xs, padding: spacing.sm + 3, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 1 },
  infoText: { flex: 1, fontSize: typography.size.xs - 1.5, lineHeight: 16, fontWeight: typography.weight.semibold },
  fieldLabel: { marginTop: spacing.lg - spacing.xs, marginBottom: spacing.sm, fontSize: typography.size.sm, fontWeight: typography.weight.black },
  input: { minHeight: 50, borderWidth: border.thin, borderRadius: radius.md, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inputText: { flex: 1, minHeight: 46, paddingVertical: 0, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  inputSuffix: { fontSize: typography.size.xs + 1, fontWeight: typography.weight.extraBold },
  unitButton: { minHeight: touchTarget.minimum, paddingLeft: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 1 },
  picker: { borderWidth: border.thin, borderRadius: radius.md, marginTop: spacing.sm - spacing.xxs, overflow: 'hidden' },
  pickerOption: { minHeight: 48, paddingHorizontal: spacing.md - spacing.xxs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: typography.size.xs + 1, fontWeight: typography.weight.extraBold },
  counter: { fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  fieldHint: { marginTop: spacing.sm - spacing.xxs, fontSize: typography.size.xs - 2, lineHeight: 15, fontWeight: typography.weight.semibold },
  setting: { minHeight: 62, borderWidth: border.thin, borderRadius: radius.md + 1, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  settingTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.black },
  settingDescription: { marginTop: spacing.xxs + 1, fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  expiryPicker: { borderWidth: border.thin, borderRadius: radius.md, marginTop: spacing.sm - 1, padding: spacing.sm - 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm - 1 },
  expiryOption: { minWidth: 62, minHeight: touchTarget.minimum, borderWidth: border.thin, borderColor: 'transparent', borderRadius: radius.sm + 2, paddingHorizontal: spacing.sm + spacing.xxs, alignItems: 'center', justifyContent: 'center' },
  expiryOptionText: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.extraBold },
  warning: { borderRadius: radius.md + 1, marginTop: spacing.md, padding: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm + spacing.xxs },
  warningTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.black },
  warningText: { marginTop: spacing.xxs + 1, fontSize: typography.size.xs - 1.5, lineHeight: 16, fontWeight: typography.weight.semibold },
  footer: { borderTopWidth: border.thin, paddingHorizontal: spacing.sm + spacing.xs, paddingTop: spacing.sm + spacing.xxs, flexDirection: 'row', gap: spacing.sm + spacing.xxs },
  cancelButton: { flex: 1, minHeight: 50, borderWidth: border.thin, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  shareButton: { flex: 1.2, minHeight: 50, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  shareText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black },
});
