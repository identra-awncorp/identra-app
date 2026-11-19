import { Building2, CalendarDays, Eye, EyeOff, RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, CredentialIcon, PrimaryButton, ScreenScroll, StatusPill } from '../../../components/AppUiPrimitives';
import type { DetailState } from '../../../domain/wallet/walletFlows';
import { displayedValue, formatWalletDate, MASKED_VALUE, type CredentialDetailView } from '../../../domain/wallet/walletViews';
import { failureView } from '../../../domain/wallet/walletMessages';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { spacing } from '../../../theme';
import type { ActivityLog, CredentialStatus } from '../../../types';
import { FailureNotice, Panel, TextAction, useRevealedWhileActive, walletStyles } from '../wallet/WalletParts';

/**
 * One document from the vault: what it is, who issued it, whether it still holds, its fields.
 * Nothing technical: no raw credential, no ids, no proof view.
 */
export function CredentialDetailScreen({
  colors,
  state,
  view,
  hideSensitive,
  shares,
  onBack,
  onRefresh,
  onRemove,
  onRetry,
  onOpenPortal,
}: {
  colors: AppColors;
  state: DetailState;
  view: CredentialDetailView | null;
  hideSensitive: boolean;
  /** The local record of presentations made from this document (field names only), newest first. */
  shares: ActivityLog[];
  onBack: () => void;
  onRefresh: () => void;
  onRemove: () => void;
  onRetry: () => void;
  onOpenPortal: (url: string) => void;
}) {
  const { locale, t } = useI18n();
  const [revealed, setRevealed] = useRevealedWhileActive();
  const statusMeaning: Record<CredentialStatus, string> = {
    verified: t('identity.detail.statuses.verified.description'),
    pending: t('identity.detail.statuses.pending.description'),
    expired: t('identity.detail.statuses.expired.description'),
    revoked: t('identity.detail.statuses.revoked.description'),
    suspended: t('identity.detail.statuses.suspended.description'),
    unknown: t('identity.detail.statuses.unknown.description'),
    invalid: t('identity.detail.statuses.invalid.description'),
  };
  /** Why an `invalid` document fails, when the last check said so (checks of the refresh). */
  const invalidReason = state.phase === 'loaded' && state.refreshChecks ? failureView('CREDENTIAL_INVALID', state.refreshChecks).detailKey : null;
  /** Definite answers are successful checks; unknown / invalid are only the latest attempt. */
  const checkedLabel = (status: CredentialStatus, date: string) =>
    status === 'unknown' || status === 'invalid' ? t('wallet.detail.lastAttemptOn', { date }) : t('wallet.detail.checkedOn', { date });

  const confirmRemove = () => {
    if (!view) return;
    Alert.alert(
      t('wallet.detail.removeTitle'),
      t('wallet.detail.removeDescription', { document: t(view.nameKey), issuer: view.issuerName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('wallet.detail.removeConfirm'), style: 'destructive', onPress: onRemove },
      ],
    );
  };

  return (
    <ScreenScroll id={state.phase === 'loaded' ? 'screen-credential-detail' : `screen-credential-detail-${state.phase}`} colors={colors} contentStyle={walletStyles.content}>
      <AppHeader colors={colors} title={t('wallet.detail.headerTitle')} onBack={onBack} />

      {state.phase === 'loading' ? (
        <View style={walletStyles.center}>
          <ActivityIndicator color={colors.primaryDark} />
          <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.detail.loading')}</Text>
        </View>
      ) : null}

      {state.phase === 'failed' ? (
        <>
          <FailureNotice colors={colors} failure={state.failure} />
          {state.failure.action === 'retry' ? <TextAction colors={colors} label={t('wallet.actions.tryAgain')} onPress={onRetry} /> : null}
          <TextAction colors={colors} label={t('wallet.detail.backToList')} onPress={onBack} />
        </>
      ) : null}

      {state.phase === 'loaded' && view ? (
        <>
          <Panel colors={colors} style={styles.hero}>
            <View style={styles.heroTop}>
              <CredentialIcon icon="graduation" boxSize={56} size={30} colors={colors} />
              <View style={styles.flex}>
                <Text style={[walletStyles.title, styles.heroTitle, { color: colors.text }]}>{t(view.nameKey)}</Text>
                <View style={styles.inline}>
                  <Building2 color={colors.textSecondary} size={15} />
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{view.issuerName}</Text>
                </View>
                <View style={styles.inline}>
                  <CalendarDays color={colors.textSecondary} size={15} />
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.list.receivedOn', { date: view.receivedDate })}</Text>
                </View>
              </View>
            </View>
          </Panel>

          <View style={styles.section}>
            <Text style={[walletStyles.sectionTitle, { color: colors.text }]}>{t('wallet.detail.statusSection')}</Text>
            <Panel colors={colors} style={styles.statusPanel}>
              <View style={styles.pillRow}>
                <StatusPill status={view.status} colors={colors} />
              </View>
              <Text style={[walletStyles.lead, { color: colors.text }]}>{statusMeaning[view.status]}</Text>
              {view.status === 'invalid' && invalidReason ? <Text style={[walletStyles.lead, { color: colors.text }]}>{t(invalidReason)}</Text> : null}
              {view.statusCheckedDate ? (
                <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{checkedLabel(view.status, view.statusCheckedDate)}</Text>
              ) : null}
              {(view.status === 'unknown' || view.status === 'invalid') && state.lastValidAt ? (
                <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.detail.lastValidOn', { date: formatWalletDate(state.lastValidAt, locale) })}</Text>
              ) : null}
              {state.refreshFailure ? <FailureNotice colors={colors} failure={state.refreshFailure} showTitle={false} /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ busy: state.refreshing }}
                disabled={state.refreshing}
                onPress={onRefresh}
                style={({ pressed }) => [styles.refresh, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              >
                {state.refreshing ? <ActivityIndicator color={colors.primaryDark} /> : <RefreshCw color={colors.primaryDark} size={18} />}
                <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{state.refreshing ? t('wallet.detail.checking') : t('wallet.detail.checkAgain')}</Text>
              </Pressable>
            </Panel>
            {view.status === 'revoked' || view.status === 'suspended' ? (
              view.portalUrl ? <TextAction colors={colors} label={t('wallet.detail.contactIssuer')} onPress={() => onOpenPortal(view.portalUrl!)} /> : null
            ) : null}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[walletStyles.sectionTitle, { color: colors.text }]}>{t('wallet.detail.fieldsSection')}</Text>
              {hideSensitive ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={revealed ? t('wallet.detail.hideValues') : t('wallet.detail.showValues')}
                  onPress={() => setRevealed((v) => !v)}
                  style={[styles.inline, styles.revealButton]}
                >
                  {revealed ? <EyeOff color={colors.primaryDark} size={18} /> : <Eye color={colors.primaryDark} size={18} />}
                  <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{revealed ? t('wallet.detail.hideValues') : t('wallet.detail.showValues')}</Text>
                </Pressable>
              ) : null}
            </View>
            <Panel colors={colors} style={styles.fieldsPanel}>
              {view.fields.map((field, index) => {
                const shown = displayedValue(field, { hideSensitive, revealed, sensitiveFields: view.sensitiveFields });
                const masked = shown === MASKED_VALUE;
                return (
                  <View key={field.name} style={[styles.field, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                    <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t(field.labelKey)}</Text>
                    <Text selectable={!masked} style={[walletStyles.value, { color: colors.text }]}>{shown}</Text>
                  </View>
                );
              })}
            </Panel>
          </View>

          <View style={styles.section}>
            <Text style={[walletStyles.sectionTitle, { color: colors.text }]}>{t('wallet.detail.recentShares')}</Text>
            {shares.length ? (
              <Panel colors={colors} style={styles.fieldsPanel}>
                {shares.slice(0, 5).map((log, index) => (
                  <View key={log.id} style={[styles.field, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                    <Text style={[walletStyles.value, { color: colors.text }]}>{log.partner}</Text>
                    <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{log.description}</Text>
                    <Text style={[walletStyles.meta, { color: log.status === 'failed' ? colors.danger : colors.textSecondary }]}>
                      {formatWalletDate(log.timestamp, locale)}
                      {log.status === 'failed' ? ` · ${t('wallet.detail.shareFailed')}` : log.status === 'uncertain' ? ` · ${t('wallet.detail.shareMaybeSent')}` : ''}
                    </Text>
                  </View>
                ))}
              </Panel>
            ) : (
              <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.detail.noShares')}</Text>
            )}
          </View>

          <View style={styles.section}>
            {state.removeFailure ? <FailureNotice colors={colors} failure={state.removeFailure} showTitle={false} /> : null}
            <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.detail.removeHint')}</Text>
            {state.removing ? (
              <PrimaryButton colors={colors} title={t('wallet.detail.removeConfirm')} onPress={() => undefined} loading secondary />
            ) : (
              <TextAction colors={colors} tone="danger" label={t('wallet.detail.remove')} onPress={confirmRemove} />
            )}
          </View>
        </>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xs },
  hero: { paddingVertical: spacing.lg },
  heroTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  heroTitle: { fontSize: 22, lineHeight: 28 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  revealButton: { minHeight: 44, minWidth: 44, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  section: { gap: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  statusPanel: { gap: spacing.sm, paddingVertical: spacing.lg },
  pillRow: { flexDirection: 'row' },
  refresh: { minHeight: 44, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xs },
  fieldsPanel: { paddingVertical: 0 },
  field: { paddingVertical: spacing.md, gap: 2 },
});
