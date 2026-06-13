import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCopy,
  Eye,
  EyeOff,
  Fingerprint,
  Info,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRef, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppColors } from '../../../theme';
import { formatAmount, IDPAY_BALANCES, parseRawAmount, type PaymentUnit, type TransferDraft } from '../paymentUtils';

const avatar = require('../../../../assets/images/student_avatar_png_1781051105999.png');

export function DirectTransferSheet({
  colors,
  initialTransfer,
  onCancel,
  onTransfer,
}: {
  colors: AppColors;
  initialTransfer: TransferDraft | null;
  onCancel: () => void;
  onTransfer: (amount: number, unit: PaymentUnit, note: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [rawAmount, setRawAmount] = useState(initialTransfer?.amount ?? 0);
  const [note, setNote] = useState(initialTransfer?.note ?? '');
  const [paymentUnit, setPaymentUnit] = useState<PaymentUnit>(initialTransfer?.unit ?? 'VND');
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [balancesVisible, setBalancesVisible] = useState(false);

  const submitTransfer = () => {
    if (rawAmount <= 0) {
      Alert.alert('Chưa nhập số tiền', 'Vui lòng nhập số tiền bạn muốn chuyển cho Minh Anh.');
      return;
    }
    if (rawAmount > IDPAY_BALANCES[paymentUnit]) {
      Alert.alert('Số dư không đủ', `Số tiền chuyển vượt quá số dư ${paymentUnit} hiện có của bạn.`);
      return;
    }
    onTransfer(rawAmount, paymentUnit, note);
  };

  return (
    <View
      nativeID="screen-direct-transfer"
      testID="screen-direct-transfer"
      style={[styles.screen, { paddingTop: Math.max(10, insets.top) }]}
    >
      <SheetHeader colors={colors} label="Đóng chuyển khoản" onClose={onCancel} title="Chuyển khoản" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Chuyển tiền trực tiếp cho đối tác trò chuyện qua IDPay.
        </Text>

        <View style={[styles.recipientCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.recipientHeading, { color: colors.text }]}>Người nhận</Text>
          <View style={styles.recipientMain}>
            <Image source={avatar} style={styles.recipientAvatar} />
            <View style={styles.grow}>
              <Text style={[styles.recipientName, { color: colors.text }]}>Minh Anh</Text>
              <VerifiedIdentity colors={colors} />
              <Pressable
                accessibilityLabel="Sao chép IDPay người nhận"
                accessibilityRole="button"
                onPress={() => Alert.alert('Đã sao chép', 'idpay:minhanh')}
                style={styles.recipientIdRow}
              >
                <Text style={[styles.recipientId, { color: colors.textSecondary }]}>idpay:minhanh</Text>
                <ClipboardCopy color={colors.textSecondary} size={16} />
              </Pressable>
            </View>
            <IdPayBrand colors={colors} />
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceTitle, { color: colors.text }]}>Số dư ví IDPay</Text>
            <Pressable
              accessibilityLabel={balancesVisible ? 'Ẩn số dư' : 'Hiển thị số dư'}
              accessibilityRole="button"
              onPress={() => setBalancesVisible((value) => !value)}
              style={styles.balanceEyeButton}
            >
              {balancesVisible ? <EyeOff color={colors.primaryDark} size={20} /> : <Eye color={colors.primaryDark} size={20} />}
            </Pressable>
          </View>
          <View style={styles.balanceColumns}>
            <View style={styles.balanceColumn}>
              <View style={[styles.balanceAssetIcon, { backgroundColor: colors.surfaceMuted }]}>
                <CircleDollarSign color={colors.primaryDark} size={20} />
              </View>
              <View style={styles.grow}>
                <Text style={[styles.balanceAssetName, { color: colors.textSecondary }]}>VND</Text>
                <Text style={[styles.balanceAmount, { color: colors.text }]}>
                  {balancesVisible ? `${formatAmount(IDPAY_BALANCES.VND)} VND` : '********'}
                </Text>
              </View>
            </View>
            <View style={[styles.balanceColumn, styles.balanceColumnDivider, { borderLeftColor: colors.border }]}>
              <View style={styles.planAIcon}><Text style={styles.planAIconText}>A</Text></View>
              <View style={styles.grow}>
                <Text style={[styles.balanceAssetName, { color: colors.textSecondary }]}>Plan A</Text>
                <Text style={[styles.balanceAmount, { color: colors.text }]}>
                  {balancesVisible ? `${formatAmount(IDPAY_BALANCES['Plan A'])} Plan A` : '********'}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.balanceHintRow, { borderTopColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <Info color={colors.textSecondary} size={14} />
            <Text style={[styles.balanceHintText, { color: colors.textSecondary }]}>Nhấn vào biểu tượng mắt để hiển thị số dư</Text>
          </View>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Số tiền</Text>
        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            keyboardType="numeric"
            onChangeText={(value) => setRawAmount(parseRawAmount(value))}
            placeholder="Nhập số tiền"
            placeholderTextColor={colors.textSecondary}
            style={[styles.inputText, { color: colors.text }]}
            value={formatAmount(rawAmount)}
          />
          <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
          <Pressable
            accessibilityLabel="Chọn đơn vị chuyển khoản"
            accessibilityRole="button"
            onPress={() => setUnitPickerOpen((value) => !value)}
            style={styles.unitButton}
          >
            <Text style={[styles.unitText, { color: colors.text }]}>{paymentUnit}</Text>
            <ChevronDown color={colors.text} size={19} />
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
        <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>Nhập số tiền bạn muốn chuyển cho Minh Anh.</Text>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Nội dung chuyển khoản (tùy chọn)</Text>
        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            maxLength={100}
            onChangeText={setNote}
            placeholder="Nhập nội dung chuyển khoản"
            placeholderTextColor={colors.textSecondary}
            style={[styles.inputText, { color: colors.text }]}
            value={note}
          />
          <Text style={[styles.counter, { color: colors.textSecondary }]}>{note.length}/100</Text>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.surfaceMuted, borderColor: '#BFD1FF' }]}>
          <View style={[styles.noticeIcon, { borderColor: '#BFD1FF' }]}><ShieldCheck color={colors.primaryDark} size={25} /></View>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Khoản chuyển sẽ được gửi qua IDPay.{'\n'}Hãy kiểm tra đúng người nhận và số tiền trước khi xác nhận.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(12, insets.bottom + 8) }]}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.cancelButton, { borderColor: colors.border }]}>
          <Text style={[styles.cancelText, { color: colors.text }]}>Hủy bỏ</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={submitTransfer} style={[styles.submitButton, { backgroundColor: colors.primaryDark }]}>
          <CircleDollarSign color="#FFFFFF" size={23} />
          <Text style={styles.submitText}>Chuyển khoản</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function TransferConfirmationSheet({
  colors,
  note,
  onBack,
  onCancel,
  onConfirm,
  rawAmount,
  unit,
}: {
  colors: AppColors;
  note: string;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  rawAmount: number;
  unit: PaymentUnit;
}) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [biometricVerified, setBiometricVerified] = useState(false);
  const pinInputRef = useRef<TextInput>(null);

  const authenticate = async () => {
    const supported = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!supported || !enrolled) {
      Alert.alert('Sinh trắc học chưa sẵn sàng', 'Hãy nhập mã bảo mật để xác nhận giao dịch.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Xác nhận chuyển khoản',
      cancelLabel: 'Hủy',
      fallbackLabel: 'Dùng mã PIN hệ thống',
    });
    if (result.success) setBiometricVerified(true);
  };

  const confirm = () => {
    if (pin.length !== 6 && !biometricVerified) {
      Alert.alert('Chưa xác thực', 'Nhập đủ mã bảo mật 6 số hoặc sử dụng sinh trắc học.');
      return;
    }
    onConfirm();
  };

  return (
    <View
      nativeID="screen-transfer-confirmation"
      testID="screen-transfer-confirmation"
      style={[styles.screen, { paddingTop: Math.max(10, insets.top) }]}
    >
      <View style={styles.header}>
        <Pressable accessibilityLabel="Quay lại màn hình chuyển khoản" accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
          <ArrowLeft color={colors.text} size={27} />
        </Pressable>
        <Text style={[styles.confirmTitle, { color: colors.text }]}>Xác nhận chuyển khoản</Text>
        <View style={[styles.headerButton, styles.headerShield]}><ShieldCheck color={colors.primaryDark} size={25} /></View>
      </View>

      <ScrollView contentContainerStyle={styles.confirmContent} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[styles.confirmDescription, { color: colors.textSecondary }]}>
          Nhập mã bảo mật hoặc dùng sinh trắc học để hoàn tất giao dịch.
        </Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryIdentity}>
            <Image source={avatar} style={styles.summaryAvatar} />
            <View style={styles.grow}>
              <Text style={[styles.summaryName, { color: colors.text }]}>Minh Anh</Text>
              <VerifiedIdentity colors={colors} />
              <View style={styles.recipientIdRow}>
                <Text style={[styles.recipientId, { color: colors.textSecondary }]}>idpay:minhanh</Text>
                <ClipboardCopy color={colors.textSecondary} size={16} />
              </View>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.surfaceMuted }]}><WalletCards color={colors.primaryDark} size={22} /></View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Số tiền chuyển</Text>
            <Text style={[styles.summaryAmount, { color: colors.text }]}>{formatAmount(rawAmount)} {unit}</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.surfaceMuted }]}><Info color={colors.primaryDark} size={22} /></View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Nội dung</Text>
            <Text numberOfLines={2} style={[styles.summaryNote, { color: colors.text }]}>{note || 'Chuyển khoản trong chat'}</Text>
          </View>
        </View>

        <Text style={[styles.pinTitle, { color: colors.text }]}>Mã bảo mật</Text>
        <Pressable accessibilityLabel="Nhập mã bảo mật" accessibilityRole="button" onPress={() => pinInputRef.current?.focus()} style={styles.pinBoxes}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinBox,
                {
                  borderColor: index === pin.length && pin.length < 6 ? colors.primaryDark : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text style={[styles.pinDot, { color: colors.textSecondary }]}>{index < pin.length ? '•' : index === pin.length ? '|' : ''}</Text>
            </View>
          ))}
          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => setPin(value.replace(/\D/g, ''))}
            ref={pinInputRef}
            style={styles.hiddenPinInput}
            value={pin}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={authenticate}
          style={[styles.biometricButton, { backgroundColor: colors.surface, borderColor: biometricVerified ? colors.success : colors.border }]}
        >
          <View style={[styles.biometricIcon, { backgroundColor: colors.surfaceMuted }]}><Fingerprint color={biometricVerified ? colors.success : colors.primaryDark} size={27} /></View>
          <Text style={[styles.biometricText, { color: biometricVerified ? colors.success : colors.primaryDark }]}>
            {biometricVerified ? 'Đã xác thực sinh trắc học' : 'Sử dụng sinh trắc học'}
          </Text>
        </Pressable>

        <View style={[styles.confirmNotice, { backgroundColor: colors.surfaceMuted, borderColor: '#BFD1FF' }]}>
          <Info color={colors.primaryDark} size={24} />
          <Text style={[styles.confirmNoticeText, { color: colors.text }]}>
            Giao dịch sẽ được xác nhận sau khi mã bảo mật hoặc sinh trắc học hợp lệ.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.confirmFooter, { backgroundColor: colors.surface, paddingBottom: Math.max(12, insets.bottom + 8) }]}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.confirmCancelButton, { borderColor: colors.border }]}>
          <Text style={[styles.confirmCancelText, { color: colors.text }]}>Hủy giao dịch</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={confirm}
          style={[styles.confirmSubmitButton, { backgroundColor: pin.length === 6 || biometricVerified ? colors.primaryDark : colors.primary }]}
        >
          <Text style={styles.confirmSubmitText}>Xác nhận</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SheetHeader({ colors, label, onClose, title }: { colors: AppColors; label: string; onClose: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onClose} style={styles.headerButton}>
        <X color={colors.text} size={27} />
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={[styles.headerButton, styles.headerShield]}><ShieldCheck color={colors.primaryDark} size={25} /></View>
    </View>
  );
}

function VerifiedIdentity({ colors }: { colors: AppColors }) {
  return (
    <View style={styles.verifiedRow}>
      <ShieldCheck color={colors.success} fill={colors.success} size={17} />
      <Text style={[styles.verifiedText, { color: colors.success }]}>IDPay đã kích hoạt</Text>
    </View>
  );
}

function IdPayBrand({ colors }: { colors: AppColors }) {
  return (
    <View style={styles.idPayBrand}>
      <ShieldCheck color={colors.primaryDark} size={28} />
      <Text style={[styles.idPayBrandPrimary, { color: colors.primaryDark }]}>ID</Text>
      <Text style={[styles.idPayBrandText, { color: colors.text }]}>Pay</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, marginHorizontal: -12, marginTop: -14, marginBottom: Platform.OS === 'ios' ? -30 : -24 },
  header: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerShield: { marginLeft: 'auto' },
  title: { flex: 1, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  description: { marginTop: 16, marginBottom: 22, fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center' },
  recipientCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  recipientHeading: { fontSize: 16, fontWeight: '900', marginBottom: 15 },
  recipientMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recipientAvatar: { width: 62, height: 62, borderRadius: 31 },
  recipientName: { fontSize: 17, fontWeight: '900' },
  verifiedRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { fontSize: 11, fontWeight: '700' },
  recipientIdRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 7 },
  recipientId: { fontSize: 11, fontWeight: '600' },
  grow: { flex: 1, minWidth: 0 },
  idPayBrand: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  idPayBrandPrimary: { fontSize: 18, fontWeight: '900' },
  idPayBrandText: { fontSize: 18, fontWeight: '900' },
  balanceCard: { borderWidth: 1, borderRadius: 14, marginTop: 20, overflow: 'hidden' },
  balanceHeader: { minHeight: 45, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center' },
  balanceTitle: { flex: 1, fontSize: 12, fontWeight: '900' },
  balanceEyeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  balanceColumns: { minHeight: 70, paddingVertical: 10, flexDirection: 'row' },
  balanceColumn: { flex: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  balanceColumnDivider: { borderLeftWidth: 1 },
  balanceAssetIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  planAIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E7F8EC', alignItems: 'center', justifyContent: 'center' },
  planAIconText: { color: '#28A745', fontSize: 19, fontWeight: '900' },
  balanceAssetName: { fontSize: 10, fontWeight: '700' },
  balanceAmount: { marginTop: 4, fontSize: 10.5, fontWeight: '900' },
  balanceHintRow: { minHeight: 34, borderTopWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceHintText: { fontSize: 9, fontWeight: '600' },
  fieldLabel: { marginTop: 23, marginBottom: 9, fontSize: 15, fontWeight: '900' },
  input: { minHeight: 58, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  inputText: { flex: 1, minHeight: 54, paddingVertical: 0, fontSize: 14, fontWeight: '600' },
  inputDivider: { width: 1, height: 28, marginHorizontal: 12 },
  unitButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitText: { fontSize: 13, fontWeight: '800' },
  picker: { borderWidth: 1, borderRadius: 12, marginTop: 6, overflow: 'hidden' },
  pickerOption: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: 12, fontWeight: '800' },
  fieldHint: { marginTop: 7, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  counter: { fontSize: 10, fontWeight: '600' },
  notice: { borderWidth: 1, borderRadius: 14, marginTop: 25, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeIcon: { width: 42, height: 42, borderWidth: 1, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 18, fontWeight: '600' },
  footer: { borderTopWidth: 1, paddingHorizontal: 12, paddingTop: 10, flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 15, fontWeight: '900' },
  submitButton: { flex: 1.1, minHeight: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  confirmTitle: { flex: 1, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  confirmContent: { paddingHorizontal: 16, paddingBottom: 24 },
  confirmDescription: { marginTop: 16, marginBottom: 20, fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center' },
  summaryCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  summaryIdentity: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  summaryAvatar: { width: 68, height: 68, borderRadius: 34 },
  summaryName: { fontSize: 20, fontWeight: '900' },
  divider: { height: 1, marginVertical: 13 },
  summaryRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { flex: 1, fontSize: 12, fontWeight: '600' },
  summaryAmount: { maxWidth: '48%', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  summaryNote: { maxWidth: '48%', fontSize: 12, lineHeight: 17, fontWeight: '700', textAlign: 'right' },
  pinTitle: { marginTop: 24, marginBottom: 12, fontSize: 16, fontWeight: '900' },
  pinBoxes: { position: 'relative', flexDirection: 'row', justifyContent: 'space-between', gap: 7 },
  pinBox: { flex: 1, maxWidth: 52, aspectRatio: 0.88, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pinDot: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  hiddenPinInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  biometricButton: { minHeight: 70, borderWidth: 1, borderRadius: 15, marginTop: 22, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13 },
  biometricIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  biometricText: { fontSize: 15, fontWeight: '900' },
  confirmNotice: { borderWidth: 1, borderRadius: 14, marginTop: 22, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  confirmNoticeText: { flex: 1, fontSize: 12, lineHeight: 19, fontWeight: '600' },
  confirmFooter: { paddingHorizontal: 12, paddingTop: 10, flexDirection: 'row', gap: 10 },
  confirmCancelButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmCancelText: { fontSize: 14, fontWeight: '900' },
  confirmSubmitButton: { flex: 1, minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmSubmitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
