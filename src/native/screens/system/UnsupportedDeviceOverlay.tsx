import { ShieldAlert } from 'lucide-react-native';
import { Modal, StyleSheet, View } from 'react-native';

import { useAppRouterState } from '../../app/router/AppRouterContext';
import { EmptyState } from '../../components/AppUiPrimitives';
import { useI18n } from '../../i18n';
import { getWalletRuntimeCheck } from '../../platform/installGlobals';
import { spacing } from '../../theme';

/**
 * Blocking state when the start-up self-check fails (a global the wallet needs is missing or the
 * random source is broken), instead of a crash later inside a credential flow. Renders nothing
 * on a supported device. A Modal so it also covers native stack screens; back does nothing.
 */
export function UnsupportedDeviceOverlay() {
  const { t } = useI18n();
  const { colors } = useAppRouterState();
  if (getWalletRuntimeCheck().ok) return null;

  return (
    <Modal visible animationType="none" onRequestClose={() => undefined}>
      <View nativeID="screen-unsupported-device" testID="screen-unsupported-device" style={[styles.screen, { backgroundColor: colors.background }]}>
        <EmptyState
          colors={colors}
          icon={ShieldAlert}
          title={t('wallet.unsupportedDevice.title')}
          description={t('wallet.unsupportedDevice.description')}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: spacing.lg },
});
