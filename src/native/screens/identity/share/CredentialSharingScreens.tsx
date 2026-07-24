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
  Download,
  GraduationCap,
  IdCard,
  Info,
  LockKeyhole,
  Medal,
  RefreshCw,
  Share2,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import type { AppColors } from '../../../theme';
import { palette } from '../../../theme';
import type { Credential } from '../../../types';
import { useI18n } from '../../../i18n';
import {
  createTemporaryQrReference,
  getTemporaryQrRemainingSeconds,
  selectApprovedCredentialAttributes,
  serializeTemporaryQrReference,
} from '../../../domain/credentials/credentialSharing';
import { formatDidForDisplay } from '../../../domain/credentials/credentialDisplay';


import {
  AppHeader,
  CredentialIcon,
  IconButton,
  ScreenScroll,
} from '../../../components/AppUiPrimitives';
import { styles } from '../../shared/DetailScreenSharedStyles';

const SHARING_AUTO_LOCK_MS = 60 * 1000;

export function ShareScreen({
  colors,
  credential,
  autoLockEnabled = false,
  confirmBeforeShare = true,
  onBack,
  onAutoLock,
  onShared,
}: {
  colors: AppColors;
  credential: Credential;
  autoLockEnabled?: boolean;
  confirmBeforeShare?: boolean;
  onBack: () => void;
  onAutoLock?: () => void;
  onShared: (selected: Credential['attributes']) => void;
}) {
  const { t } = useI18n();
  const credentialId = `did:identra:vc:${credential.id}`;
  const fields = useMemo(
    () =>
      credential.attributes.map((attribute, index) => ({
        ...attribute,
        icon: [UserRound, CalendarDays, GraduationCap, Building2, Award, BookOpen, Medal, IdCard][index % 8],
        highlight: attribute.key === 'degree.classification',
      })),
    [credential],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!autoLockEnabled || loading || !onAutoLock) return undefined;

    const timer = setTimeout(onAutoLock, SHARING_AUTO_LOCK_MS);
    return () => clearTimeout(timer);
  }, [autoLockEnabled, loading, onAutoLock, selected]);

  const completeShare = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onShared(selectApprovedCredentialAttributes(credential.attributes, selected));
    }, 650);
  };

  const submit = () => {
    if (!selected.length) return;

    if (!confirmBeforeShare) {
      completeShare();
      return;
    }

    Alert.alert(
      t('identity.share.confirmTitle'),
      t('identity.share.confirmDescription', { count: selected.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.share'), onPress: completeShare },
      ],
    );
  };

  const copyCredentialId = async () => {
    await Clipboard.setStringAsync(credentialId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenScroll id="screen-share-credential" colors={colors} contentStyle={styles.shareScreenContent}>
      <AppHeader colors={colors} title={t('identity.share.title')} onBack={onBack} />

      <View style={styles.shareStatusIntro}>
        <View style={styles.shareVerifiedPill}>
          <CheckCircle2 color={colors.success} fill={colors.success} size={15} />
          <Text style={[styles.shareVerifiedText, { color: colors.success }]}>{t('identity.share.verified')}</Text>
        </View>
        <Text style={[styles.shareStatusDescription, { color: colors.textSecondary }]}>
          {t('identity.share.description')}
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
              <Text style={[styles.shareCategoryText, { color: colors.primaryDark }]}>{t('identity.share.categoryEducation')}</Text>
            </View>
          </View>
          <View style={[styles.shareShieldArt, { backgroundColor: colors.primary }]}>
            <ShieldCheck color={palette.white} size={37} strokeWidth={2.4} />
          </View>
        </View>
        <View style={[styles.shareMetaGrid, { borderTopColor: colors.border }]}>
          <ShareMeta icon={CalendarDays} label={t('identity.share.issueDate')} value={`${credential.issueDate} ${credential.time ?? ''}`} colors={colors} />
          <ShareMeta icon={CalendarDays} label={t('identity.share.expiryDate')} value={credential.expiryDate ?? t('identity.share.noExpiry')} colors={colors} divider />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('identity.share.copyCredentialId')}
            onPress={copyCredentialId}
            style={[styles.shareMetaItem, styles.shareMetaDivider, { borderLeftColor: colors.border }]}
          >
            <Text style={[styles.shareMetaLabel, { color: colors.textSecondary }]}>{t('identity.share.credentialId')}</Text>
            <View style={styles.shareIdRow}>
              <Text numberOfLines={1} style={[styles.shareMetaValue, { color: colors.text }]}>{credentialId}</Text>
              <ClipboardCopy color={colors.textSecondary} size={15} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.shareSectionHeader}>
        <Text style={[styles.shareSectionTitle, { color: colors.text }]}>{t('identity.share.selectInfo')}</Text>
        <Text style={[styles.shareSelectedCount, { color: colors.primaryDark }]}>
          {t('identity.share.selectedCount', { selected: selected.length, total: fields.length })}
        </Text>
      </View>

      <View style={[styles.shareInfo, { backgroundColor: colors.surfaceMuted }]}>
        <Info color={colors.primaryDark} size={21} />
        <Text style={[styles.shareInfoText, { color: colors.textSecondary }]}>
          {t('identity.share.info')}
        </Text>
      </View>

      <View style={[styles.shareFieldList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {fields.map((field, index) => {
          const checked = selected.includes(field.key);
          const Icon = field.icon;
          return (
            <Pressable
              key={field.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={field.label}
              onPress={() =>
                setSelected((current) =>
                  checked ? current.filter((key) => key !== field.key) : [...current, field.key],
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
          {t('identity.share.warning')}
        </Text>
      </View>

      <View style={styles.shareActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('identity.share.cancelAccessibility')}
          onPress={onBack}
          style={({ pressed }) => [styles.shareCancelButton, { borderColor: colors.textSecondary, opacity: pressed ? 0.68 : 1 }]}
        >
          <Text style={[styles.shareCancelText, { color: colors.text }]}>{t('common.cancel')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('identity.share.submitAccessibility')}
          disabled={!selected.length || loading}
          onPress={submit}
          style={({ pressed }) => [
            styles.shareSubmitButton,
            { backgroundColor: colors.primaryDark, opacity: pressed || !selected.length ? 0.58 : 1 },
          ]}
        >
          {loading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.shareSubmitText}>{t('common.share')}</Text>}
        </Pressable>
      </View>

      <View style={styles.shareEncryption}>
        <LockKeyhole color={colors.textSecondary} size={15} />
        <Text style={[styles.shareEncryptionText, { color: colors.textSecondary }]}>
          {t('identity.share.encrypted')}
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
  autoLockEnabled = false,
  compactDid = false,
  onBack,
  onAutoLock,
  onCancel,
}: {
  colors: AppColors;
  credential: Credential;
  attributes: Credential['attributes'];
  autoLockEnabled?: boolean;
  compactDid?: boolean;
  onBack: () => void;
  onAutoLock?: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [createdAt, setCreatedAt] = useState(Date.now());
  const [remaining, setRemaining] = useState(() => getTemporaryQrRemainingSeconds(createdAt, Date.now()));
  const did = credential.didHolder;
  const presentationRequest = useMemo(
    () => ({
      approvedAttributeKeys: attributes.map((attribute) => attribute.key),
      credentialId: credential.id,
      reference: createTemporaryQrReference({
        createdAt,
        purpose: 'credential-presentation',
      }),
    }),
    [attributes, createdAt, credential.id],
  );
  const qrValue = serializeTemporaryQrReference(presentationRequest.reference);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getTemporaryQrRemainingSeconds(createdAt, Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  useEffect(() => {
    if (!autoLockEnabled || !onAutoLock) return undefined;

    const timer = setTimeout(onAutoLock, SHARING_AUTO_LOCK_MS);
    return () => clearTimeout(timer);
  }, [autoLockEnabled, createdAt, onAutoLock]);

  const refresh = () => {
    const nextCreatedAt = Date.now();
    setCreatedAt(nextCreatedAt);
    setRemaining(getTemporaryQrRemainingSeconds(nextCreatedAt, nextCreatedAt));
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
        <IconButton label={t('identity.share.qr.back')} colors={colors} onPress={onBack}>
          <ArrowLeft color={colors.text} size={25} />
        </IconButton>
        <Text style={[styles.shareQrBrand, { color: colors.text }]}>{t('identity.share.qr.title')}</Text>
        <View style={styles.shareQrHeaderSpacer} />
      </View>

      <Text style={[styles.shareQrSubtitle, { color: colors.textSecondary }]}>
        {t('identity.share.qr.subtitle')}
      </Text>

      <View style={[styles.shareQrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.shareQrVerified}>
          <CheckCircle2 color={colors.success} fill={colors.success} size={15} />
          <Text style={[styles.shareQrVerifiedText, { color: colors.success }]}>{t('identity.share.verified')}</Text>
        </View>
        <Text style={[styles.shareQrCredentialTitle, { color: colors.text }]}>{credential.title}</Text>
        <Text style={[styles.shareQrIssuer, { color: colors.textSecondary }]}>{credential.issuer}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('identity.share.qr.copyDid')} onPress={copyDid} style={styles.shareQrDidRow}>
          <Text numberOfLines={1} style={[styles.shareQrDid, { color: colors.textSecondary }]}>DID: {formatDidForDisplay(did, compactDid)}</Text>
          <ClipboardCopy color={colors.textSecondary} size={16} />
        </Pressable>

        <View style={styles.shareQrCodeFrame}>
          {remaining > 0 ? (
            <>
              <QRCode value={qrValue} size={238} backgroundColor={palette.white} color="#050505" ecl="H" />
              <View style={styles.shareQrLogo}>
                <ShieldCheck color={palette.white} size={25} />
              </View>
            </>
          ) : (
            <View style={styles.shareQrExpired}>
              <RefreshCw color={colors.danger} size={42} />
              <Text style={[styles.shareQrExpiredTitle, { color: colors.danger }]}>{t('identity.share.qr.expiredTitle')}</Text>
              <Text style={[styles.shareQrExpiredText, { color: colors.textSecondary }]}>{t('identity.share.qr.expiredDescription')}</Text>
            </View>
          )}
        </View>

        <View style={[styles.shareQrExpiry, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={17} />
          <Text style={[styles.shareQrExpiryText, { color: colors.textSecondary }]}>{t('identity.share.qr.expiry')}</Text>
          <Text style={[styles.shareQrExpiryTime, { color: remaining ? colors.primaryDark : colors.danger }]}>
            {minutes}:{seconds}
          </Text>
        </View>
      </View>

      <View style={styles.shareQrActions}>
        <QrAction
          colors={colors}
          icon={Share2}
          title={t('identity.share.qr.shareTitle')}
          description={t('identity.share.qr.shareDescription')}
          disabled={remaining === 0}
          onPress={() => Alert.alert(t('identity.share.qr.shareAlertTitle'), t('identity.share.qr.shareAlertDescription'))}
        />
        <QrAction
          colors={colors}
          icon={Download}
          title={t('identity.share.qr.downloadTitle')}
          description={t('identity.share.qr.downloadDescription')}
          disabled={remaining === 0}
          onPress={() => Alert.alert(t('identity.share.qr.downloadAlertTitle'), t('identity.share.qr.downloadAlertDescription'))}
        />
        <QrAction colors={colors} icon={RefreshCw} title={t('identity.share.qr.refreshTitle')} description={t('identity.share.qr.refreshDescription')} onPress={refresh} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert(t('identity.share.qr.safetyAlertTitle'), t('identity.share.qr.safetyAlertDescription'))}
        style={({ pressed }) => [
          styles.shareQrSafetyCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View style={[styles.shareQrSafetyIcon, { backgroundColor: colors.primary }]}>
          <LockKeyhole color={palette.white} size={25} />
        </View>
        <View style={styles.shareQrSafetyMain}>
          <Text style={[styles.shareQrSafetyTitle, { color: colors.text }]}>{t('identity.share.qr.safetyTitle')}</Text>
          <Text style={[styles.shareQrSafetyText, { color: colors.textSecondary }]}>
            {t('identity.share.qr.safetyText')}
          </Text>
        </View>
        <ChevronRight color={colors.textSecondary} size={22} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('identity.share.qr.cancelLabel')}
        onPress={() =>
          Alert.alert(t('identity.share.qr.cancelTitle'), t('identity.share.qr.cancelDescription'), [
            { text: t('identity.share.qr.keepUsing'), style: 'cancel' },
            { text: t('identity.share.qr.cancelAction'), style: 'destructive', onPress: onCancel },
          ])
        }
        style={({ pressed }) => [styles.shareQrCancelCard, { opacity: pressed ? 0.7 : 1 }]}
      >
        <AlertTriangle color={colors.danger} size={25} strokeWidth={2.4} />
        <Text style={styles.shareQrCancelText}>{t('identity.share.qr.cancelWarning')}</Text>
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
  const { t } = useI18n();
  const [createdAt, setCreatedAt] = useState(initialCreatedAt);
  const [remaining, setRemaining] = useState(() => getTemporaryQrRemainingSeconds(initialCreatedAt, Date.now()));
  const connectionRequest = useMemo(
    () => ({
      inviter: did,
      reference: createTemporaryQrReference({
        createdAt,
        purpose: 'connection-invitation',
      }),
    }),
    [createdAt, did],
  );
  const qrValue = serializeTemporaryQrReference(connectionRequest.reference);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getTemporaryQrRemainingSeconds(createdAt, Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  const refresh = () => {
    const nextCreatedAt = Date.now();
    setCreatedAt(nextCreatedAt);
    setRemaining(getTemporaryQrRemainingSeconds(nextCreatedAt, nextCreatedAt));
    onRefresh(nextCreatedAt);
  };

  const confirmBack = () => {
    Alert.alert(t('identity.share.qr.cancelTitle'), t('identity.share.qr.connectionCancelPrompt'), [
      { text: t('common.no'), style: 'cancel', onPress: onBack },
      { text: t('common.yes'), style: 'destructive', onPress: onCancel },
    ]);
  };

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');

  return (
    <ScreenScroll id="screen-connection-invitation-qr" colors={colors} contentStyle={styles.shareQrScreenContent}>
      <View style={styles.shareQrBrandHeader}>
        <IconButton label={t('identity.share.qr.back')} colors={colors} onPress={confirmBack}>
          <ArrowLeft color={colors.text} size={25} />
        </IconButton>
        <Text style={[styles.shareQrBrand, { color: colors.text }]}>{t('identity.share.qr.connectionTitle')}</Text>
        <View style={styles.shareQrHeaderSpacer} />
      </View>

      <Text style={[styles.shareQrSubtitle, { color: colors.textSecondary }]}>
        {t('identity.share.qr.connectionSubtitle')}
      </Text>

      <View style={[styles.shareQrCard, styles.connectionQrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.shareQrCodeFrame}>
          {remaining > 0 ? (
            <>
              <QRCode value={qrValue} size={238} backgroundColor={palette.white} color="#050505" ecl="H" />
              <View style={styles.shareQrLogo}>
                <ShieldCheck color={palette.white} size={25} />
              </View>
            </>
          ) : (
            <View style={styles.shareQrExpired}>
              <RefreshCw color={colors.danger} size={42} />
              <Text style={[styles.shareQrExpiredTitle, { color: colors.danger }]}>{t('identity.share.qr.expiredTitle')}</Text>
              <Text style={[styles.shareQrExpiredText, { color: colors.textSecondary }]}>{t('identity.share.qr.expiredDescription')}</Text>
            </View>
          )}
        </View>

        <View style={[styles.shareQrExpiry, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={17} />
          <Text style={[styles.shareQrExpiryText, { color: colors.textSecondary }]}>{t('identity.share.qr.expiry')}</Text>
          <Text style={[styles.shareQrExpiryTime, { color: remaining ? colors.primaryDark : colors.danger }]}>
            {minutes}:{seconds}
          </Text>
        </View>
      </View>

      <View style={styles.shareQrActions}>
        <QrAction
          colors={colors}
          icon={Share2}
          title={t('identity.share.qr.shareTitle')}
          description={t('identity.share.qr.shareDescription')}
          disabled={remaining === 0}
          onPress={() => Alert.alert(t('identity.share.qr.connectionShareAlertTitle'), t('identity.share.qr.connectionShareAlertDescription'))}
        />
        <QrAction
          colors={colors}
          icon={Download}
          title={t('identity.share.qr.downloadTitle')}
          description={t('identity.share.qr.downloadDescription')}
          disabled={remaining === 0}
          onPress={() => Alert.alert(t('identity.share.qr.downloadAlertTitle'), t('identity.share.qr.downloadAlertDescription'))}
        />
        <QrAction colors={colors} icon={RefreshCw} title={t('identity.share.qr.refreshTitle')} description={t('identity.share.qr.refreshDescription')} onPress={refresh} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert(t('identity.share.qr.connectionSafetyAlertTitle'), t('identity.share.qr.connectionSafetyAlertDescription'))}
        style={({ pressed }) => [
          styles.shareQrSafetyCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <View style={[styles.shareQrSafetyIcon, { backgroundColor: colors.primary }]}>
          <LockKeyhole color={palette.white} size={25} />
        </View>
        <View style={styles.shareQrSafetyMain}>
          <Text style={[styles.shareQrSafetyTitle, { color: colors.text }]}>{t('identity.share.qr.connectionSafetyTitle')}</Text>
          <Text style={[styles.shareQrSafetyText, { color: colors.textSecondary }]}>
            {t('identity.share.qr.connectionSafetyText')}
          </Text>
        </View>
        <ChevronRight color={colors.textSecondary} size={22} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('identity.share.qr.connectionCancelLabel')}
        onPress={() =>
          Alert.alert(t('identity.share.qr.connectionCancelTitle'), t('identity.share.qr.cancelDescription'), [
            { text: t('identity.share.qr.keepUsing'), style: 'cancel' },
            { text: t('identity.share.qr.connectionCancelAction'), style: 'destructive', onPress: onCancel },
          ])
        }
        style={({ pressed }) => [styles.shareQrCancelCard, { opacity: pressed ? 0.7 : 1 }]}
      >
        <AlertTriangle color={colors.danger} size={25} strokeWidth={2.4} />
        <Text style={styles.shareQrCancelText}>{t('identity.share.qr.connectionCancelWarning')}</Text>
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
  disabled = false,
  onPress,
}: {
  colors: AppColors;
  icon: LucideIcon;
  title: string;
  description: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.shareQrAction, { opacity: disabled ? 0.4 : pressed ? 0.65 : 1 }]}
    >
      <View style={[styles.shareQrActionIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Icon color={colors.primaryDark} size={25} strokeWidth={1.8} />
      </View>
      <Text style={[styles.shareQrActionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.shareQrActionDescription, { color: colors.textSecondary }]}>{description}</Text>
    </Pressable>
  );
}
