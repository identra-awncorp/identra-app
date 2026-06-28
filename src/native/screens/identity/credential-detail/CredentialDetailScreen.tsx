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
import { useI18n } from '../../../i18n';
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
  const { t } = useI18n();
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
    verified: { label: t('identity.detail.statuses.verified.label'), description: t('identity.detail.statuses.verified.description'), color: colors.success, background: palette.green[100] },
    pending: { label: t('identity.detail.statuses.pending.label'), description: t('identity.detail.statuses.pending.description'), color: colors.warning, background: '#FFF3E8' },
    expired: { label: t('identity.detail.statuses.expired.label'), description: t('identity.detail.statuses.expired.description'), color: colors.danger, background: palette.red[100] },
  }[credential.status];

  const copyDid = async () => {
    await Clipboard.setStringAsync(credentialId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenScroll id="screen-credential-detail" colors={colors} contentStyle={styles.detailScreenContent}>
      <AppHeader
        colors={colors}
        title={t('identity.detail.title')}
        onBack={onBack}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('identity.detail.shareCredential')}
            onPress={onShare}
            style={({ pressed }) => [
              styles.detailShareButton,
              { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Share2 color={colors.primaryDark} size={18} />
            <Text style={[styles.detailShareText, { color: colors.primaryDark }]}>{t('common.share')}</Text>
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
              <Text style={[styles.detailCategoryText, { color: colors.primaryDark }]}>{t('identity.detail.categoryEducation')}</Text>
            </View>
          </View>
          <View style={[styles.detailShieldArt, { backgroundColor: colors.primary }]}>
            <ShieldCheck color={palette.white} size={40} strokeWidth={2.2} />
          </View>
        </View>

        <View style={[styles.detailDateGrid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.detailDateColumn}>
            <Text style={[styles.detailMetaLabel, { color: colors.textSecondary }]}>{t('identity.detail.issueDate')}</Text>
            <View style={styles.detailMetaValueRow}>
              <CalendarDays color={colors.textSecondary} size={16} />
              <Text style={[styles.detailMetaValue, { color: colors.text }]}>{credential.issueDate} {credential.time ?? ''}</Text>
            </View>
          </View>
          <View style={[styles.detailDateColumn, styles.detailDateColumnDivider, { borderLeftColor: colors.border }]}>
            <Text style={[styles.detailMetaLabel, { color: colors.textSecondary }]}>{t('identity.detail.expiryDate')}</Text>
            <View style={styles.detailMetaValueRow}>
              <CalendarDays color={colors.textSecondary} size={16} />
              <Text style={[styles.detailMetaValue, { color: colors.text }]}>{credential.expiryDate ?? t('identity.detail.noExpiry')}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.detailMetaLabel, { color: colors.textSecondary }]}>{t('identity.detail.credentialId')}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('identity.detail.copyId')} onPress={copyDid} style={styles.detailIdRow}>
          <Text numberOfLines={1} style={[styles.detailIdValue, { color: colors.text }]}>{credentialId}</Text>
          <ClipboardCopy color={colors.textSecondary} size={19} />
        </Pressable>
      </View>

      <Card colors={colors} style={styles.detailIssuerCard}>
        <Text style={[styles.detailCardHeading, { color: colors.text }]}>{t('identity.detail.issuerSection')}</Text>
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
              {t('identity.detail.issuerDescription')}
            </Text>
          </View>
          <ChevronRight color={colors.textSecondary} size={21} />
        </View>
      </Card>

      <Text style={[styles.detailSectionTitle, { color: colors.text }]}>{t('identity.detail.detailSection')}</Text>
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
          title: t('identity.detail.actions.proofTitle'),
          description: t('identity.detail.actions.proofDescription'),
          message: t('identity.detail.actions.proofMessage', { signature: credential.signature }),
        },
        {
          icon: History,
          title: t('identity.detail.actions.historyTitle'),
          description: t('identity.detail.actions.historyDescription'),
          message: t('identity.detail.actions.historyMessage', { issuedAt: `${credential.issueDate} ${credential.time ?? ''}`.trim() }),
        },
        {
          icon: Info,
          title: t('identity.detail.actions.technicalTitle'),
          description: t('identity.detail.actions.technicalDescription'),
          message: t('identity.detail.actions.technicalMessage', { did: credential.didIssuer }),
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
