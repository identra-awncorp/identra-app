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
      titleKey="settings.configurable.notificationsTitle"
      descriptionKey="settings.configurable.notificationsDescription"
      rows={[
        {
          icon: BellRing,
          titleKey: 'settings.configurable.dataRequestTitle',
          descriptionKey: 'settings.configurable.dataRequestDescription',
        },
        {
          icon: ShieldCheck,
          titleKey: 'settings.configurable.securityAlertsTitle',
          descriptionKey: 'settings.configurable.securityAlertsDescription',
        },
        {
          icon: FileCheck2,
          titleKey: 'settings.configurable.credentialUpdatesTitle',
          descriptionKey: 'settings.configurable.credentialUpdatesDescription',
        },
      ]}
      onBack={() => router.replace(getPathForScreen(returnScreen))}
    />
  );
}
