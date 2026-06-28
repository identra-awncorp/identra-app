import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
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
  Heart,
  History,
  IdCard,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Medal,
  MoreVertical,
  Phone,
  RefreshCw,
  ScanLine,
  Settings,
  Share2,
  ShieldCheck,
  Ticket,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { assetManifest } from '../../../assets/assetManifest';
import type { AppColors } from '../../../theme';
import { border, componentSize, palette, radius, spacing, touchTarget, typography } from '../../../theme';
import type { AppSettings, Credential, PersonalInfo, SmartContractFeedPost } from '../../../types';
import {
  notificationItems,
  notificationTabs,
  type NotificationFilter,
  type NotificationItem,
} from '../../../data/demo/newsFeedNotificationDemoData';
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
} from '../../../components/AppUiPrimitives';
import { styles } from '../../shared/DetailScreenSharedStyles';

const verifiedBadgeIcon = assetManifest.badges.verified;
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
            <ShieldCheck color={palette.white} size={37} strokeWidth={2.4} />
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
                {checked ? <Check color={palette.white} size={16} strokeWidth={3} /> : null}
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
          {loading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.shareSubmitText}>Chia sẻ</Text>}
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
          <QRCode value={qrValue} size={238} backgroundColor={palette.white} color="#050505" ecl="H" />
          <View style={styles.shareQrLogo}>
            <ShieldCheck color={palette.white} size={25} />
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
          <LockKeyhole color={palette.white} size={25} />
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
          <QRCode value={qrValue} size={238} backgroundColor={palette.white} color="#050505" ecl="H" />
          <View style={styles.shareQrLogo}>
            <ShieldCheck color={palette.white} size={25} />
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
          <LockKeyhole color={palette.white} size={25} />
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
