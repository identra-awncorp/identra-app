import { useRouter } from 'expo-router';

import { ProfileScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useI18n } from '@/i18n';

export default function ProfileRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { t } = useI18n();
  const { colors, returnScreen } = useAppRouterState();

  return (
    <ProfileScreen
      colors={colors}
      profile={store.profile}
      onBack={() => router.replace('/wallet')}
      onSave={(profile) => {
        store.updateProfile(profile);
        store.addLog(
          t('activityLogs.profileUpdateTitle'),
          t('activityLogs.profileUpdateDescription'),
          t('activityLogs.systemPartner'),
          'security',
        );
        router.replace(getPathForScreen(returnScreen));
      }}
    />
  );
}
