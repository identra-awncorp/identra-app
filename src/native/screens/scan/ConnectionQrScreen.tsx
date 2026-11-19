import QRCode from 'react-native-qrcode-svg';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ChevronRight, Download, LockKeyhole, RefreshCw, Share2, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import type { AppColors } from '../../theme';
import { palette } from '../../theme';
import { useI18n } from '../../i18n';
import {
  createTemporaryQrReference,
  getTemporaryQrRemainingSeconds,
  serializeTemporaryQrReference,
} from '../../domain/credentials/credentialSharing';
import { IconButton, ScreenScroll } from '../../components/AppUiPrimitives';
import { styles } from '../shared/DetailScreenSharedStyles';

// The scanner's "my QR" connection invitation (not a credential presentation; credentials are
// shared only by scanning a verifier's QR code, screens/identity/present).
export function ConnectionQrScreen({
  colors,
  createdAt: initialCreatedAt,
  onBack,
  onRefresh,
  onCancel,
}: {
  colors: AppColors;
  createdAt: number;
  onBack: () => void;
  onRefresh: (createdAt: number) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [createdAt, setCreatedAt] = useState(initialCreatedAt);
  const [remaining, setRemaining] = useState(() => getTemporaryQrRemainingSeconds(initialCreatedAt, Date.now()));
  const qrValue = useMemo(() => serializeTemporaryQrReference(createTemporaryQrReference({ createdAt, purpose: 'connection-invitation' })), [createdAt]);

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
