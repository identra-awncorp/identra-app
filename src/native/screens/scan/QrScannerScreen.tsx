import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Flashlight,
  History,
  ImageUp,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  ScanLine,
  ShieldCheck,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainTopHeader } from '../../components/MainTopHeader';
import { ScreenScroll } from '../../components/AppUiPrimitives';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, typography } from '../../theme';

export function QrScannerScreen({
  active = true,
  colors,
  onOpenActivity,
  onOpenMyQr,
  onOpenChat,
  onOpenMenu,
}: {
  active?: boolean;
  colors: AppColors;
  onOpenActivity: () => void;
  onOpenMyQr: () => void;
  onOpenChat: () => void;
  onOpenMenu: () => void;
}) {
  const { t } = useI18n();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [zoom, setZoom] = useState(0);
  const requestedPermission = useRef(false);

  useEffect(() => {
    if (active && permission && !permission.granted && permission.canAskAgain && !requestedPermission.current) {
      requestedPermission.current = true;
      void requestPermission();
    }
  }, [active, permission, requestPermission]);

  const showPendingMessage = (title: string) => {
    Alert.alert(title, t('scan.pendingDescription'));
  };

  return (
    <View nativeID="screen-scanner" testID="screen-scanner" style={[styles.screen, { backgroundColor: colors.background }]}>
      <MainTopHeader
        colors={colors}
        menuLabel={t('scan.openMenu')}
        onOpenMenu={onOpenMenu}
        actions={[
          {
            key: 'history',
            label: t('scan.history.title'),
            icon: History,
            onPress: onOpenActivity,
          },
          {
            key: 'chat',
            label: t('scan.openChat'),
            icon: MessageCircle,
            onPress: onOpenChat,
          },
        ]}
      />

      <ScreenScroll id="screen-scanner-content" colors={colors} contentStyle={styles.screenContent} includeTopInset={false}>
        <View style={styles.intro}>
          <Text style={[styles.title, { color: colors.text }]}>{t('scan.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('scan.subtitle')}
          </Text>
        </View>

        <View style={styles.cameraCard}>
          {active && permission?.granted ? (
            <CameraView style={StyleSheet.absoluteFill} enableTorch={torchEnabled} zoom={zoom} />
          ) : (
            <View style={styles.permissionFallback}>
              <ScanLine color={palette.white} size={48} strokeWidth={1.6} />
              <Text style={styles.permissionTitle}>{t('scan.permissionTitle')}</Text>
              <Text style={styles.permissionText}>{t('scan.permissionDescription')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('scan.permissionTitle')}
                onPress={() => void requestPermission()}
                style={({ pressed }) => [styles.permissionButton, { opacity: pressed ? 0.72 : 1 }]}
              >
                <Text style={styles.permissionButtonText}>{t('scan.openCamera')}</Text>
              </Pressable>
            </View>
          )}

          <View pointerEvents="box-none" style={styles.cameraOverlay}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={torchEnabled ? t('scan.torchOff') : t('scan.torchOn')}
              onPress={() => setTorchEnabled((current) => !current)}
              style={({ pressed }) => [
                styles.torchButton,
                torchEnabled && styles.torchButtonActive,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Flashlight color={palette.white} size={19} fill={torchEnabled ? palette.white : 'none'} />
              <Text style={styles.torchText}>{torchEnabled ? t('scan.torchOff') : t('scan.torchOn')}</Text>
            </Pressable>

            <View pointerEvents="none" style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              <View style={styles.scanLine} />
            </View>

            <View style={styles.zoomControl}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('scan.zoomOut')}
                onPress={() => setZoom((current) => Math.max(0, current - 0.1))}
                style={({ pressed }) => [styles.zoomButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Minus color={palette.white} size={18} />
              </Pressable>
              <Text style={styles.zoomText}>{(1 + zoom * 4).toFixed(1)}x</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('scan.zoomIn')}
                onPress={() => setZoom((current) => Math.min(1, current + 0.1))}
                style={({ pressed }) => [styles.zoomButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Plus color={palette.white} size={18} />
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('scan.actionSection')}</Text>
        <View style={styles.actions}>
          <QuickAction
            colors={colors}
            icon={ImageUp}
            title={t('scan.pickImage.title')}
            description={t('scan.pickImage.description')}
            onPress={() => showPendingMessage(t('scan.pickImage.title'))}
          />
          <QuickAction
            colors={colors}
            icon={QrCode}
            title={t('scan.myQr.title')}
            description={t('scan.myQr.description')}
            onPress={onOpenMyQr}
          />
          <QuickAction
            colors={colors}
            icon={History}
            title={t('scan.history.title')}
            description={t('scan.history.description')}
            onPress={onOpenActivity}
          />
        </View>

        <View style={[styles.securityCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={styles.securityIcon}>
            <ShieldCheck color={palette.white} size={28} strokeWidth={2} />
          </View>
          <View style={styles.securityText}>
            <Text style={[styles.securityTitle, { color: colors.text }]}>{t('scan.securityTitle')}</Text>
            <Text style={[styles.securityDescription, { color: colors.textSecondary }]}>
              {t('scan.securityDescription')}
            </Text>
          </View>
        </View>
      </ScreenScroll>
    </View>
  );
}

function QuickAction({
  colors,
  icon: Icon,
  title,
  description,
  onPress,
}: {
  colors: AppColors;
  icon: typeof ImageUp;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Icon color={colors.primaryDark} size={23} strokeWidth={1.9} />
      </View>
      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.md + spacing.xxs },
  intro: { paddingHorizontal: 1, gap: 3 },
  title: { fontSize: typography.size.xl, lineHeight: 34, fontWeight: typography.weight.black, letterSpacing: -0.65 },
  subtitle: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm },
  cameraCard: { width: '100%', aspectRatio: 0.94, borderRadius: radius.lg + 2, overflow: 'hidden', backgroundColor: '#11151D' },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 22,
    paddingBottom: 20,
    backgroundColor: 'rgba(3, 7, 14, 0.26)',
  },
  permissionFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, backgroundColor: '#252B35' },
  permissionTitle: { color: palette.white, marginTop: 14, fontSize: 17, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  permissionText: { color: 'rgba(255,255,255,0.72)', marginTop: 7, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  permissionButton: { marginTop: spacing.lg, minHeight: 44, borderRadius: radius.round, backgroundColor: palette.blue[700], paddingHorizontal: 22, justifyContent: 'center' },
  permissionButtonText: { color: palette.white, fontSize: 13, fontWeight: typography.weight.extraBold },
  torchButton: { minHeight: 44, borderRadius: radius.round, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(4, 7, 12, 0.62)' },
  torchButtonActive: { backgroundColor: 'rgba(53, 92, 255, 0.88)' },
  torchText: { color: palette.white, fontSize: 13, fontWeight: typography.weight.bold },
  scannerFrame: { width: '70%', aspectRatio: 1, justifyContent: 'center' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#4F73FF' },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  cornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  cornerBottomRight: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 12 },
  scanLine: { height: 2, marginHorizontal: -3, borderRadius: 2, backgroundColor: '#4F73FF' },
  zoomControl: { minHeight: 44, borderRadius: radius.round, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(4, 7, 12, 0.66)' },
  zoomButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  zoomText: { minWidth: 36, color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.bold, textAlign: 'center' },
  sectionTitle: { marginTop: spacing.xxs, fontSize: 17, fontWeight: typography.weight.extraBold, letterSpacing: -0.25 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionCard: { flex: 1, minWidth: 0, minHeight: 132, borderWidth: border.thin, borderRadius: radius.lg, paddingHorizontal: 7, paddingVertical: spacing.md, alignItems: 'center' },
  actionIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { marginTop: 9, fontSize: 11, lineHeight: 15, fontWeight: typography.weight.extraBold, textAlign: 'center' },
  actionDescription: { marginTop: 4, fontSize: 9.5, lineHeight: 13, fontWeight: '500', textAlign: 'center' },
  securityCard: { minHeight: 92, borderWidth: border.thin, borderRadius: radius.lg + 2, padding: 13, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  securityIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: palette.blue[700], alignItems: 'center', justifyContent: 'center' },
  securityText: { flex: 1 },
  securityTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  securityDescription: { marginTop: 4, fontSize: 10.5, lineHeight: 16 },
});
