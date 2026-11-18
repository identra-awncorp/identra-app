import { History, ScanLine } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, CredentialIcon, ListChevron, PrimaryButton, ScreenScroll, StatusPill } from '../../../components/AppUiPrimitives';
import type { CredentialListItem } from '../../../domain/wallet/walletViews';
import type { FailureView } from '../../../domain/wallet/walletMessages';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { spacing } from '../../../theme';
import { FailureNotice, Panel, TextAction, walletStyles } from '../wallet/WalletParts';

export type CredentialsListState =
  | { phase: 'loading' }
  | { phase: 'failed'; failure: FailureView }
  | { phase: 'ready'; items: CredentialListItem[]; restoreNeeded: boolean; toRequestCount: number };

/**
 * The documents held in the wallet (from the vault, never demo data). ponytail: a plain list in
 * the scroll view; a wallet holds a handful of documents. Virtualise if that ever changes.
 */
export function CredentialsScreen({
  colors,
  state,
  onBack,
  onOpenCredential,
  onScan,
  onOpenRestore,
  onRetry,
}: {
  colors: AppColors;
  state: CredentialsListState;
  onBack: () => void;
  onOpenCredential: (id: string) => void;
  onScan: () => void;
  onOpenRestore: () => void;
  onRetry: () => void;
}) {
  const { t } = useI18n();

  return (
    <ScreenScroll id={state.phase === 'ready' && state.items.length === 0 ? 'screen-credentials-empty' : 'screen-credentials-library'} colors={colors} contentStyle={walletStyles.content}>
      <AppHeader colors={colors} title={t('wallet.list.title')} onBack={onBack} />

      {state.phase === 'loading' ? (
        <View style={walletStyles.center}>
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.list.loading')}</Text>
        </View>
      ) : null}

      {state.phase === 'failed' ? (
        <>
          <FailureNotice colors={colors} failure={state.failure} />
          <TextAction colors={colors} label={t('wallet.actions.tryAgain')} onPress={onRetry} />
        </>
      ) : null}

      {state.phase === 'ready' ? (
        <>
          {state.restoreNeeded || state.toRequestCount > 0 ? (
            <Pressable accessibilityRole="button" onPress={onOpenRestore} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.restoreCard, { backgroundColor: colors.surfaceMuted }]}>
                <History color={colors.primaryDark} size={22} strokeWidth={1.9} />
                <View style={styles.flex}>
                  <Text style={[walletStyles.label, { color: colors.text }]}>
                    {state.restoreNeeded ? t('wallet.list.restoreTitle') : t('wallet.list.toRequestTitle', { count: state.toRequestCount })}
                  </Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.list.restoreHint')}</Text>
                </View>
                <ListChevron colors={colors} />
              </View>
            </Pressable>
          ) : null}

          {state.items.length ? (
            <>
              <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.list.count', { count: state.items.length })}</Text>
              <Panel colors={colors} style={styles.listPanel}>
                {state.items.map((item, index) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${t(item.nameKey)}, ${item.issuerName}, ${t(`common.status.${item.status}`)}`}
                    onPress={() => onOpenCredential(item.id)}
                    style={({ pressed }) => [
                      styles.itemRow,
                      index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                      { opacity: pressed ? 0.65 : 1 },
                    ]}
                  >
                    <CredentialIcon icon="graduation" boxSize={44} size={24} />
                    <View style={styles.flex}>
                      <Text numberOfLines={1} style={[walletStyles.value, { color: colors.text }]}>{t(item.nameKey)}</Text>
                      <Text numberOfLines={1} style={[walletStyles.meta, { color: colors.textSecondary }]}>{item.issuerName}</Text>
                      <Text numberOfLines={1} style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.list.receivedOn', { date: item.receivedDate })}</Text>
                      <View style={styles.pill}>
                        <StatusPill status={item.status} compact />
                      </View>
                    </View>
                    <ListChevron colors={colors} />
                  </Pressable>
                ))}
              </Panel>
              <TextAction colors={colors} label={t('wallet.list.receiveAnother')} onPress={onScan} />
            </>
          ) : state.restoreNeeded ? null : (
            <View style={styles.empty}>
              <ScanLine color={colors.primaryDark} size={40} strokeWidth={1.6} />
              <Text style={[walletStyles.sectionTitle, styles.centerText, { color: colors.text }]}>{t('wallet.list.emptyTitle')}</Text>
              <Text style={[walletStyles.lead, styles.centerText, { color: colors.textSecondary }]}>{t('wallet.list.emptyLead')}</Text>
              <PrimaryButton colors={colors} title={t('wallet.list.scan')} onPress={onScan} style={styles.emptyButton} />
            </View>
          )}
        </>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 3 },
  restoreCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 16, padding: spacing.lg },
  listPanel: { paddingVertical: 0 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 72 },
  pill: { flexDirection: 'row', marginTop: 2 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyButton: { alignSelf: 'stretch', marginTop: spacing.md },
  centerText: { textAlign: 'center' },
});
