import { Check, ChevronDown, ChevronRight, Plus, QrCode, Search, ShieldCheck, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { border, palette, radius, spacing, touchTarget, typography, type AppColors } from '../../../theme';

const BANK_ACCOUNTS = [
  { id: 'tcb', bank: 'Techcombank', number: '1903 1234 5678 9012', owner: 'Nguyễn Văn A' },
  { id: 'vcb', bank: 'Vietcombank', number: '0721 9876 5432 1098', owner: 'Nguyễn Văn A' },
  { id: 'acb', bank: 'ACB', number: '1234 5678 9012 3456', owner: 'Nguyễn Văn A' },
  { id: 'mb', bank: 'MB Bank', number: '5555 6666 7777 8888', owner: 'Nguyễn Văn A' },
] as const;
type BankId = (typeof BANK_ACCOUNTS)[number]['id'];

export function AddBankAccountSheet({
  colors,
  onBack,
  onSave,
}: {
  colors: AppColors;
  onBack: () => void;
  onSave: (bank: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [bankId, setBankId] = useState<BankId>('tcb');
  const [accountNumber, setAccountNumber] = useState('');
  const [owner, setOwner] = useState('');
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const selectedBank = BANK_ACCOUNTS.find((account) => account.id === bankId)!;

  const save = () => {
    if (!accountNumber || !owner.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản.');
      return;
    }
    onSave(selectedBank.bank);
  };

  return (
    <View
      nativeID="screen-add-bank-account"
      testID="screen-add-bank-account"
      style={[styles.screen, { paddingTop: Math.max(10, insets.top) }]}
    >
      <SheetHeader colors={colors} label="Quay lại danh sách tài khoản" onClose={onBack} title="Thêm số tài khoản" />

      <ScrollView
        contentContainerStyle={styles.addContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, styles.addScreenDescription, { color: colors.textSecondary }]}>
          Thêm tài khoản ngân hàng để lưu và chia sẻ nhanh trong cuộc trò chuyện.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nhập từ mã QR có sẵn</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Tải ảnh mã QR', 'Chọn ảnh QR ngân hàng từ thư viện để điền nhanh thông tin tài khoản.')}
          style={[styles.qrUploadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.qrUploadIcon, { borderColor: colors.border }]}><QrCode color={colors.primaryDark} size={40} /></View>
          <View style={styles.grow}>
            <Text style={[styles.qrUploadTitle, { color: colors.text }]}>Tải ảnh mã QR</Text>
            <Text style={[styles.qrUploadDescription, { color: colors.textSecondary }]}>Tải ảnh lên để điền nhanh thông tin tài khoản</Text>
          </View>
          <View style={[styles.qrUploadButton, { borderColor: colors.border }]}>
            <Text style={[styles.qrUploadButtonText, { color: colors.primaryDark }]}>Tải lên</Text>
            <ChevronRight color={colors.textSecondary} size={18} />
          </View>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nhập thủ công</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Chọn ngân hàng</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setBankPickerOpen((value) => !value)}
          style={[styles.bankSelect, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.bankSelectIdentity}>
            <BankLogo bankId={bankId} />
            <Text style={[styles.bankSelectText, { color: colors.text }]}>{selectedBank.bank}</Text>
          </View>
          <ChevronDown color={colors.textSecondary} size={20} />
        </Pressable>
        {bankPickerOpen ? (
          <View style={[styles.bankPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {BANK_ACCOUNTS.map((bank) => (
              <Pressable
                key={bank.id}
                accessibilityRole="button"
                onPress={() => {
                  setBankId(bank.id);
                  setBankPickerOpen(false);
                }}
                style={[styles.bankPickerOption, bank.id === bankId && { backgroundColor: colors.surfaceMuted }]}
              >
                <View style={styles.bankPickerLogo}><BankLogo bankId={bank.id} /></View>
                <Text style={[styles.bankPickerName, { color: colors.text }]}>{bank.bank}</Text>
                {bank.id === bankId ? <Check color={colors.primaryDark} size={18} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Chọn nhanh</Text>
        <View style={styles.bankQuickGrid}>
          {BANK_ACCOUNTS.map((bank) => (
            <Pressable
              key={bank.id}
              accessibilityRole="button"
              onPress={() => setBankId(bank.id)}
              style={[styles.bankQuickCard, { backgroundColor: colors.surface, borderColor: bank.id === bankId ? colors.primaryDark : colors.border }]}
            >
              <BankLogo bankId={bank.id} />
              <Text numberOfLines={1} style={[styles.bankQuickName, { color: colors.text }]}>{bank.bank}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Số tài khoản</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => setAccountNumber(value.replace(/\D/g, ''))}
          placeholder="Nhập số tài khoản"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={accountNumber}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Chủ tài khoản</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setOwner}
          placeholder="Nhập tên chủ tài khoản"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={owner}
        />

        <SafetyNotice addAccount colors={colors}>
          Tài khoản này sẽ được lưu trong ví IDPay của bạn để có thể chia sẻ nhanh khi cần.
        </SafetyNotice>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(12, insets.bottom + 8) }]}>
        <Pressable accessibilityRole="button" onPress={onBack} style={[styles.cancelButton, { borderColor: colors.primaryDark }]}>
          <Text style={[styles.cancelText, { color: colors.primaryDark }]}>Hủy bỏ</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={save} style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.primaryText}>Lưu tài khoản</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function BankAccountSheet({
  colors,
  onAdd,
  onCancel,
  onShare,
}: {
  colors: AppColors;
  onAdd: () => void;
  onCancel: () => void;
  onShare: (bank: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('tcb');
  const accounts = BANK_ACCOUNTS.filter((account) =>
    `${account.bank} ${account.number}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')),
  );

  const share = () => {
    const selected = BANK_ACCOUNTS.find((account) => account.id === selectedId);
    if (!selected) {
      Alert.alert('Chưa chọn tài khoản', 'Vui lòng chọn tài khoản ngân hàng muốn chia sẻ.');
      return;
    }
    onShare(selected.bank);
  };

  return (
    <View
      nativeID="screen-send-bank-account"
      testID="screen-send-bank-account"
      style={[styles.screen, { paddingTop: Math.max(10, insets.top) }]}
    >
      <SheetHeader colors={colors} label="Đóng gửi số tài khoản" onClose={onCancel} title="Gửi số tài khoản" />

      <ScrollView
        contentContainerStyle={styles.accountContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Chọn tài khoản ngân hàng đã lưu để chia sẻ cho đối tác trò chuyện.
        </Text>
        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search color={colors.textSecondary} size={23} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Tìm theo ngân hàng"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={query}
          />
        </View>

        <Text style={[styles.savedLabel, { color: colors.textSecondary }]}>Đã lưu {BANK_ACCOUNTS.length} tài khoản</Text>
        <View style={styles.list}>
          {accounts.map((account) => {
            const selected = account.id === selectedId;
            return (
              <Pressable
                key={account.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setSelectedId(account.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selected ? colors.primaryDark : colors.border,
                  },
                ]}
              >
                <View style={[styles.logo, { borderColor: colors.border }]}>
                  <BankLogo bankId={account.id} />
                </View>
                <View style={styles.grow}>
                  <Text style={[styles.bankName, { color: colors.text }]}>{account.bank}</Text>
                  <Text style={[styles.bankNumber, { color: colors.text }]}>{account.number}</Text>
                  <Text style={[styles.bankOwner, { color: colors.textSecondary }]}>{account.owner}</Text>
                </View>
                <View style={[styles.radio, { borderColor: selected ? colors.primaryDark : colors.textSecondary }]}>
                  {selected ? <View style={[styles.radioInner, { backgroundColor: colors.primaryDark }]} /> : null}
                </View>
              </Pressable>
            );
          })}
          {!accounts.length ? (
            <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không tìm thấy tài khoản phù hợp.</Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onAdd}
            style={[styles.addAccount, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.addIcon, { borderColor: colors.border }]}>
              <Plus color={colors.primaryDark} size={25} />
            </View>
            <View style={styles.grow}>
              <Text style={[styles.addTitle, { color: colors.text }]}>Thêm số tài khoản</Text>
              <Text style={[styles.addDescription, { color: colors.textSecondary }]}>Liên kết thêm tài khoản ngân hàng mới</Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={21} />
          </Pressable>
        </View>

        <SafetyNotice colors={colors}>
          Thông tin này sẽ được gửi trong cuộc trò chuyện để đối tác có thể chuyển khoản cho bạn an toàn và chính xác.
        </SafetyNotice>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(12, insets.bottom + 8) }]}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.cancelButton, { borderColor: colors.border }]}>
          <Text style={[styles.cancelText, { color: colors.primaryDark }]}>Hủy bỏ</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={share} style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.primaryText}>Chia sẻ</Text>
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
      <View style={[styles.headerButton, styles.headerShield]}>
        <ShieldCheck color={colors.primaryDark} size={25} />
      </View>
    </View>
  );
}

function SafetyNotice({ addAccount = false, children, colors }: { addAccount?: boolean; children: string; colors: AppColors }) {
  return (
    <View style={[styles.safetyNotice, { backgroundColor: colors.surfaceMuted, borderColor: colors.secondary, marginTop: addAccount ? 22 : spacing.md }]}>
      <View style={[styles.safetyIcon, { borderColor: colors.secondary }]}><ShieldCheck color={colors.primaryDark} size={25} /></View>
      <Text style={[styles.safetyText, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );
}

function BankLogo({ bankId }: { bankId: BankId }) {
  if (bankId === 'tcb') {
    return (
      <Svg height="48" viewBox="0 0 64 48" width="64">
        <Polygon fill="#ED1B2F" points="4,24 20,8 36,24 20,40" />
        <Polygon fill="#ED1B2F" points="28,24 44,8 60,24 44,40" />
        <Polygon fill="#FFFFFF" points="20,24 28,16 36,24 28,32" />
      </Svg>
    );
  }
  if (bankId === 'vcb') {
    return (
      <Svg height="50" viewBox="0 0 64 52" width="64">
        <Path d="M5 12C15 4 49 4 59 12C53 31 43 44 32 48C21 44 11 31 5 12Z" fill="#008A45" />
        <Path d="M18 16C25 13 39 13 46 16C42 27 37 34 32 37C27 34 22 27 18 16Z" fill="#FFFFFF" />
        <Path d="M9 12C20 8 44 8 55 12" fill="none" stroke="#73B933" strokeWidth="4" />
      </Svg>
    );
  }
  if (bankId === 'acb') {
    return (
      <Svg height="42" viewBox="0 0 70 42" width="70">
        <Path d="M2 36L14 5H24L36 36H26L24 30H13L11 36H2ZM16 22H21L18.5 14L16 22Z" fill="#0757C9" />
        <Path d="M51 6C41 6 34 12 34 21C34 30 41 36 51 36C55 36 59 35 62 32V23H52V28H56V30C54 31 52 31 50 31C44 31 40 27 40 21C40 15 44 11 51 11C55 11 58 12 61 15L65 10C61 7 56 6 51 6Z" fill="#0757C9" />
        <Path d="M46 12C51 12 55 16 55 21C55 26 51 30 46 30C41 30 37 26 37 21C37 16 41 12 46 12Z" fill="#22A9E0" />
      </Svg>
    );
  }
  return (
    <Svg height="52" viewBox="0 0 64 52" width="64">
      <Polygon fill="#E72C45" points="32,2 37,17 52,10 43,23 60,27 43,31 52,44 37,37 32,52 27,37 12,44 21,31 4,27 21,23 12,10 27,17" />
      <Path d="M23 19L32 27L41 19" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="5" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, marginHorizontal: -12, marginTop: -14, marginBottom: Platform.OS === 'ios' ? -30 : -24 },
  header: { minHeight: 56, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: touchTarget.minimum, height: touchTarget.minimum, alignItems: 'center', justifyContent: 'center' },
  headerShield: { marginLeft: 'auto' },
  title: { flex: 1, fontSize: typography.size.xl - 2, fontWeight: typography.weight.black, textAlign: 'center' },
  addContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  accountContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  description: { marginTop: spacing.md - 1, marginBottom: spacing.lg - spacing.xs, fontSize: typography.size.xs, lineHeight: 18, fontWeight: typography.weight.semibold, textAlign: 'center' },
  addScreenDescription: { marginBottom: spacing.lg - spacing.xxs },
  sectionTitle: { marginTop: spacing.md + spacing.xxs, marginBottom: spacing.sm + spacing.xxs, fontSize: typography.size.sm + 1, fontWeight: typography.weight.black },
  qrUploadCard: { minHeight: 96, borderWidth: border.thin, borderRadius: radius.md + 2, padding: typography.size.xs + 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xs },
  qrUploadIcon: { width: 60, height: 60, borderWidth: border.thin, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  qrUploadTitle: { fontSize: typography.size.xs + 1, fontWeight: typography.weight.black },
  qrUploadDescription: { marginTop: spacing.xs + 1, fontSize: typography.size.xs - 2, lineHeight: 15, fontWeight: typography.weight.semibold },
  qrUploadButton: { minHeight: touchTarget.minimum, borderWidth: border.thin, borderRadius: radius.sm + 2, paddingHorizontal: spacing.sm + 3, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  qrUploadButtonText: { fontSize: typography.size.xs, fontWeight: typography.weight.black },
  label: { marginTop: spacing.md - spacing.xxs, marginBottom: spacing.sm - 1, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  bankSelect: { minHeight: 56, borderWidth: border.thin, borderRadius: radius.md, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bankSelectIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs, overflow: 'hidden' },
  bankSelectText: { flex: 1, fontSize: typography.size.xs + 1, fontWeight: typography.weight.extraBold },
  bankPicker: { borderWidth: border.thin, borderRadius: radius.md, marginTop: spacing.sm - spacing.xxs, overflow: 'hidden' },
  bankPickerOption: { minHeight: 58, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  bankPickerLogo: { width: 55, alignItems: 'center' },
  bankPickerName: { flex: 1, fontSize: typography.size.xs, fontWeight: typography.weight.extraBold },
  bankQuickGrid: { flexDirection: 'row', gap: spacing.sm - 1 },
  bankQuickCard: { flex: 1, minWidth: 0, minHeight: 98, borderWidth: border.thin, borderRadius: radius.md, paddingHorizontal: spacing.xs, alignItems: 'center', justifyContent: 'center', gap: spacing.sm - 1 },
  bankQuickName: { maxWidth: '100%', fontSize: typography.size.xs - 2.5, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  input: { minHeight: 56, borderWidth: border.thin, borderRadius: radius.md, paddingHorizontal: spacing.md - spacing.xxs, fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },
  search: { minHeight: 54, borderWidth: border.thin, borderRadius: radius.md + 1, paddingHorizontal: spacing.md - spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  searchInput: { flex: 1, minHeight: 50, paddingVertical: 0, fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },
  savedLabel: { marginTop: spacing.lg - spacing.xxs, marginBottom: spacing.sm + spacing.xxs, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  list: { gap: spacing.sm + 1 },
  card: { minHeight: 112, borderWidth: border.thin, borderRadius: radius.md + 2, padding: typography.size.xs + 1, flexDirection: 'row', alignItems: 'center', gap: typography.size.xs + 1 },
  logo: { width: 68, height: 68, borderWidth: border.thin, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, minWidth: 0 },
  bankName: { fontSize: typography.size.sm + 1, fontWeight: typography.weight.black },
  bankNumber: { marginTop: spacing.sm, fontSize: typography.size.xs + 1, fontWeight: typography.weight.bold },
  bankOwner: { marginTop: spacing.sm - spacing.xxs, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  radio: { width: 25, height: 25, borderWidth: 1.5, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 15, height: 15, borderRadius: 8 },
  empty: { minHeight: 100, borderWidth: border.thin, borderRadius: radius.md + 2, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emptyText: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold, textAlign: 'center' },
  addAccount: { minHeight: 70, borderWidth: border.thin, borderRadius: radius.md + 1, paddingHorizontal: typography.size.xs + 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 3 },
  addIcon: { width: touchTarget.minimum, height: touchTarget.minimum, borderWidth: border.thin, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center' },
  addTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.black },
  addDescription: { marginTop: spacing.xs, fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  safetyNotice: { borderWidth: border.thin, borderRadius: radius.md + 2, padding: typography.size.xs + 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  safetyIcon: { width: 42, height: 42, borderWidth: border.thin, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center' },
  safetyText: { flex: 1, fontSize: typography.size.xs - 1, lineHeight: 17, fontWeight: typography.weight.semibold },
  footer: { borderTopWidth: border.thin, paddingHorizontal: spacing.sm + spacing.xs, paddingTop: spacing.sm + spacing.xxs, flexDirection: 'row', gap: spacing.sm + spacing.xxs },
  cancelButton: { flex: 1, minHeight: 52, borderWidth: border.thin, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black },
});
