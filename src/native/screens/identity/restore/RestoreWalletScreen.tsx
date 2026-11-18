import { ExternalLink, KeyRound } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, CredentialIcon, PrimaryButton, ScreenScroll } from '../../../components/AppUiPrimitives';
import type { RestoreState } from '../../../domain/wallet/walletFlows';
import { documentsToRequestViews } from '../../../domain/wallet/walletViews';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { spacing } from '../../../theme';
import { FailureNotice, Panel, TextAction, walletStyles } from '../wallet/WalletParts';

/** ADR-0009 §5: documents from the backed-up list that this phone must request again. */
export function RestoreWalletScreen({
  colors,
  state,
  onBack,
  onConfirm,
  onRetry,
  onOpenPortal,
  onForget,
}: {
  colors: AppColors;
  state: RestoreState;
  onBack: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onOpenPortal: (url: string) => void;
  onForget: (key: string) => void;
}) {
  const { locale, t } = useI18n();
  const items = state.phase === 'restored-device' || state.phase === 'to-request' ? documentsToRequestViews(state.items, locale) : [];

  return (
    <ScreenScroll id={state.phase === 'restored-device' ? 'screen-wallet-restore-confirm' : 'screen-wallet-restore'} colors={colors} contentStyle={walletStyles.content}>
      <AppHeader colors={colors} title={t('wallet.restore.headerTitle')} onBack={onBack} />

      {state.phase === 'loading' ? (
        <View style={walletStyles.center}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : null}

      {state.phase === 'failed' ? (
        <>
          <FailureNotice colors={colors} failure={state.failure} />
          <TextAction colors={colors} label={t('wallet.actions.tryAgain')} onPress={onRetry} />
        </>
      ) : null}

      {state.phase === 'restored-device' || state.phase === 'to-request' ? (
        <>
          <View style={styles.intro}>
            <Text style={[walletStyles.title, { color: colors.text }]}>
              {state.phase === 'restored-device' ? t('wallet.restore.newPhoneTitle') : items.length ? t('wallet.restore.toRequestTitle') : t('wallet.restore.nothingTitle')}
            </Text>
            <View style={[styles.why, { backgroundColor: colors.surfaceMuted }]}>
              <KeyRound color={colors.primaryDark} size={20} strokeWidth={1.9} />
              <Text style={[styles.whyText, { color: colors.text }]}>{t('wallet.restore.why')}</Text>
            </View>
            {state.phase === 'to-request' && state.justCleared ? (
              <Text style={[walletStyles.lead, { color: colors.textSecondary }]}>{t('wallet.restore.cleared')}</Text>
            ) : null}
          </View>

          {items.length ? (
            <Panel colors={colors} style={styles.listPanel}>
              {items.map((item, index) => (
                <View key={item.key} style={[styles.item, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                  <View style={walletStyles.row}>
                    <CredentialIcon icon="graduation" boxSize={44} size={24} />
                    <View style={styles.flex}>
                      <Text style={[walletStyles.value, { color: colors.text }]}>{t(item.nameKey)}</Text>
                      <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{item.issuerName}</Text>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    {item.portalUrl ? (
                      <Pressable accessibilityRole="link" hitSlop={6} onPress={() => onOpenPortal(item.portalUrl!)} style={styles.link}>
                        <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{t('wallet.restore.openPortal')}</Text>
                        <ExternalLink color={colors.primaryDark} size={16} />
                      </Pressable>
                    ) : (
                      <Text style={[walletStyles.meta, styles.flex, { color: colors.textSecondary }]}>{t('wallet.restore.askIssuer')}</Text>
                    )}
                    {state.phase === 'to-request' ? (
                      <Pressable accessibilityRole="button" hitSlop={6} onPress={() => onForget(item.key)} style={styles.link}>
                        <Text style={[walletStyles.label, { color: colors.textSecondary }]}>{t('wallet.restore.notNeeded')}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </Panel>
          ) : (
            <Text style={[walletStyles.lead, { color: colors.textSecondary }]}>{t('wallet.restore.nothingLead')}</Text>
          )}

          {state.phase === 'restored-device' ? (
            <View style={walletStyles.actions}>
              {state.failure ? <FailureNotice colors={colors} failure={state.failure} /> : null}
              <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.restore.confirmHint', { count: state.unreadableCount })}</Text>
              <PrimaryButton colors={colors} title={t('wallet.restore.confirm')} onPress={onConfirm} loading={state.confirming} />
              <TextAction colors={colors} label={t('wallet.restore.later')} onPress={onBack} />
            </View>
          ) : null}
        </>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  intro: { gap: spacing.md },
  why: { flexDirection: 'row', gap: spacing.md, borderRadius: 16, padding: spacing.lg },
  whyText: { flex: 1, fontSize: 14, lineHeight: 21 },
  listPanel: { paddingVertical: 0 },
  item: { paddingBottom: spacing.sm },
  itemActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingLeft: 56 },
  link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flex: { flex: 1, gap: 2 },
});
