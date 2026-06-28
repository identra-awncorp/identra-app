import { Download, FileText, HardDrive, Trash2 } from 'lucide-react-native';
import { Alert, Text } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import type { AppColors } from '../../../theme';
import { SettingsLink } from '../components/SettingsLink';
import { settingsStyles as styles } from '../settingsStyles';

export function DataSettingsScreen({
  colors,
  onBack,
  onClearDemo,
  onResetDemo,
}: {
  colors: AppColors;
  onBack: () => void;
  onClearDemo: () => void;
  onResetDemo: () => void;
}) {
  const confirmClear = () =>
    Alert.alert('Xóa dữ liệu demo?', 'Các danh sách sẽ chuyển sang trạng thái không có dữ liệu.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa dữ liệu demo', style: 'destructive', onPress: onClearDemo },
    ]);

  return (
    <ScreenScroll id="screen-settings-data" colors={colors}>
      <AppHeader colors={colors} title="Dữ liệu của bạn" onBack={onBack} />
      <Text style={[styles.sampleSettingsDescription, { color: colors.textSecondary }]}>Xem, tải xuống hoặc quản lý dữ liệu cá nhân được lưu trong ứng dụng.</Text>
      <Card colors={colors} style={styles.settingsList}>
        <SettingsLink colors={colors} icon={FileText} title="Xem dữ liệu cá nhân" description="Kiểm tra thông tin đang được lưu" onPress={() => Alert.alert('Dữ liệu cá nhân', 'Thông tin cá nhân của bạn được mã hóa trên thiết bị.')} />
        <SettingsLink colors={colors} icon={Download} title="Tải xuống dữ liệu" description="Xuất một bản sao dữ liệu của bạn" onPress={() => Alert.alert('Đang chuẩn bị dữ liệu', 'Tệp dữ liệu mẫu sẽ sẵn sàng để tải xuống.')} divider />
        <SettingsLink colors={colors} icon={Trash2} title="Xóa dữ liệu demo" description="Kiểm tra trạng thái ứng dụng khi không có dữ liệu" onPress={confirmClear} divider danger />
        <SettingsLink colors={colors} icon={HardDrive} title="Khôi phục dữ liệu demo" description="Nạp lại bộ dữ liệu thiết kế ban đầu" onPress={onResetDemo} divider />
      </Card>
    </ScreenScroll>
  );
}
