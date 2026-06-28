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
      titleKey="settings.configurable.governanceTitle"
      descriptionKey="settings.configurable.governanceDescription"
      rows={[
        {
          icon: Building2,
          titleKey: 'settings.configurable.trustedOrganizationsTitle',
          descriptionKey: 'settings.configurable.trustedOrganizationsDescription',
        },
        {
          icon: FileCheck2,
          titleKey: 'settings.configurable.policyCheckTitle',
          descriptionKey: 'settings.configurable.policyCheckDescription',
        },
        {
          icon: ShieldCheck,
          titleKey: 'settings.configurable.changeAlertsTitle',
          descriptionKey: 'settings.configurable.changeAlertsDescription',
        },
      ]}
      onBack={() => router.replace('/settings')}
    />
  );
}
