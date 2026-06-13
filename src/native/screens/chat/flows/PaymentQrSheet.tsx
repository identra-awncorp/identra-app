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
import type { AppColors } from '../../../theme';
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
          <Share2 color="#FFFFFF" size={21} />
          <Text style={styles.shareText}>Chia sẻ QR</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, marginHorizontal: -12, marginTop: -14, marginBottom: Platform.OS === 'ios' ? -30 : -24 },
  header: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerShield: { marginLeft: 'auto' },
  title: { flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  description: { marginTop: 13, marginBottom: 22, fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '900' },
  providerRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  provider: { fontSize: 10.5, fontWeight: '600' },
  idRow: { minHeight: 25, flexDirection: 'row', alignItems: 'center', gap: 5 },
  id: { fontSize: 10, fontWeight: '600' },
  grow: { flex: 1, minWidth: 0 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  brandPrimary: { fontSize: 18, fontWeight: '900' },
  brandText: { fontSize: 18, fontWeight: '900' },
  divider: { height: 1, marginVertical: 13 },
  qrFrame: { alignSelf: 'center', borderWidth: 1, borderRadius: 14, padding: 11, alignItems: 'center', overflow: 'hidden' },
  qrLogo: { position: 'absolute', top: '41%', width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  qrBrandRow: { minHeight: 30, marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  qrBrandStrong: { fontSize: 12, fontWeight: '900' },
  qrBrandMuted: { fontSize: 11, fontWeight: '600' },
  info: { borderRadius: 12, marginTop: 12, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoText: { flex: 1, fontSize: 10.5, lineHeight: 16, fontWeight: '600' },
  fieldLabel: { marginTop: 20, marginBottom: 8, fontSize: 14, fontWeight: '900' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputText: { flex: 1, minHeight: 46, paddingVertical: 0, fontSize: 12, fontWeight: '600' },
  inputSuffix: { fontSize: 13, fontWeight: '800' },
  unitButton: { minHeight: 44, paddingLeft: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  picker: { borderWidth: 1, borderRadius: 12, marginTop: 6, overflow: 'hidden' },
  pickerOption: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: 13, fontWeight: '800' },
  counter: { fontSize: 10, fontWeight: '600' },
  fieldHint: { marginTop: 6, fontSize: 10, lineHeight: 15, fontWeight: '600' },
  setting: { minHeight: 62, borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingTitle: { fontSize: 12, fontWeight: '900' },
  settingDescription: { marginTop: 3, fontSize: 10, fontWeight: '600' },
  expiryPicker: { borderWidth: 1, borderRadius: 12, marginTop: 7, padding: 7, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  expiryOption: { minWidth: 62, minHeight: 44, borderWidth: 1, borderColor: 'transparent', borderRadius: 10, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  expiryOptionText: { fontSize: 11, fontWeight: '800' },
  warning: { borderRadius: 13, marginTop: 16, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  warningTitle: { fontSize: 12, fontWeight: '900' },
  warningText: { marginTop: 3, fontSize: 10.5, lineHeight: 16, fontWeight: '600' },
  footer: { borderTopWidth: 1, paddingHorizontal: 12, paddingTop: 10, flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, minHeight: 50, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, fontWeight: '900' },
  shareButton: { flex: 1.2, minHeight: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  shareText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
