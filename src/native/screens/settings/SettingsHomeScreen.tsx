import {
  Bell,
  CheckCircle2,
  CircleHelp,
  CloudUpload,
  Database,
  Eye,
  Info,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Settings2,
  ShieldCheck,
} from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import { AppBrandLogo } from '../../components/AppLogo';
import { Card, ListChevron, ScreenScroll } from '../../components/AppUiPrimitives';
import type { AppColors } from '../../theme';
import { settingsStyles as styles } from './settingsStyles';
import { SettingsLink } from './components/SettingsLink';

export function SettingsScreen({
  colors,
  onOpenBackup,
  onOpenDisplay,
  onOpenSecurity,
  onOpenGovernance,
  onOpenNotifications,
  onOpenSharing,
  onOpenData,
  onOpenActivity,
  onOpenHelp,
  onOpenAbout,
  onOpenChat,
}: {
  colors: AppColors;
  onOpenBackup: () => void;
  onOpenDisplay: () => void;
  onOpenSecurity: () => void;
  onOpenGovernance: () => void;
  onOpenNotifications: () => void;
  onOpenSharing: () => void;
  onOpenData: () => void;
  onOpenActivity: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onOpenChat: () => void;
}) {
  const confirmLogout = () =>
    Alert.alert('Đăng xuất khỏi Identra?', 'Dữ liệu trong ví vẫn được bảo vệ trên thiết bị này.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive' },
    ]);

  return (
    <ScreenScroll id="screen-settings-main" colors={colors} contentStyle={styles.settingsScreenContent}>
      <View style={styles.settingsBrandHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mở menu" style={styles.settingsHeaderButton}>
          <Menu color={colors.text} size={26} strokeWidth={1.8} />
        </Pressable>
        <AppBrandLogo colors={colors} style={styles.settingsBrandLogo} />
        <Pressable accessibilityRole="button" accessibilityLabel="Mở Chat" onPress={onOpenChat} style={styles.settingsHeaderButton}>
          <MessageCircle color={colors.text} size={25} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.settingsIntro}>
        <Text style={[styles.settingsScreenTitle, { color: colors.text }]}>Cài đặt</Text>
        <Text style={[styles.settingsScreenSubtitle, { color: colors.textSecondary }]}>Quản lý tài khoản và tùy chọn của bạn</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onOpenBackup}
        style={({ pressed }) => [
          styles.backupCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
        ]}
      >
        <View style={[styles.backupIcon, { backgroundColor: colors.surfaceMuted }]}>
          <CloudUpload color={colors.primaryDark} size={40} strokeWidth={1.7} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.backupTitle, { color: colors.text }]}>Backup</Text>
          <Text style={[styles.backupDescription, { color: colors.textSecondary }]}>Sao lưu và khôi phục dữ liệu ví Identra của bạn</Text>
          <View style={styles.backupStatus}>
            <CheckCircle2 color={colors.success} size={14} fill={colors.success} />
            <Text style={[styles.backupStatusText, { color: colors.success }]}>Đã sao lưu gần nhất: 20/06/2024 10:30</Text>
          </View>
        </View>
        <ListChevron colors={colors} />
      </Pressable>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Tài khoản</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={Eye} title="Quản lý hiển thị" description="Quản lý thông tin hiển thị và danh tính của bạn" onPress={onOpenDisplay} />
        <SettingsLink colors={colors} icon={ShieldCheck} title="Bảo mật" description="Mật khẩu, xác thực và bảo mật tài khoản" onPress={onOpenSecurity} divider />
        <SettingsLink colors={colors} icon={Settings2} title="Cài đặt khung quản trị" description="Quản lý và cấu hình khung quản trị của bạn" onPress={onOpenGovernance} divider />
        <SettingsLink colors={colors} icon={Bell} title="Thông báo" description="Tùy chọn thông báo và cập nhật" onPress={onOpenNotifications} divider />
      </Card>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Quyền riêng tư</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={LockKeyhole} title="Quyền chia sẻ dữ liệu" description="Quản lý dữ liệu bạn chia sẻ với bên thứ ba" onPress={onOpenSharing} />
        <SettingsLink colors={colors} icon={Database} title="Dữ liệu của bạn" description="Xem, tải xuống hoặc xóa dữ liệu cá nhân" onPress={onOpenData} divider />
        <SettingsLink colors={colors} icon={Eye} title="Lịch sử hoạt động" description="Xem lại các hoạt động và sự kiện" onPress={onOpenActivity} divider />
      </Card>

      <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Hỗ trợ & khác</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={CircleHelp} title="Trung tâm hỗ trợ" description="Câu hỏi thường gặp và hướng dẫn" onPress={onOpenHelp} />
        <SettingsLink colors={colors} icon={Info} title="Giới thiệu về Identra" description="Phiên bản, điều khoản và chính sách" onPress={onOpenAbout} divider />
      </Card>

      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={LogOut} title="Đăng xuất" description="" onPress={confirmLogout} danger />
      </Card>
    </ScreenScroll>
  );
}
