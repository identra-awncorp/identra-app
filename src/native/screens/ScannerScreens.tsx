import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Flashlight,
  History,
  ImageUp,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  ScanLine,
  ShieldCheck,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppBrandLogo } from '../components/AppLogo';
import { IconButton, ScreenScroll } from '../components/ui';
import type { AppColors } from '../theme';

export function ScannerScreen({
  colors,
  onOpenActivity,
  onOpenMyQr,
  onOpenChat,
}: {
  colors: AppColors;
  onOpenActivity: () => void;
  onOpenMyQr: () => void;
  onOpenChat: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [zoom, setZoom] = useState(0);
  const requestedPermission = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !requestedPermission.current) {
      requestedPermission.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const showPendingMessage = (title: string) => {
    Alert.alert(title, 'Tính năng này sẽ được hoàn thiện trong phiên bản tiếp theo.');
  };

  return (
    <ScreenScroll id="screen-scanner" colors={colors} contentStyle={styles.screenContent}>
      <View style={styles.brandHeader}>
        <IconButton label="Mở menu" colors={colors}>
          <Menu color={colors.text} size={26} />
        </IconButton>
        <AppBrandLogo colors={colors} style={styles.brandLogo} />
        <IconButton label="Mở Chat" colors={colors} onPress={onOpenChat}>
          <MessageCircle color={colors.text} size={25} />
        </IconButton>
      </View>

      <View style={styles.intro}>
        <Text style={[styles.title, { color: colors.text }]}>Quét mã QR</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Quét mã QR để xác minh và chia sẻ thông tin
        </Text>
      </View>

      <View style={styles.cameraCard}>
        {permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} enableTorch={torchEnabled} zoom={zoom} />
        ) : (
          <View style={styles.permissionFallback}>
            <ScanLine color="#FFFFFF" size={48} strokeWidth={1.6} />
            <Text style={styles.permissionTitle}>Cho phép truy cập camera</Text>
            <Text style={styles.permissionText}>Camera được dùng để hiển thị mã QR trong khung quét.</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cho phép truy cập camera"
              onPress={() => void requestPermission()}
              style={({ pressed }) => [styles.permissionButton, { opacity: pressed ? 0.72 : 1 }]}
            >
              <Text style={styles.permissionButtonText}>Mở camera</Text>
            </Pressable>
          </View>
        )}

        <View pointerEvents="box-none" style={styles.cameraOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={torchEnabled ? 'Tắt đèn pin' : 'Bật đèn pin'}
            onPress={() => setTorchEnabled((current) => !current)}
            style={({ pressed }) => [
              styles.torchButton,
              torchEnabled && styles.torchButtonActive,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Flashlight color="#FFFFFF" size={19} fill={torchEnabled ? '#FFFFFF' : 'none'} />
            <Text style={styles.torchText}>{torchEnabled ? 'Tắt đèn pin' : 'Bật đèn pin'}</Text>
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
              accessibilityLabel="Thu nhỏ camera"
              onPress={() => setZoom((current) => Math.max(0, current - 0.1))}
              style={({ pressed }) => [styles.zoomButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Minus color="#FFFFFF" size={18} />
            </Pressable>
            <Text style={styles.zoomText}>{(1 + zoom * 4).toFixed(1)}x</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Phóng to camera"
              onPress={() => setZoom((current) => Math.min(1, current + 0.1))}
              style={({ pressed }) => [styles.zoomButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Plus color="#FFFFFF" size={18} />
            </Pressable>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Hoặc chọn hành động</Text>
      <View style={styles.actions}>
        <QuickAction
          colors={colors}
          icon={ImageUp}
          title="Chọn ảnh từ thư viện"
          description="Tải ảnh có mã QR"
          onPress={() => showPendingMessage('Chọn ảnh từ thư viện')}
        />
        <QuickAction
          colors={colors}
          icon={QrCode}
          title="Mã QR của tôi"
          description="Hiển thị mã QR cá nhân"
          onPress={onOpenMyQr}
        />
        <QuickAction
          colors={colors}
          icon={History}
          title="Lịch sử quét"
          description="Xem các lần quét gần đây"
          onPress={onOpenActivity}
        />
      </View>

      <View style={[styles.securityCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <View style={styles.securityIcon}>
          <ShieldCheck color="#FFFFFF" size={28} strokeWidth={2} />
        </View>
        <View style={styles.securityText}>
          <Text style={[styles.securityTitle, { color: colors.text }]}>An toàn & bảo mật</Text>
          <Text style={[styles.securityDescription, { color: colors.textSecondary }]}>
            Identra chỉ quét mã QR để xác minh. Chúng tôi không lưu trữ hay chia sẻ dữ liệu của bạn.
          </Text>
        </View>
      </View>
    </ScreenScroll>
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
  screenContent: { paddingTop: 2, paddingBottom: 24, gap: 14 },
  brandHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandLogo: { flex: 1 },
  intro: { paddingHorizontal: 1, gap: 3 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.65 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  cameraCard: { width: '100%', aspectRatio: 0.94, borderRadius: 18, overflow: 'hidden', backgroundColor: '#11151D' },
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
  permissionTitle: { color: '#FFFFFF', marginTop: 14, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  permissionText: { color: 'rgba(255,255,255,0.72)', marginTop: 7, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  permissionButton: { marginTop: 16, minHeight: 44, borderRadius: 999, backgroundColor: '#355CFF', paddingHorizontal: 22, justifyContent: 'center' },
  permissionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  torchButton: { minHeight: 44, borderRadius: 999, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(4, 7, 12, 0.62)' },
  torchButtonActive: { backgroundColor: 'rgba(53, 92, 255, 0.88)' },
  torchText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  scannerFrame: { width: '70%', aspectRatio: 1, justifyContent: 'center' },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#4F73FF' },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  cornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  cornerBottomRight: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 12 },
  scanLine: { height: 2, marginHorizontal: -3, borderRadius: 2, backgroundColor: '#4F73FF' },
  zoomControl: { minHeight: 44, borderRadius: 999, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(4, 7, 12, 0.66)' },
  zoomButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  zoomText: { minWidth: 36, color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { marginTop: 2, fontSize: 17, fontWeight: '800', letterSpacing: -0.25 },
  actions: { flexDirection: 'row', gap: 8 },
  actionCard: { flex: 1, minWidth: 0, minHeight: 132, borderWidth: 1, borderRadius: 16, paddingHorizontal: 7, paddingVertical: 12, alignItems: 'center' },
  actionIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { marginTop: 9, fontSize: 11, lineHeight: 15, fontWeight: '800', textAlign: 'center' },
  actionDescription: { marginTop: 4, fontSize: 9.5, lineHeight: 13, fontWeight: '500', textAlign: 'center' },
  securityCard: { minHeight: 92, borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  securityIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#355CFF', alignItems: 'center', justifyContent: 'center' },
  securityText: { flex: 1 },
  securityTitle: { fontSize: 14, fontWeight: '900' },
  securityDescription: { marginTop: 4, fontSize: 10.5, lineHeight: 16 },
});
