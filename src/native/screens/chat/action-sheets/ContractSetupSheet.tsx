import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  MapPin,
  Repeat2,
  Scale,
  ShieldCheck,
  Ticket,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assetManifest } from '../../../assets/assetManifest';
import { border, palette, radius, spacing, touchTarget, typography, type AppColors } from '../../../theme';

const avatar = assetManifest.app.studentAvatar;

export function ContractSetupSheet({
  colors,
  onCancel,
  onCreate,
}: {
  colors: AppColors;
  onCancel: () => void;
  onCreate: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [currency, setCurrency] = useState('VND');
  const [allowCancellation, setAllowCancellation] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  return (
    <View
      nativeID="screen-contract-setup"
      testID="screen-contract-setup"
      style={[styles.screen, { paddingTop: Math.max(10, insets.top) }]}
    >
      <View style={styles.header}>
        <Pressable accessibilityLabel="Đóng cấu hình hợp đồng" accessibilityRole="button" onPress={onCancel} style={styles.headerButton}>
          <X color={colors.text} size={27} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cấu hình hợp đồng</Text>
        <View style={[styles.headerButton, styles.headerShield]}>
          <ShieldCheck color={colors.primaryDark} size={25} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Thiết lập các điều khoản giao dịch an toàn trước khi gửi cho đối phương.
        </Text>

        <SectionTitle colors={colors} number="1" title="Vật phẩm giao dịch" />
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.credentialHeader}>
            <View style={styles.ticketIcon}><Ticket color={palette.white} size={22} /></View>
            <View style={styles.grow}>
              <Text style={[styles.strongText, { color: colors.text }]}>Thực chứng vé xem phim</Text>
              <Text style={[styles.subText, { color: colors.textSecondary }]}>CGV Vincom</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert('Thay đổi vật phẩm', 'Chọn thực chứng khác từ ví của bạn.')}
              style={[styles.outlineButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.linkText, { color: colors.primaryDark }]}>Thay đổi</Text>
              <ChevronRight color={colors.primaryDark} size={16} />
            </Pressable>
          </View>
          <View style={[styles.credentialDetails, { borderColor: colors.border }]}>
            <DetailRow colors={colors} icon={Ticket} label="Phim:" value="Dune 2" />
            <DetailRow colors={colors} icon={Clock3} label="Suất chiếu:" value="20:00, 22/06/2024" />
            <DetailRow colors={colors} icon={MapPin} label="Ghế:" value="A12" />
          </View>
        </View>

        <SectionTitle colors={colors} number="2" title="Đối ứng thanh toán" />
        <View style={[styles.card, styles.paymentCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={[styles.currencyTabs, { borderColor: colors.border }]}>
            {['VND', 'USDT', 'USDC'].map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => setCurrency(item)}
                style={[styles.currencyTab, currency === item && { backgroundColor: colors.surfaceMuted, borderColor: colors.primaryDark }]}
              >
                <Text style={[styles.currencyText, { color: currency === item ? colors.primaryDark : colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.amountField, { borderColor: colors.border }]}>
            <Text style={[styles.amountLabel, { backgroundColor: colors.surface, color: colors.textSecondary }]}>Số tiền</Text>
            <TextInput defaultValue="450.000" keyboardType="numeric" style={[styles.amountInput, { color: colors.text }]} />
            <Text style={[styles.amountCurrency, { color: colors.textSecondary }]}>{currency}</Text>
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Người mua sẽ thanh toán số tiền này khi chấp nhận hợp đồng.
          </Text>
        </View>

        <SectionTitle colors={colors} number="3" title="Người giao dịch" />
        <View style={[styles.participantsCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Participant colors={colors} label="Bên gửi" name="Bạn" />
          <View style={[styles.swapBadge, { backgroundColor: colors.surfaceMuted }]}><Repeat2 color={colors.primaryDark} size={23} /></View>
          <Participant colors={colors} label="Bên nhận" name="Minh Anh" recipient />
        </View>

        <Pressable accessibilityRole="button" onPress={() => setAdvancedOpen((value) => !value)}>
          <SectionTitle colors={colors} number="4" rightIcon={advancedOpen ? ChevronUp : ChevronDown} title="Cài đặt nâng cao" />
        </Pressable>
        {advancedOpen ? (
          <View style={[styles.card, styles.advancedCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <AdvancedRow colors={colors} icon={Clock3} label="Thời hạn phản hồi" value="24 giờ" />
            <AdvancedRow colors={colors} icon={CalendarDays} label="Hạn hoàn tất giao dịch" value="22/06/2024 · 21:00" />
            <AdvancedRow colors={colors} icon={Scale} label="Điều kiện thực thi" value="Chỉ thực thi khi cả hai bên chấp nhận" />
            <View style={styles.advancedRow}>
              <ShieldCheck color={colors.textSecondary} size={19} />
              <Text style={[styles.advancedLabel, { color: colors.textSecondary }]}>Cho phép hủy trước khi chấp nhận</Text>
              <Switch onValueChange={setAllowCancellation} trackColor={{ false: colors.border, true: colors.primaryDark }} value={allowCancellation} />
            </View>
          </View>
        ) : null}

        <View style={[styles.infoBanner, { backgroundColor: colors.surfaceMuted, borderColor: colors.secondary }]}>
          <ShieldCheck color={colors.primaryDark} size={24} />
          <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
            Hợp đồng chỉ khóa điều khoản giao dịch. Thực chứng và khoản thanh toán chỉ được xử lý khi các điều kiện được đáp ứng.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.cancelButton, { borderColor: colors.primaryDark }]}>
          <Text style={[styles.footerText, { color: colors.primaryDark }]}>Hủy bỏ</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCreate} style={[styles.createButton, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.createText}>Khởi tạo</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Participant({ colors, label, name, recipient = false }: { colors: AppColors; label: string; name: string; recipient?: boolean }) {
  return (
    <View style={styles.participant}>
      <Text style={[styles.participantLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.participantIdentity}>
        {recipient ? (
          <Image source={avatar} style={styles.participantAvatar} />
        ) : (
          <View style={[styles.youAvatar, { backgroundColor: colors.surfaceMuted }]}><Text style={[styles.youAvatarText, { color: colors.primaryDark }]}>B</Text></View>
        )}
        <View style={styles.grow}>
          <Text style={[styles.strongText, { color: colors.text }]}>{name}</Text>
          <View style={styles.verifiedRow}><ShieldCheck color={colors.success} fill={colors.success} size={14} /><Text style={[styles.verifiedText, { color: colors.success }]}>Đã xác minh SSI</Text></View>
        </View>
      </View>
    </View>
  );
}

function SectionTitle({ colors, number, rightIcon: RightIcon, title }: { colors: AppColors; number: string; rightIcon?: typeof ChevronUp; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={[styles.sectionNumber, { backgroundColor: colors.primaryDark }]}><Text style={styles.sectionNumberText}>{number}</Text></View>
      <Text style={[styles.sectionTitleText, { color: colors.text }]}>{title}</Text>
      {RightIcon ? <RightIcon color={colors.primaryDark} size={18} /> : null}
    </View>
  );
}

function DetailRow({ colors, icon: Icon, label, value }: { colors: AppColors; icon: typeof Ticket; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Icon color={colors.primaryDark} size={17} />
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function AdvancedRow({ colors, icon: Icon, label, value }: { colors: AppColors; icon: typeof Clock3; label: string; value: string }) {
  return (
    <Pressable accessibilityRole="button" style={styles.advancedRow}>
      <Icon color={colors.textSecondary} size={19} />
      <Text style={[styles.advancedLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.advancedValue, { borderColor: colors.border }]}>
        <Text numberOfLines={1} style={[styles.advancedValueText, { color: colors.text }]}>{value}</Text>
        <ChevronRight color={colors.textSecondary} size={16} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, marginHorizontal: -12, marginTop: -14, marginBottom: Platform.OS === 'ios' ? -30 : -24 },
  header: { minHeight: 56, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: touchTarget.minimum, height: touchTarget.minimum, alignItems: 'center', justifyContent: 'center' },
  headerShield: { marginLeft: 'auto' },
  headerTitle: { flex: 1, fontSize: typography.size.xl - 2, fontWeight: typography.weight.black, textAlign: 'center' },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg - spacing.xs },
  description: { fontSize: typography.size.xs, lineHeight: 18, fontWeight: typography.weight.semibold, marginTop: spacing.md - spacing.xxs, marginBottom: spacing.md - spacing.xxs, textAlign: 'center' },
  sectionTitle: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs, marginTop: spacing.sm - 1, marginBottom: spacing.sm - 1 },
  sectionNumber: { width: 24, height: 24, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center' },
  sectionNumberText: { color: palette.white, fontSize: typography.size.xs, fontWeight: typography.weight.black },
  sectionTitleText: { flex: 1, fontSize: typography.size.sm, fontWeight: typography.weight.black },
  card: { borderWidth: border.thin, borderRadius: radius.md + 2, padding: spacing.sm + spacing.xxs },
  credentialHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  ticketIcon: { width: 48, height: 48, borderRadius: radius.md - 1, backgroundColor: palette.blue[700], alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, minWidth: 0 },
  strongText: { fontSize: typography.size.xs + 1, lineHeight: 17, fontWeight: typography.weight.black },
  subText: { marginTop: spacing.xxs, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold },
  outlineButton: { minHeight: 36, borderWidth: border.thin, borderRadius: radius.sm + 2, paddingHorizontal: spacing.sm + spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  linkText: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.extraBold },
  credentialDetails: { borderWidth: border.thin, borderRadius: radius.sm + 2, marginTop: spacing.sm + 1, padding: spacing.sm + 1, gap: spacing.sm - 1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm - 1 },
  detailLabel: { width: 73, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold },
  detailValue: { flex: 1, fontSize: typography.size.xs - 1, fontWeight: typography.weight.extraBold },
  paymentCard: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  currencyTabs: { width: '42%', height: 43, borderWidth: border.thin, borderRadius: radius.sm + 2, flexDirection: 'row', overflow: 'hidden' },
  currencyTab: { flex: 1, borderWidth: border.thin, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  currencyText: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.extraBold },
  amountField: { flex: 1, minWidth: 155, height: 43, borderWidth: border.thin, borderRadius: radius.sm + 2, paddingHorizontal: spacing.sm + spacing.xxs, flexDirection: 'row', alignItems: 'center' },
  amountLabel: { position: 'absolute', left: spacing.sm, top: -9, paddingHorizontal: spacing.xxs + 1, fontSize: typography.size.xs - 3, fontWeight: typography.weight.semibold },
  amountInput: { flex: 1, height: 40, paddingVertical: 0, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  amountCurrency: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
  hint: { width: '100%', fontSize: typography.size.xs - 2, lineHeight: 15, fontWeight: typography.weight.semibold },
  participantsCard: { minHeight: 90, borderWidth: border.thin, borderRadius: radius.md + 2, padding: spacing.sm + spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm - spacing.xxs },
  participant: { flex: 1, gap: spacing.sm - 1 },
  participantLabel: { fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  participantIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  participantAvatar: { width: 40, height: 40, borderRadius: 20 },
  youAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  youAvatarText: { fontSize: typography.size.md, fontWeight: typography.weight.extraBold },
  verifiedRow: { marginTop: spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.xxs + 1 },
  verifiedText: { fontSize: typography.size.xs - 4, fontWeight: typography.weight.extraBold },
  swapBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  advancedCard: { gap: spacing.sm },
  advancedRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  advancedLabel: { flex: 1, fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  advancedValue: { maxWidth: '58%', minHeight: 34, borderWidth: border.thin, borderRadius: radius.sm + 1, paddingHorizontal: spacing.sm + 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 1 },
  advancedValueText: { flexShrink: 1, fontSize: typography.size.xs - 2.5, fontWeight: typography.weight.bold },
  infoBanner: { borderWidth: border.thin, borderRadius: radius.md + 1, marginTop: spacing.sm + spacing.xs, padding: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm + spacing.xxs },
  infoBannerText: { flex: 1, fontSize: typography.size.xs - 1.5, lineHeight: 16, fontWeight: typography.weight.semibold },
  footer: { borderTopWidth: border.thin, paddingHorizontal: spacing.sm + spacing.xs, paddingTop: spacing.sm + spacing.xxs, paddingBottom: Platform.OS === 'ios' ? 22 : spacing.sm + spacing.xs, flexDirection: 'row', gap: spacing.sm + spacing.xxs },
  cancelButton: { flex: 1, minHeight: 50, borderWidth: border.thin, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  createButton: { flex: 1, minHeight: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  createText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black },
});
