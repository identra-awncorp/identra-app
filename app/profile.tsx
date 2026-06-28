import { useRouter } from 'expo-router';

import { ProfileScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ProfileRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, returnScreen } = useAppRouterState();

  return (
    <ProfileScreen
      colors={colors}
      profile={store.profile}
      onBack={() => router.replace('/wallet')}
      onSave={(profile) => {
        store.updateProfile(profile);
        store.addLog('Cập nhật hồ sơ', 'Thông tin cá nhân trong ví đã được cập nhật.', 'Hệ thống Identra', 'security');
        router.replace(getPathForScreen(returnScreen));
      }}
    />
  );
}
