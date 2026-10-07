import { useEffect, useState, type ReactNode } from 'react';
import { Alert, View } from 'react-native';

import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';

export function CredentialAccessGate({
  authenticate,
  accessRevision,
  appActive,
  children,
  colors,
  enabled,
  onDenied,
}: {
  accessRevision: number;
  appActive: boolean;
  authenticate: (prompt: {
    cancelLabel: string;
    fallbackLabel: string;
    promptMessage: string;
  }) => Promise<boolean>;
  children: ReactNode;
  colors: AppColors;
  enabled: boolean;
  onDenied: () => void;
}) {
  const { t } = useI18n();
  const [granted, setGranted] = useState(!enabled);

  useEffect(() => {
    let mounted = true;

    if (!enabled) {
      setGranted(true);
      return () => {
        mounted = false;
      };
    }

    setGranted(false);
    if (!appActive) {
      return () => {
        mounted = false;
      };
    }

    void authenticate({
      cancelLabel: t('identity.access.cancel'),
      fallbackLabel: t('identity.access.fallback'),
      promptMessage: t('identity.access.prompt'),
    }).then((success) => {
      if (!mounted) return;

      if (success) {
        setGranted(true);
        return;
      }

      Alert.alert(
        t('identity.access.deniedTitle'),
        t('identity.access.deniedDescription'),
        [{ text: t('common.close'), onPress: onDenied }],
        { cancelable: false },
      );
    });

    return () => {
      mounted = false;
    };
  }, [accessRevision, appActive, authenticate, enabled, onDenied, t]);

  if (granted) {
    return children;
  }

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <LoadingOverlay
        colors={colors}
        description={t('identity.access.checkingDescription')}
        title={t('identity.access.checkingTitle')}
        visible
      />
    </View>
  );
}
