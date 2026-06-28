import { useRouter } from 'expo-router';
import { BellRing, FileCheck2, ShieldCheck } from 'lucide-react-native';

import { ConfigurableSettingsListScreen } from '@/screens/settings';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsNotificationsRoute() {
  const router = useRouter();
  const { colors, returnScreen } = useAppRouterState();

  return (
    <ConfigurableSettingsListScreen
      colors={colors}
      id="screen-settings-notifications"
      title="Cài đặt thông báo"
      description="Chọn các cập nhật và cảnh báo bạn muốn nhận từ Identra."
      rows={[
        { icon: BellRing, title: 'Yêu cầu dữ liệu', description: 'Thông báo khi có bên xác minh yêu cầu dữ liệu' },
        { icon: ShieldCheck, title: 'Cảnh báo bảo mật', description: 'Nhận cảnh báo đăng nhập và thay đổi bảo mật' },
        { icon: FileCheck2, title: 'Cập nhật thực chứng', description: 'Thông báo khi thực chứng sắp hết hạn' },
      ]}
      onBack={() => router.replace(getPathForScreen(returnScreen))}
    />
  );
}
