import { useRouter } from 'expo-router';
import { BellRing, Share2, UserCheck } from 'lucide-react-native';

import { ConfigurableSettingsListScreen } from '@/screens/settings';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsSharingRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return (
    <ConfigurableSettingsListScreen
      colors={colors}
      id="screen-settings-sharing"
      title="Quyền chia sẻ dữ liệu"
      description="Kiểm soát cách dữ liệu của bạn được chia sẻ với các bên thứ ba."
      rows={[
        { icon: UserCheck, title: 'Luôn yêu cầu xác nhận', description: 'Xác nhận trước mỗi lần chia sẻ dữ liệu' },
        { icon: Share2, title: 'Ghi lại lịch sử chia sẻ', description: 'Lưu thông tin các lần chia sẻ trong Hoạt động' },
        { icon: BellRing, title: 'Nhắc quyền truy cập', description: 'Nhắc xem lại quyền truy cập định kỳ', defaultValue: false },
      ]}
      onBack={() => router.replace('/settings')}
    />
  );
}
