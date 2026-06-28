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
      titleKey="settings.configurable.sharingTitle"
      descriptionKey="settings.configurable.sharingDescription"
      rows={[
        {
          icon: UserCheck,
          titleKey: 'settings.configurable.alwaysConfirmTitle',
          descriptionKey: 'settings.configurable.alwaysConfirmDescription',
        },
        {
          icon: Share2,
          titleKey: 'settings.configurable.shareHistoryTitle',
          descriptionKey: 'settings.configurable.shareHistoryDescription',
        },
        {
          icon: BellRing,
          titleKey: 'settings.configurable.accessReminderTitle',
          descriptionKey: 'settings.configurable.accessReminderDescription',
          defaultValue: false,
        },
      ]}
      onBack={() => router.replace('/settings')}
    />
  );
}
