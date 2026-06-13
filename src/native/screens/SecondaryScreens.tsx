import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Clock3,
  Download,
  FileCheck2,
  GraduationCap,
  History,
  IdCard,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Medal,
  Phone,
  RefreshCw,
  ScanLine,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { AppColors } from '../theme';
import type { AppSettings, Credential, PersonalInfo } from '../types';
import {
  AppHeader,
  Card,
  CredentialIcon,
  EmptyState,
  IconButton,
  ListChevron,
  PrimaryButton,
  ScreenScroll,
  SectionHeading,
  StatusPill,
} from '../components/ui';

export function CredentialDetailScreen({
  colors,
  credential,
  hideSensitive,
  onBack,
  onShare,
}: {
  colors: AppColors;
  credential: Credential;
  hideSensitive: boolean;
  onBack: () => void;
  onShare: () => void;
}) {
  const credentialId = credential.icon === 'graduation' ? 'did:identra:vc:9876abcdef123456' : `did:identra:vc:${credential.id}`;
  const isDegree = credential.icon === 'graduation';
  const detailAttributes = isDegree
    ? [
        { label: 'Họ và tên', value: 'Nguyễn Văn A', sensitive: true },
        { label: 'Ngày sinh', value: '01/01/2000', sensitive: true },
        { label: 'Chương trình đào tạo', value: 'Khoa học máy tính' },
        { label: 'Ngành học', value: 'Công nghệ thông tin' },
        { label: 'Bậc đào tạo', value: 'Đại học' },
        { label: 'Loại hình đào tạo', value: 'Chính quy' },
        { label: 'Xếp loại tốt nghiệp', value: 'Giỏi', highlight: true },
        { label: 'Số hiệu bằng', value: 'CN-2024-123456', sensitive: true },
      ]
    : credential.attributes.map((attribute) => ({ ...attribute, highlight: false }));
  const statusContent = {
    verified: { label: 'Đã xác minh', description: 'Thực chứng này đã được xác minh và hợp lệ.', color: colors.success, background: '#EAFDF4' },
    pending: { label: 'Đang chờ xác nhận', description: 'Thực chứng này đang chờ được xác minh.', color: colors.warning, background: '#FFF3E8' },
    expired: { label: 'Đã hết hạn', description: 'Thực chứng này đã hết hạn sử dụng.', color: colors.danger, background: '#FFF0F1' },
  }[credential.status];

  const copyDid = async () => {
    await Clipboard.setStringAsync(credentialId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenScroll id="screen-credential-detail" colors={colors} contentStyle={styles.detailScreenContent}>
      <AppHeader
        colors={colors}
        title="Chi tiết thực chứng"
        onBack={onBack}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chia sẻ thực chứng"
            onPress={onShare}
            style={({ pressed }) => [
              styles.detailShareButton,
              { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Share2 color={colors.primaryDark} size={18} />
            <Text style={[styles.detailShareText, { color: colors.primaryDark }]}>Chia sẻ</Text>
          </Pressable>
        }
      />

      <View style={styles.detailStatusIntro}>
        <View style={[styles.detailStatusPill, { backgroundColor: statusContent.background }]}>
          <CheckCircle2 color={statusContent.color} fill={statusContent.color} size={15} />
          <Text style={[styles.detailStatusText, { color: statusContent.color }]}>{statusContent.label}</Text>
        </View>
        <Text style={[styles.detailStatusDescription, { color: colors.textSecondary }]}>{statusContent.description}</Text>
      </View>

      <View style={[styles.detailCredentialCard, { backgroundColor: colors.surface, borderColor: '#DCE5FF' }]}>
        <View style={styles.detailCredentialTop}>
          <CredentialIcon icon={credential.icon} boxSize={58} size={29} />
          <View style={styles.detailCredentialMain}>
            <Text style={[styles.detailCredentialTitle, { color: colors.text }]}>{credential.title}</Text>
            <Text style={[styles.detailCredentialIssuer, { color: colors.textSecondary }]}>{credential.issuer}</Text>
            <View style={[styles.detailCategoryPill, { backgroundColor: colors.surfaceMuted }]}>
              <GraduationCap color={colors.primaryDark} size={13} />
              <Text style={[styles.detailCategoryText, { color: colors.primaryDark }]}>Giáo dục</Text>
            </View>
          </View>
          <View style={[styles.detailShieldArt, { backgroundColor: colors.primary }]}>
            <ShieldCheck color="#FFFFFF" size={40} strokeWidth={2.2} />
          </View>
        </View>

        <View style={[styles.detailDateGrid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.detailDateColumn}>
            <Text style={[styles.detailMetaLabel, { color: colors.textSecondary }]}>Ngày cấp</Text>
            <View style={styles.detailMetaValueRow}>
              <CalendarDays color={colors.textSecondary} size={16} />
              <Text style={[styles.detailMetaValue, { color: colors.text }]}>{credential.issueDate} {credential.time ?? ''}</Text>
            </View>
          </View>
          <View style={[styles.detailDateColumn, styles.detailDateColumnDivider, { borderLeftColor: colors.border }]}>
            <Text style={[styles.detailMetaLabel, { color: colors.textSecondary }]}>Ngày hết hạn</Text>
            <View style={styles.detailMetaValueRow}>
              <CalendarDays color={colors.textSecondary} size={16} />
              <Text style={[styles.detailMetaValue, { color: colors.text }]}>{credential.expiryDate ?? 'Không có'}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.detailMetaLabel, { color: colors.textSecondary }]}>Mã thực chứng (ID)</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Sao chép mã thực chứng" onPress={copyDid} style={styles.detailIdRow}>
          <Text numberOfLines={1} style={[styles.detailIdValue, { color: colors.text }]}>{credentialId}</Text>
          <ClipboardCopy color={colors.textSecondary} size={19} />
        </Pressable>
      </View>

      <Card colors={colors} style={styles.detailIssuerCard}>
        <Text style={[styles.detailCardHeading, { color: colors.text }]}>Tổ chức phát hành</Text>
        <View style={styles.detailIssuerRow}>
          <View style={[styles.detailIssuerLogo, { borderColor: '#C9D8FF', backgroundColor: colors.surfaceMuted }]}>
            <Building2 color={colors.primaryDark} size={29} />
          </View>
          <View style={styles.detailIssuerMain}>
            <View style={styles.detailIssuerNameRow}>
              <Text style={[styles.detailIssuerName, { color: colors.text }]}>{credential.issuer}</Text>
              <CheckCircle2 color={colors.success} fill={colors.success} size={16} />
            </View>
            <Text style={[styles.detailIssuerDescription, { color: colors.textSecondary }]}>
              Cơ sở giáo dục đại học công lập trực thuộc Bộ Giáo dục và Đào tạo.
            </Text>
          </View>
          <ChevronRight color={colors.textSecondary} size={21} />
        </View>
      </Card>

      <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Thông tin chi tiết</Text>
      <Card colors={colors} style={styles.detailAttributeCard}>
        {detailAttributes.map((attribute, index) => (
          <View
            key={`${attribute.label}-${index}`}
            style={[
              styles.detailAttributeRow,
              index < detailAttributes.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.detailAttributeLabel, { color: colors.textSecondary }]}>{attribute.label}</Text>
            {attribute.highlight && !hideSensitive ? (
              <View style={styles.detailAttributeHighlight}>
                <Text style={[styles.detailAttributeHighlightText, { color: colors.success }]}>{attribute.value}</Text>
              </View>
            ) : (
              <Text numberOfLines={2} style={[styles.detailAttributeValue, { color: colors.text }]}>
                {attribute.sensitive && hideSensitive ? '••••••••••' : attribute.value}
              </Text>
            )}
          </View>
        ))}
      </Card>

      {[
        {
          icon: ShieldCheck,
          title: 'Xem bằng chứng xác minh',
          description: 'Xem chi tiết dữ liệu và chữ ký số',
          message: `Chữ ký số ${credential.signature} đã được xác minh hợp lệ.`,
        },
        {
          icon: History,
          title: 'Lịch sử xác minh',
          description: 'Xem các lần thực chứng này được xác minh',
          message: `Thực chứng được cấp và xác minh vào ${credential.issueDate} ${credential.time ?? ''}.`,
        },
        {
          icon: Info,
          title: 'Thông tin kỹ thuật',
          description: 'Xem thông tin kỹ thuật của thực chứng',
          message: `DID đơn vị phát hành: ${credential.didIssuer}`,
        },
      ].map(({ icon: Icon, title, description, message }) => (
        <Pressable
          key={title}
          accessibilityRole="button"
          onPress={() => Alert.alert(title, message)}
          style={({ pressed }) => [
            styles.detailActionCard,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <View style={[styles.detailActionIcon, { backgroundColor: colors.surfaceMuted }]}>
            <Icon color={colors.primaryDark} size={21} />
          </View>
          <View style={styles.detailActionMain}>
            <Text style={[styles.detailActionTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.detailActionDescription, { color: colors.textSecondary }]}>{description}</Text>
          </View>
          <ChevronRight color={colors.textSecondary} size={21} />
        </Pressable>
      ))}
    </ScreenScroll>
  );
}

export function ShareScreen({
  colors,
  credential,
  onBack,
  onShared,
}: {
  colors: AppColors;
  credential: Credential;
  onBack: () => void;
  onShared: (selected: Credential['attributes']) => void;
}) {
  const credentialId = credential.icon === 'graduation' ? 'did:identra:vc:9876abcdef123456' : `did:identra:vc:${credential.id}`;
  const fields = useMemo(
    () =>
      credential.icon === 'graduation'
        ? [
            { label: 'Họ và tên', value: 'Nguyễn Văn A', icon: UserRound },
            { label: 'Ngày sinh', value: '01/01/2000', icon: CalendarDays },
            { label: 'Chương trình đào tạo', value: 'Khoa học máy tính', icon: GraduationCap },
            { label: 'Ngành học', value: 'Công nghệ thông tin', icon: Building2 },
            { label: 'Bậc đào tạo', value: 'Đại học', icon: Award },
            { label: 'Loại hình đào tạo', value: 'Chính quy', icon: BookOpen },
            { label: 'Xếp loại tốt nghiệp', value: 'Giỏi', icon: Medal, highlight: true },
            { label: 'Số hiệu bằng', value: 'CN-2024-123456', icon: IdCard },
          ]
        : credential.attributes.map((attribute, index) => ({
            ...attribute,
            icon: [UserRound, CalendarDays, GraduationCap, Building2, Award, BookOpen, Medal, IdCard][index % 8],
            highlight: false,
          })),
    [credential],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!selected.length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onShared(fields.filter((field) => selected.includes(field.label)).map(({ label, value }) => ({ label, value })));
    }, 650);
  };

  const copyCredentialId = async () => {
    await Clipboard.setStringAsync(credentialId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenScroll id="screen-share-credential" colors={colors} contentStyle={styles.shareScreenContent}>
      <AppHeader colors={colors} title="Chia sẻ dữ liệu" onBack={onBack} />

      <View style={styles.shareStatusIntro}>
        <View style={styles.shareVerifiedPill}>
          <CheckCircle2 color={colors.success} fill={colors.success} size={15} />
          <Text style={[styles.shareVerifiedText, { color: colors.success }]}>Đã xác minh</Text>
        </View>
        <Text style={[styles.shareStatusDescription, { color: colors.textSecondary }]}>
          Chọn những thông tin bạn muốn chia sẻ từ thực chứng này. Bạn luôn kiểm soát dữ liệu của mình.
        </Text>
      </View>

      <View style={[styles.shareCredentialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.shareCredentialTop}>
          <CredentialIcon icon={credential.icon} boxSize={62} size={31} />
          <View style={styles.shareCredentialMain}>
            <Text style={[styles.shareCredentialTitle, { color: colors.text }]}>{credential.title}</Text>
            <Text style={[styles.shareCredentialIssuer, { color: colors.textSecondary }]}>{credential.issuer}</Text>
            <View style={[styles.shareCategory, { backgroundColor: colors.surfaceMuted }]}>
              <GraduationCap color={colors.primaryDark} size={13} />
              <Text style={[styles.shareCategoryText, { color: colors.primaryDark }]}>Giáo dục</Text>
            </View>
          </View>
          <View style={[styles.shareShieldArt, { backgroundColor: colors.primary }]}>
            <ShieldCheck color="#FFFFFF" size={37} strokeWidth={2.4} />
          </View>
        </View>
        <View style={[styles.shareMetaGrid, { borderTopColor: colors.border }]}>
          <ShareMeta icon={CalendarDays} label="Ngày cấp" value={`${credential.issueDate} ${credential.time ?? ''}`} colors={colors} />
          <ShareMeta icon={CalendarDays} label="Ngày hết hạn" value={credential.expiryDate ?? 'Không có'} colors={colors} divider />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sao chép ID thực chứng"
            onPress={copyCredentialId}
            style={[styles.shareMetaItem, styles.shareMetaDivider, { borderLeftColor: colors.border }]}
          >
            <Text style={[styles.shareMetaLabel, { color: colors.textSecondary }]}>ID thực chứng</Text>
            <View style={styles.shareIdRow}>
              <Text numberOfLines={1} style={[styles.shareMetaValue, { color: colors.text }]}>{credentialId}</Text>
              <ClipboardCopy color={colors.textSecondary} size={15} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.shareSectionHeader}>
        <Text style={[styles.shareSectionTitle, { color: colors.text }]}>Chọn thông tin chia sẻ</Text>
        <Text style={[styles.shareSelectedCount, { color: colors.primaryDark }]}>Đã chọn {selected.length}/{fields.length}</Text>
      </View>

      <View style={[styles.shareInfo, { backgroundColor: colors.surfaceMuted }]}>
        <Info color={colors.primaryDark} size={21} />
        <Text style={[styles.shareInfoText, { color: colors.textSecondary }]}>
          Bên xác minh chỉ nhận được những thông tin bạn chọn chia sẻ. Bạn có thể thay đổi lựa chọn bất kỳ lúc nào.
        </Text>
      </View>

      <View style={[styles.shareFieldList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {fields.map((field, index) => {
          const checked = selected.includes(field.label);
          const Icon = field.icon;
          return (
            <Pressable
              key={field.label}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={field.label}
              onPress={() =>
                setSelected((current) =>
                  checked ? current.filter((label) => label !== field.label) : [...current, field.label],
                )
              }
              style={({ pressed }) => [
                styles.shareFieldRow,
                index < fields.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                { opacity: pressed ? 0.68 : 1 },
              ]}
            >
              <View style={[styles.shareFieldIcon, { backgroundColor: colors.surfaceMuted }]}>
                <Icon color={colors.primaryDark} size={20} strokeWidth={1.9} />
              </View>
              <View style={styles.shareFieldMain}>
                <Text style={[styles.shareFieldLabel, { color: colors.text }]}>{field.label}</Text>
                <Text style={[styles.shareFieldValue, { color: field.highlight ? colors.success : colors.textSecondary }]}>
                  {field.value}
                </Text>
              </View>
              <View
                style={[
                  styles.shareCheckbox,
                  {
                    borderColor: checked ? colors.primaryDark : colors.textSecondary,
                    backgroundColor: checked ? colors.primaryDark : colors.surface,
                  },
                ]}
              >
                {checked ? <Check color="#FFFFFF" size={16} strokeWidth={3} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.shareWarning}>
        <AlertTriangle color={colors.danger} size={24} strokeWidth={2.4} />
        <Text style={styles.shareWarningText}>
          Lựa chọn tiết lộ quá nhiều dữ liệu có thể khiến bạn bị lộ thông tin cá nhân, các bên xác minh chỉ có quyền yêu cầu dữ liệu tối thiểu.
        </Text>
      </View>

      <View style={styles.shareActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hủy chia sẻ"
          onPress={onBack}
          style={({ pressed }) => [styles.shareCancelButton, { borderColor: colors.textSecondary, opacity: pressed ? 0.68 : 1 }]}
        >
          <Text style={[styles.shareCancelText, { color: colors.text }]}>Hủy</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chia sẻ"
          disabled={!selected.length || loading}
          onPress={submit}
          style={({ pressed }) => [
            styles.shareSubmitButton,
            { backgroundColor: colors.primaryDark, opacity: pressed || !selected.length ? 0.58 : 1 },
          ]}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.shareSubmitText}>Chia sẻ</Text>}
        </Pressable>
      </View>

      <View style={styles.shareEncryption}>
        <LockKeyhole color={colors.textSecondary} size={15} />
        <Text style={[styles.shareEncryptionText, { color: colors.textSecondary }]}>
          Dữ liệu được mã hóa và chỉ chia sẻ cho bên xác minh.
        </Text>
      </View>
    </ScreenScroll>
  );
}

function ShareMeta({
  icon: Icon,
  label,
  value,
  colors,
  divider,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  colors: AppColors;
  divider?: boolean;
}) {
  return (
    <View style={[styles.shareMetaItem, divider && styles.shareMetaDivider, divider && { borderLeftColor: colors.border }]}>
      <View style={styles.shareMetaLabelRow}>
        <Icon color={colors.textSecondary} size={16} />
        <Text style={[styles.shareMetaLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.shareMetaValue, { color: colors.text }]}>{value.trim()}</Text>
    </View>
  );
}

export function ShareQrScreen({
  colors,
  credential,
  attributes,
  onBack,
  onCancel,
}: {
  colors: AppColors;
  credential: Credential;
  attributes: Credential['attributes'];
  onBack: () => void;
  onCancel: () => void;
}) {
  const [createdAt, setCreatedAt] = useState(Date.now());
  const [remaining, setRemaining] = useState(180);
  const did = credential.didHolder;
  const qrValue = useMemo(
    () =>
      JSON.stringify({
        type: 'identra-credential-share',
        credentialId: credential.id,
        holder: did,
        attributes,
        issuedAt: new Date(createdAt).toISOString(),
        expiresAt: new Date(createdAt + 180000).toISOString(),
      }),
    [attributes, createdAt, credential.id, did],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((createdAt + 180000 - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  const refresh = () => {
    setCreatedAt(Date.now());
    setRemaining(180);
  };

  const copyDid = async () => {
    await Clipboard.setStringAsync(did);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');

  return (
    <ScreenScroll id="screen-share-credential-qr" colors={colors} contentStyle={styles.shareQrScreenContent}>
      <View style={styles.shareQrBrandHeader}>
        <IconButton label="Quay lại" colors={colors} onPress={onBack}>
          <ArrowLeft color={colors.text} size={25} />
        </IconButton>
        <Text style={[styles.shareQrBrand, { color: colors.text }]}>Chia sẻ thực chứng</Text>
        <View style={styles.shareQrHeaderSpacer} />
      </View>

      <Text style={[styles.shareQrSubtitle, { color: colors.textSecondary }]}>
        Chia sẻ mã QR để xác minh danh tính hoặc chia sẻ thông tin
      </Text>

      <View style={[styles.shareQrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.shareQrVerified}>
          <CheckCircle2 color={colors.success} fill={colors.success} size={15} />
          <Text style={[styles.shareQrVerifiedText, { color: colors.success }]}>Đã xác minh</Text>
        </View>
        <Text style={[styles.shareQrCredentialTitle, { color: colors.text }]}>{credential.title}</Text>
        <Text style={[styles.shareQrIssuer, { color: colors.textSecondary }]}>{credential.issuer}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Sao chép DID" onPress={copyDid} style={styles.shareQrDidRow}>
          <Text numberOfLines={1} style={[styles.shareQrDid, { color: colors.textSecondary }]}>DID: {did}</Text>
          <ClipboardCopy color={colors.textSecondary} size={16} />
        </Pressable>

        <View style={styles.shareQrCodeFrame}>
          <QRCode value={qrValue} size={238} backgroundColor="#FFFFFF" color="#050505" ecl="H" />
          <View style={styles.shareQrLogo}>
            <ShieldCheck color="#FFFFFF" size={25} />
          </View>
        </View>

        <View style={[styles.shareQrExpiry, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={17} />
          <Text style={[styles.shareQrExpiryText, { color: colors.textSecondary }]}>Mã QR này hết hạn sau</Text>
          <Text style={[styles.shareQrExpiryTime, { color: remaining ? colors.primaryDark : colors.danger }]}>
            {minutes}:{seconds}
          </Text>
        </View>
      </View>

      <View style={styles.shareQrActions}>
        <QrAction
          colors={colors}
          icon={Share2}
          title="Chia sẻ"
          description="Gửi mã QR"
          onPress={() => Alert.alert('Chia sẻ mã QR', 'Mã QR đã sẵn sàng để chia sẻ.')}
        />
        <QrAction
          colors={colors}
          icon={Download}
          title="Tải xuống"
          description="Lưu về máy"
          onPress={() => Alert.alert('Tải xuống', 'Tính năng lưu ảnh QR sẽ được hoàn thiện trong phiên bản tiếp theo.')}
        />
        <QrAction colors={colors} icon={RefreshCw} title="Làm mới" description="Tạo mã mới" onPress={refresh} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert('Chia sẻ an toàn', 'Chỉ gửi mã QR này cho người và tổ chức bạn tin tưởng.')}
        style={({ pressed }) => [
          styles.shareQrSafetyCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View style={[styles.shareQrSafetyIcon, { backgroundColor: colors.primary }]}>
          <LockKeyhole color="#FFFFFF" size={25} />
        </View>
        <View style={styles.shareQrSafetyMain}>
          <Text style={[styles.shareQrSafetyTitle, { color: colors.text }]}>Chỉ chia sẻ cho người bạn tin tưởng</Text>
          <Text style={[styles.shareQrSafetyText, { color: colors.textSecondary }]}>
            Người nhận có thể quét mã QR để xác minh danh tính hoặc yêu cầu thông tin của bạn.
          </Text>
        </View>
        <ChevronRight color={colors.textSecondary} size={22} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hủy mã QR"
        onPress={() =>
          Alert.alert('Hủy mã QR?', 'Mã QR hiện tại sẽ không còn được sử dụng.', [
            { text: 'Tiếp tục sử dụng', style: 'cancel' },
            { text: 'Hủy mã QR', style: 'destructive', onPress: onCancel },
          ])
        }
        style={({ pressed }) => [styles.shareQrCancelCard, { opacity: pressed ? 0.7 : 1 }]}
      >
        <AlertTriangle color={colors.danger} size={25} strokeWidth={2.4} />
        <Text style={styles.shareQrCancelText}>Nếu bạn nhận thấy bất kỳ điều gì bất thường, hãy hủy mã QR ngay lập tức.</Text>
        <ChevronRight color={colors.danger} size={22} />
      </Pressable>
    </ScreenScroll>
  );
}

export function ConnectionQrScreen({
  colors,
  did,
  createdAt: initialCreatedAt,
  onBack,
  onRefresh,
  onCancel,
}: {
  colors: AppColors;
  did: string;
  createdAt: number;
  onBack: () => void;
  onRefresh: (createdAt: number) => void;
  onCancel: () => void;
}) {
  const [createdAt, setCreatedAt] = useState(initialCreatedAt);
  const [remaining, setRemaining] = useState(180);
  const qrValue = useMemo(
    () =>
      JSON.stringify({
        type: 'identra-ssi-connection-invitation',
        inviter: did,
        invitationId: `invite-${createdAt}`,
        issuedAt: new Date(createdAt).toISOString(),
        expiresAt: new Date(createdAt + 180000).toISOString(),
      }),
    [createdAt, did],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((createdAt + 180000 - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  const refresh = () => {
    const nextCreatedAt = Date.now();
    setCreatedAt(nextCreatedAt);
    setRemaining(180);
    onRefresh(nextCreatedAt);
  };

  const confirmBack = () => {
    Alert.alert('Hủy mã QR?', 'Bạn có muốn hủy mã QR lời mời kết nối không?', [
      { text: 'Không', style: 'cancel', onPress: onBack },
      { text: 'Có', style: 'destructive', onPress: onCancel },
    ]);
  };

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');

  return (
    <ScreenScroll id="screen-connection-invitation-qr" colors={colors} contentStyle={styles.shareQrScreenContent}>
      <View style={styles.shareQrBrandHeader}>
        <IconButton label="Quay lại" colors={colors} onPress={confirmBack}>
          <ArrowLeft color={colors.text} size={25} />
        </IconButton>
        <Text style={[styles.shareQrBrand, { color: colors.text }]}>Lời mời kết nối</Text>
        <View style={styles.shareQrHeaderSpacer} />
      </View>

      <Text style={[styles.shareQrSubtitle, { color: colors.textSecondary }]}>
        Chia sẻ mã QR để thực hiện kết nối SSI
      </Text>

      <View style={[styles.shareQrCard, styles.connectionQrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.shareQrCodeFrame}>
          <QRCode value={qrValue} size={238} backgroundColor="#FFFFFF" color="#050505" ecl="H" />
          <View style={styles.shareQrLogo}>
            <ShieldCheck color="#FFFFFF" size={25} />
          </View>
        </View>

        <View style={[styles.shareQrExpiry, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={17} />
          <Text style={[styles.shareQrExpiryText, { color: colors.textSecondary }]}>Mã QR này hết hạn sau</Text>
          <Text style={[styles.shareQrExpiryTime, { color: remaining ? colors.primaryDark : colors.danger }]}>
            {minutes}:{seconds}
          </Text>
        </View>
      </View>

      <View style={styles.shareQrActions}>
        <QrAction
          colors={colors}
          icon={Share2}
          title="Chia sẻ"
          description="Gửi mã QR"
          onPress={() => Alert.alert('Chia sẻ lời mời', 'Mã QR lời mời kết nối SSI đã sẵn sàng để chia sẻ.')}
        />
        <QrAction
          colors={colors}
          icon={Download}
          title="Tải xuống"
          description="Lưu về máy"
          onPress={() => Alert.alert('Tải xuống', 'Tính năng lưu ảnh QR sẽ được hoàn thiện trong phiên bản tiếp theo.')}
        />
        <QrAction colors={colors} icon={RefreshCw} title="Làm mới" description="Tạo mã mới" onPress={refresh} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert('Kết nối an toàn', 'Chỉ chia sẻ lời mời kết nối với người và tổ chức bạn tin tưởng.')}
        style={({ pressed }) => [
          styles.shareQrSafetyCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View style={[styles.shareQrSafetyIcon, { backgroundColor: colors.primary }]}>
          <LockKeyhole color="#FFFFFF" size={25} />
        </View>
        <View style={styles.shareQrSafetyMain}>
          <Text style={[styles.shareQrSafetyTitle, { color: colors.text }]}>Chỉ kết nối với người bạn tin tưởng</Text>
          <Text style={[styles.shareQrSafetyText, { color: colors.textSecondary }]}>
            Người nhận có thể quét mã QR để thiết lập kết nối SSI với ví của bạn.
          </Text>
        </View>
        <ChevronRight color={colors.textSecondary} size={22} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hủy lời mời kết nối"
        onPress={() =>
          Alert.alert('Hủy lời mời kết nối?', 'Mã QR hiện tại sẽ không còn được sử dụng.', [
            { text: 'Tiếp tục sử dụng', style: 'cancel' },
            { text: 'Hủy lời mời', style: 'destructive', onPress: onCancel },
          ])
        }
        style={({ pressed }) => [styles.shareQrCancelCard, { opacity: pressed ? 0.7 : 1 }]}
      >
        <AlertTriangle color={colors.danger} size={25} strokeWidth={2.4} />
        <Text style={styles.shareQrCancelText}>Nếu bạn nhận thấy bất kỳ điều gì bất thường, hãy hủy lời mời ngay lập tức.</Text>
        <ChevronRight color={colors.danger} size={22} />
      </Pressable>
    </ScreenScroll>
  );
}

function QrAction({
  colors,
  icon: Icon,
  title,
  description,
  onPress,
}: {
  colors: AppColors;
  icon: LucideIcon;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.shareQrAction, { opacity: pressed ? 0.65 : 1 }]}
    >
      <View style={[styles.shareQrActionIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Icon color={colors.primaryDark} size={25} strokeWidth={1.8} />
      </View>
      <Text style={[styles.shareQrActionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.shareQrActionDescription, { color: colors.textSecondary }]}>{description}</Text>
    </Pressable>
  );
}

export function ProfileScreen({
  colors,
  profile,
  onBack,
  onSave,
}: {
  colors: AppColors;
  profile: PersonalInfo;
  onBack: () => void;
  onSave: (profile: PersonalInfo) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const fields: Array<{ key: keyof PersonalInfo; label: string; icon: typeof UserRound; keyboard?: 'email-address' | 'phone-pad' }> = [
    { key: 'fullName', label: 'Họ và tên', icon: UserRound },
    { key: 'dob', label: 'Ngày sinh', icon: UserRound },
    { key: 'nationalId', label: 'Số CCCD', icon: LockKeyhole },
    { key: 'email', label: 'Email', icon: Mail, keyboard: 'email-address' },
    { key: 'phone', label: 'Số điện thoại', icon: Phone, keyboard: 'phone-pad' },
    { key: 'address', label: 'Địa chỉ', icon: MapPin },
  ];

  return (
    <ScreenScroll id="screen-personal-profile" colors={colors}>
      <AppHeader colors={colors} title="Thông tin cá nhân" onBack={onBack} />
      <View style={styles.profileHero}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.primaryDark }]}>
          <UserRound color="#FFFFFF" size={38} />
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{draft.fullName}</Text>
        <Text style={[styles.profileDid, { color: colors.textSecondary }]}>{draft.did}</Text>
      </View>
      <Card colors={colors} style={styles.formCard}>
        {fields.map(({ key, label, icon: Icon, keyboard }) => (
          <View key={key} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
              <Icon color={colors.textSecondary} size={18} />
              <TextInput
                value={draft[key]}
                onChangeText={(value) => setDraft((current) => ({ ...current, [key]: value }))}
                keyboardType={keyboard}
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>
        ))}
      </Card>
      <PrimaryButton colors={colors} title="Lưu thay đổi" onPress={() => onSave(draft)} />
    </ScreenScroll>
  );
}

export function SecurityScreen({
  colors,
  settings,
  onBack,
  onSettings,
}: {
  colors: AppColors;
  settings: AppSettings;
  onBack: () => void;
  onSettings: (settings: Partial<AppSettings>) => void;
}) {
  return (
    <ScreenScroll id="screen-security" colors={colors}>
      <AppHeader colors={colors} title="Bảo mật" onBack={onBack} />
      <Card colors={colors}>
        <View style={styles.securityScore}>
          <View style={styles.securityScoreIcon}>
            <ShieldCheck color={colors.success} size={34} />
          </View>
          <View style={styles.securityMain}>
            <Text style={[styles.securityTitle, { color: colors.text }]}>Ví đang được bảo vệ</Text>
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>Các khóa riêng tư được lưu an toàn trên thiết bị.</Text>
          </View>
        </View>
      </Card>
      <SectionHeading colors={colors} title="Quyền riêng tư" />
      <Card colors={colors} style={styles.settingsCard}>
        <SettingToggle
          colors={colors}
          icon={ShieldCheck}
          title="Ẩn dữ liệu nhạy cảm"
          description="Che thông tin quan trọng theo mặc định"
          value={settings.hideSensitiveData}
          onValueChange={(value) => onSettings({ hideSensitiveData: value })}
        />
      </Card>
    </ScreenScroll>
  );
}

type NotificationFilter = 'all' | 'unread' | 'important';
type NotificationPeriod = 'today' | 'yesterday' | 'older';

const notificationItems: Array<{
  id: string;
  title: string;
  body: string;
  time: string;
  period: NotificationPeriod;
  unread?: boolean;
  important?: boolean;
  icon: LucideIcon;
  color: string;
  background: string;
}> = [
  {
    id: 'verified',
    title: 'Thực chứng đã được xác minh',
    body: 'Thực chứng “Bằng tốt nghiệp” đã được xác minh thành công bởi Đại học Công nghệ.',
    time: '10:30',
    period: 'today',
    unread: true,
    important: true,
    icon: ShieldCheck,
    color: '#12B76A',
    background: '#EAFBF4',
  },
  {
    id: 'identity-request',
    title: 'Yêu cầu xác minh danh tính',
    body: 'Công ty ABC đang yêu cầu xác minh danh tính của bạn.',
    time: '09:15',
    period: 'today',
    unread: true,
    important: true,
    icon: ScanLine,
    color: '#355CFF',
    background: '#EEF3FF',
  },
  {
    id: 'security-update',
    title: 'Cập nhật bảo mật',
    body: 'Mã bảo mật của bạn đã được thay đổi thành công.',
    time: '08:45',
    period: 'today',
    icon: Bell,
    color: '#9747FF',
    background: '#F6EDFF',
  },
  {
    id: 'expiring',
    title: 'Thực chứng sắp hết hạn',
    body: 'Thực chứng “Chứng chỉ ngoại ngữ IELTS” sẽ hết hạn sau 7 ngày nữa.',
    time: '08:10',
    period: 'today',
    unread: true,
    important: true,
    icon: Clock3,
    color: '#F57900',
    background: '#FFF3E8',
  },
  {
    id: 'shared',
    title: 'Bạn đã chia sẻ thực chứng',
    body: 'Bạn đã chia sẻ “KYC Level 2” với Công ty XYZ thành công.',
    time: 'Hôm qua, 16:20',
    period: 'yesterday',
    icon: FileCheck2,
    color: '#355CFF',
    background: '#EEF3FF',
  },
  {
    id: 'login',
    title: 'Đăng nhập thành công',
    body: 'Bạn đã đăng nhập vào Identra trên thiết bị iPhone 15 Pro.',
    time: 'Hôm qua, 14:05',
    period: 'yesterday',
    icon: CheckCircle2,
    color: '#12B76A',
    background: '#EAFBF4',
  },
  {
    id: 'policy',
    title: 'Chính sách bảo mật được cập nhật',
    body: 'Chúng tôi đã cập nhật Chính sách bảo mật. Xem chi tiết để biết thêm thông tin.',
    time: '18/06/2024',
    period: 'older',
    important: true,
    icon: Info,
    color: '#9747FF',
    background: '#F6EDFF',
  },
];

export function NotificationsScreen({
  colors,
  onBack,
  onSettings,
}: {
  colors: AppColors;
  onBack: () => void;
  onSettings: () => void;
}) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [showEnableBanner, setShowEnableBanner] = useState(true);
  const visible = useMemo(
    () => notificationItems.filter((item) => filter === 'all' || (filter === 'unread' ? item.unread : item.important)),
    [filter],
  );
  const groups = [
    { period: 'today' as const, title: 'Hôm nay' },
    { period: 'yesterday' as const, title: 'Hôm qua' },
    { period: 'older' as const, title: 'Trước đó' },
  ].map((group) => ({ ...group, items: visible.filter((item) => item.period === group.period) })).filter((group) => group.items.length);

  return (
    <ScreenScroll id="screen-notifications" colors={colors} contentStyle={styles.notificationScreenContent}>
      <AppHeader
        colors={colors}
        title="Thông báo"
        onBack={onBack}
        right={
          <IconButton label="Mở cài đặt thông báo" colors={colors} onPress={onSettings}>
            <Settings color={colors.text} size={24} />
          </IconButton>
        }
      />

      <View style={[styles.notificationTabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {([
          ['all', 'Tất cả'],
          ['unread', 'Chưa đọc'],
          ['important', 'Quan trọng'],
        ] as Array<[NotificationFilter, string]>).map(([value, label], index) => {
          const active = filter === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(value)}
              style={[
                styles.notificationTab,
                index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
                active && { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <Text style={[styles.notificationTabText, { color: active ? colors.primaryDark : colors.textSecondary }]}>{label}</Text>
              {value === 'unread' ? <View style={[styles.notificationTabDot, { backgroundColor: colors.primaryDark }]} /> : null}
            </Pressable>
          );
        })}
      </View>

      {showEnableBanner ? (
        <View style={[styles.notificationBanner, { backgroundColor: colors.surfaceMuted, borderColor: '#DFE6FF' }]}>
          <View style={[styles.notificationBannerIcon, { backgroundColor: colors.surface }]}>
            <Bell color={colors.primaryDark} fill={colors.primaryDark} size={22} />
          </View>
          <View style={styles.notificationBannerMain}>
            <Text style={[styles.notificationBannerTitle, { color: colors.text }]}>Bật thông báo để không bỏ lỡ những cập nhật quan trọng</Text>
            <Text style={[styles.notificationBannerBody, { color: colors.textSecondary }]}>Nhận thông báo tức thì về hoạt động tài khoản, thực chứng và bảo mật.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng gợi ý bật thông báo" onPress={() => setShowEnableBanner(false)} style={styles.notificationBannerClose}>
            <X color={colors.textSecondary} size={18} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setShowEnableBanner(false)} style={[styles.notificationEnableButton, { backgroundColor: colors.primaryDark }]}>
            <Text style={styles.notificationEnableButtonText}>Bật ngay</Text>
          </Pressable>
        </View>
      ) : null}

      {groups.length ? groups.map((group) => (
        <View key={group.period} style={styles.notificationGroup}>
          <Text style={[styles.notificationGroupTitle, { color: colors.text }]}>{group.title}</Text>
          <View style={styles.notificationGroupList}>
            {group.items.map((notification) => (
              <Pressable
                key={notification.id}
                style={({ pressed }) => [
                  styles.notificationCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={[styles.notificationIcon, { backgroundColor: notification.background }]}>
                  <notification.icon color={notification.color} size={24} strokeWidth={1.9} />
                </View>
                <View style={styles.notificationMain}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>{notification.title}</Text>
                  <Text style={[styles.notificationBody, { color: colors.textSecondary }]}>{notification.body}</Text>
                </View>
                <View style={styles.notificationTrailing}>
                  <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{notification.time}</Text>
                  {notification.unread ? <View style={[styles.notificationUnreadDot, { backgroundColor: colors.primaryDark }]} /> : <ChevronRight color={colors.textSecondary} size={19} />}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )) : (
        <EmptyState colors={colors} icon={Bell} title="Không có thông báo" description="Không có thông báo phù hợp với bộ lọc đang chọn." />
      )}
    </ScreenScroll>
  );
}

export function SettingToggle({
  colors,
  icon: Icon,
  title,
  description,
  value,
  onValueChange,
  divider,
}: {
  colors: AppColors;
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  divider?: boolean;
}) {
  return (
    <View style={[styles.settingRow, divider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Icon color={colors.primaryDark} size={22} />
      </View>
      <View style={styles.settingMain}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  detailScreenContent: { gap: 12, paddingBottom: 30 },
  detailShareButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailShareText: { fontSize: 13, fontWeight: '800' },
  detailStatusIntro: { alignItems: 'flex-start', gap: 7, marginTop: -2, marginBottom: 2 },
  detailStatusPill: { minHeight: 27, borderRadius: 14, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailStatusText: { fontSize: 12, fontWeight: '800' },
  detailStatusDescription: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  detailCredentialCard: { borderWidth: 1, borderRadius: 18, padding: 16 },
  detailCredentialTop: { minHeight: 91, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailCredentialMain: { flex: 1, gap: 4 },
  detailCredentialTitle: { fontSize: 19, fontWeight: '900' },
  detailCredentialIssuer: { fontSize: 13, fontWeight: '600' },
  detailCategoryPill: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 8, minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailCategoryText: { fontSize: 11, fontWeight: '700' },
  detailShieldArt: { width: 59, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  detailDateGrid: { marginTop: 14, marginBottom: 14, paddingVertical: 13, borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row' },
  detailDateColumn: { flex: 1, paddingHorizontal: 2, gap: 7, borderLeftWidth: 0 },
  detailDateColumnDivider: { borderLeftWidth: 1, paddingLeft: 14 },
  detailMetaLabel: { fontSize: 11, fontWeight: '600' },
  detailMetaValueRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  detailMetaValue: { fontSize: 12, fontWeight: '800', flexShrink: 1 },
  detailIdRow: { minHeight: 35, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailIdValue: { flex: 1, fontSize: 12, fontWeight: '800' },
  detailIssuerCard: { padding: 14, gap: 13 },
  detailCardHeading: { fontSize: 13, fontWeight: '900' },
  detailIssuerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIssuerLogo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  detailIssuerMain: { flex: 1 },
  detailIssuerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailIssuerName: { flexShrink: 1, fontSize: 13, fontWeight: '900' },
  detailIssuerDescription: { marginTop: 4, fontSize: 11, lineHeight: 17, fontWeight: '600' },
  detailSectionTitle: { marginTop: 6, fontSize: 15, fontWeight: '900' },
  detailAttributeCard: { paddingVertical: 6 },
  detailAttributeRow: { minHeight: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  detailAttributeLabel: { flex: 1, fontSize: 12, fontWeight: '600' },
  detailAttributeValue: { flex: 1.35, fontSize: 12, lineHeight: 17, fontWeight: '700', textAlign: 'right' },
  detailAttributeHighlight: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#EAFDF4' },
  detailAttributeHighlightText: { fontSize: 12, fontWeight: '800' },
  detailActionCard: { minHeight: 68, borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  detailActionIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailActionMain: { flex: 1 },
  detailActionTitle: { fontSize: 13, fontWeight: '900' },
  detailActionDescription: { marginTop: 3, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  shareScreenContent: { paddingTop: 8, paddingBottom: 26, gap: 14 },
  shareStatusIntro: { alignItems: 'flex-start', gap: 7, marginTop: -2, marginBottom: 2 },
  shareVerifiedPill: { alignSelf: 'flex-start', minHeight: 27, borderRadius: 14, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAFBF3' },
  shareVerifiedText: { fontSize: 12, fontWeight: '800' },
  shareStatusDescription: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  shareCredentialCard: { borderWidth: 1, borderRadius: 18, padding: 14 },
  shareCredentialTop: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shareCredentialMain: { flex: 1, minWidth: 0 },
  shareCredentialTitle: { fontSize: 18, lineHeight: 23, fontWeight: '900' },
  shareCredentialIssuer: { marginTop: 4, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  shareCategory: { alignSelf: 'flex-start', minHeight: 23, marginTop: 7, borderRadius: 12, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  shareCategoryText: { fontSize: 11, fontWeight: '700' },
  shareShieldArt: { width: 58, height: 66, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  shareMetaGrid: { marginTop: 13, paddingTop: 13, borderTopWidth: 1, flexDirection: 'row' },
  shareMetaItem: { flex: 1, minWidth: 0, minHeight: 49, paddingHorizontal: 4, justifyContent: 'center', gap: 7 },
  shareMetaDivider: { borderLeftWidth: 1, paddingLeft: 10 },
  shareMetaLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  shareMetaLabel: { fontSize: 9.5, lineHeight: 13, fontWeight: '600' },
  shareMetaValue: { flexShrink: 1, minWidth: 0, fontSize: 10.5, lineHeight: 15, fontWeight: '800' },
  shareIdRow: { minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 4 },
  shareSectionHeader: { marginTop: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shareSectionTitle: { fontSize: 15, fontWeight: '900' },
  shareSelectedCount: { fontSize: 13, fontWeight: '800' },
  shareInfo: { borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  shareInfoText: { flex: 1, fontSize: 11, lineHeight: 17, fontWeight: '600' },
  shareFieldList: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, overflow: 'hidden' },
  shareFieldRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shareFieldIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shareFieldMain: { flex: 1, minWidth: 0 },
  shareFieldLabel: { fontSize: 13, lineHeight: 17, fontWeight: '900' },
  shareFieldValue: { marginTop: 3, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  shareCheckbox: { width: 25, height: 25, borderRadius: 5, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  shareWarning: { borderWidth: 1, borderColor: '#FFD4D6', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: '#FFF7F7' },
  shareWarningText: { flex: 1, color: '#F0444C', fontSize: 11, lineHeight: 18, fontWeight: '700' },
  shareActions: { flexDirection: 'row', gap: 10 },
  shareCancelButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shareCancelText: { fontSize: 14, fontWeight: '900' },
  shareSubmitButton: { flex: 1.05, minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shareSubmitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  shareEncryption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12 },
  shareEncryptionText: { flexShrink: 1, fontSize: 10.5, lineHeight: 15, fontWeight: '600', textAlign: 'center' },
  shareQrScreenContent: { paddingTop: 4, paddingBottom: 30, gap: 15 },
  shareQrBrandHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7 },
  shareQrBrand: { flex: 1, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  shareQrHeaderSpacer: { width: 44, height: 44 },
  shareQrSubtitle: { marginTop: -5, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  shareQrCard: { borderWidth: 1, borderRadius: 19, padding: 16, alignItems: 'center' },
  connectionQrCard: { paddingTop: 3 },
  shareQrVerified: { minHeight: 28, borderRadius: 14, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAFBF3' },
  shareQrVerifiedText: { fontSize: 12, fontWeight: '800' },
  shareQrCredentialTitle: { marginTop: 11, fontSize: 23, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  shareQrIssuer: { marginTop: 5, fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center' },
  shareQrDidRow: { maxWidth: '88%', marginTop: 6, minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  shareQrDid: { flexShrink: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  shareQrCodeFrame: { marginTop: 13, width: 278, height: 278, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  shareQrLogo: { position: 'absolute', width: 52, height: 58, borderRadius: 16, backgroundColor: '#4A6CFF', borderWidth: 5, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  shareQrExpiry: { marginTop: 12, minHeight: 39, borderRadius: 20, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 6 },
  shareQrExpiryText: { fontSize: 11.5, fontWeight: '600' },
  shareQrExpiryTime: { fontSize: 12, fontWeight: '900' },
  shareQrActions: { flexDirection: 'row', gap: 8 },
  shareQrAction: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 4 },
  shareQrActionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  shareQrActionTitle: { marginTop: 8, fontSize: 13, lineHeight: 18, fontWeight: '900', textAlign: 'center' },
  shareQrActionDescription: { marginTop: 2, fontSize: 10.5, lineHeight: 15, fontWeight: '600', textAlign: 'center' },
  shareQrSafetyCard: { minHeight: 104, borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shareQrSafetyIcon: { width: 58, height: 66, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  shareQrSafetyMain: { flex: 1, minWidth: 0 },
  shareQrSafetyTitle: { fontSize: 13, lineHeight: 18, fontWeight: '900' },
  shareQrSafetyText: { marginTop: 5, fontSize: 10.5, lineHeight: 16, fontWeight: '600' },
  shareQrCancelCard: { minHeight: 85, borderWidth: 1, borderColor: '#FFD4D6', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF8F8' },
  shareQrCancelText: { flex: 1, color: '#F0444C', fontSize: 12, lineHeight: 19, fontWeight: '800' },
  profileHero: { alignItems: 'center' },
  profileAvatar: { width: 76, height: 76, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  profileName: { marginTop: 11, fontSize: 21, fontWeight: '900' },
  profileDid: { marginTop: 4, fontSize: 12 },
  formCard: { gap: 14 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '700' },
  inputWrap: { minHeight: 50, borderWidth: 1, borderRadius: 13, paddingLeft: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, minHeight: 48, fontSize: 16, paddingRight: 12 },
  securityScore: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  securityScoreIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#EAFDF4', alignItems: 'center', justifyContent: 'center' },
  securityMain: { flex: 1 },
  securityTitle: { fontSize: 16, fontWeight: '900' },
  securityText: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  settingsCard: { paddingVertical: 0 },
  settingRow: { minHeight: 79, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  settingMain: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '800' },
  settingDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  notificationScreenContent: { paddingTop: 7, paddingBottom: 26, gap: 16 },
  notificationTabs: { minHeight: 48, borderWidth: 1, borderRadius: 15, padding: 4, flexDirection: 'row' },
  notificationTab: { flex: 1, minHeight: 38, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  notificationTabText: { fontSize: 12, fontWeight: '700' },
  notificationTabDot: { width: 7, height: 7, borderRadius: 4 },
  notificationBanner: { minHeight: 112, borderWidth: 1, borderRadius: 17, padding: 14, paddingRight: 18, flexDirection: 'row', gap: 12 },
  notificationBannerIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  notificationBannerMain: { flex: 1, paddingRight: 2 },
  notificationBannerTitle: { fontSize: 14, lineHeight: 19, fontWeight: '800' },
  notificationBannerBody: { fontSize: 11, lineHeight: 16, marginTop: 5, paddingBottom: 36 },
  notificationBannerClose: { position: 'absolute', top: 9, right: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  notificationEnableButton: { position: 'absolute', right: 14, bottom: 13, minHeight: 36, borderRadius: 10, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  notificationEnableButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  notificationGroup: { gap: 10 },
  notificationGroupTitle: { fontSize: 14, fontWeight: '800' },
  notificationGroupList: { gap: 7 },
  notificationCard: { minHeight: 78, borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 12, elevation: 1, shadowOpacity: 0.035, shadowRadius: 8 },
  notificationIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notificationMain: { flex: 1, paddingTop: 1 },
  notificationTitle: { fontSize: 12.5, lineHeight: 17, fontWeight: '800' },
  notificationBody: { fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  notificationTrailing: { minWidth: 54, minHeight: 42, alignItems: 'flex-end', justifyContent: 'space-between' },
  notificationTime: { fontSize: 10.5, lineHeight: 15, fontWeight: '600', textAlign: 'right' },
  notificationUnreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
});
