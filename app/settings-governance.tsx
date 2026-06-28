import { useRouter } from 'expo-router';
import { BellRing, Building2, FileCheck2, ShieldCheck } from 'lucide-react-native';

import { ConfigurableSettingsListScreen } from '@/screens/settings';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsGovernanceRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return (
    <ConfigurableSettingsListScreen
      colors={colors}
      id="screen-settings-governance"
      title="Cài đặt khung quản trị"
      description="Quản lý các quy tắc tin cậy và đơn vị được phép tương tác với ví."
      rows={[
        { icon: Building2, title: 'Tổ chức tin cậy', description: 'Cho phép thực chứng từ các tổ chức đã xác minh' },
        { icon: FileCheck2, title: 'Kiểm tra chính sách', description: 'Xác minh chính sách trước khi nhận thực chứng' },
        { icon: ShieldCheck, title: 'Cảnh báo thay đổi', description: 'Thông báo khi khung quản trị được cập nhật' },
      ]}
      onBack={() => router.replace('/settings')}
    />
  );
}
