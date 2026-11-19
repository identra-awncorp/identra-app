import { BadgeCheck, CheckCircle2, ChevronDown, ChevronUp, Clock3, Eye, EyeOff, Fingerprint, RefreshCw, ShieldAlert } from 'lucide-react-native';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, CredentialIcon, PrimaryButton, ScreenScroll, StatusPill } from '../../../components/AppUiPrimitives';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { credentialStatusFromVault } from '../../../domain/wallet/credentialPresentation';
import {
  claimSetChoice,
  documentChoices,
  formatCountdown,
  initialPresentState,
  presentationActivityEntry,
  presentReducer,
  purposeText,
  secondsLeft,
  shareBlock,
  type ConsentField,
  type PresentEvent,
  type PresentState,
} from '../../../domain/wallet/presentationFlow';
import type { WalletApi, WalletCredentialSummary } from '../../../domain/wallet/walletContainer';
import { failureCodeOfError } from '../../../domain/wallet/walletMessages';
import { formatWalletDate, issuerPortalUrl, MASKED_VALUE } from '../../../domain/wallet/walletViews';
import { useI18n, type I18nKey } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, radius, spacing, typography } from '../../../theme';
import type { ActivityLog } from '../../../types';
import { FailureNotice, Panel, TextAction, walletStyles } from '../wallet/WalletParts';

function randomId(): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return `share-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Sharing a document with a verifier: WHO asks, WHAT leaves the phone (values masked until
 * revealed; the summary of field names is always visible), required vs optional, and the choice.
 * Leaving the screen declines locally; "Chia sẻ" submits once.
 */
export function PresentCredentialScreen({
  colors,
  wallet,
  qrText,
  onClose,
  onScanAgain,
  onOpenPortal,
  onRecordActivity,
}: {
  colors: AppColors;
  wallet: WalletApi;
  qrText: string;
  onClose: () => void;
  onScanAgain: () => void;
  onOpenPortal: (url: string) => void;
  onRecordActivity: (entry: ActivityLog) => void;
}) {
  const { locale, t } = useI18n();
  const [state, rawDispatch] = useReducer(presentReducer, initialPresentState);
  const stateRef = useRef<PresentState>(state);
  const submitting = useRef(false);
  const [summaries, setSummaries] = useState<Record<string, WalletCredentialSummary>>({});
  const [claims, setClaims] = useState<Record<string, Record<string, unknown>>>({});
  const [revealed, setRevealed] = useState(false);
  const [withheldOpen, setWithheldOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [attempt, setAttempt] = useState(0);

  const dispatch = (event: PresentEvent) => {
    stateRef.current = presentReducer(stateRef.current, event);
    rawDispatch(event);
  };

  // Resolve the request; leaving the screen before it was answered declines it (no network).
  useEffect(() => {
    let live = true;
    wallet.presentations
      .resolve(qrText)
      .then((result) => live && dispatch({ type: 'resolved', result }))
      .catch((error: unknown) => live && dispatch({ type: 'resolved', result: { ok: false, code: failureCodeOfError(error) } }));
    return () => {
      live = false;
      const s = stateRef.current;
      if (s.phase === 'consent' || s.phase === 'no-match') wallet.presentations.decline(s.request);
    };
  }, [qrText, wallet, attempt]);

  // Local status, issuer and stored values of the matching documents (no key is read).
  const request = state.phase === 'consent' || state.phase === 'submitting' || state.phase === 'no-match' ? state.request : null;
  useEffect(() => {
    if (!request || request.matches.length === 0) return;
    let live = true;
    void (async () => {
      const list = await wallet.credentials.list().catch(() => []);
      const byId = Object.fromEntries(list.map((s) => [s.id, s]));
      if (!live) return;
      setSummaries(byId);
      dispatch({ type: 'statuses', statuses: Object.fromEntries(request.matches.map((m) => [m.credentialId, credentialStatusFromVault(byId[m.credentialId]?.status ?? null)])) });
      for (const m of request.matches) {
        const r = await wallet.credentials.get(m.credentialId).catch(() => null);
        if (live && r?.ok) setClaims((c) => ({ ...c, [m.credentialId]: r.credential.claims }));
      }
    })();
    return () => {
      live = false;
      setClaims({});
    };
  }, [request, wallet]);

  // The request's countdown.
  useEffect(() => {
    if (state.phase !== 'consent') return;
    const timer = setInterval(() => {
      const nowMs = Date.now();
      setNow(nowMs);
      dispatch({ type: 'tick', nowMs });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.phase]);

  const submit = async () => {
    const s = stateRef.current;
    if (submitting.current || s.phase !== 'consent' || shareBlock(s) !== null) return;
    submitting.current = true;
    dispatch({ type: 'submit' });
    const choice = { credentialId: s.credentialId, claimSetIndex: s.claimSetIndex, ...(s.untrusted === 'confirmed' ? { allowUntrusted: true } : {}) };
    let result;
    try {
      result = await wallet.presentations.submit(s.request, choice);
    } catch (error) {
      result = { ok: false as const, code: failureCodeOfError(error) };
    }
    dispatch({ type: 'submitted', result });
    submitting.current = false;
    const after = stateRef.current;
    if (after.phase === 'sent' || after.phase === 'failed') {
      const match = s.request.matches.find((m) => m.credentialId === s.credentialId)!;
      onRecordActivity(
        presentationActivityEntry({
          id: randomId(),
          now: new Date(),
          verifierName: s.request.verifier.trusted ? s.request.verifier.ten : null,
          credentialId: s.credentialId,
          documentNameKey: documentChoices(s.request, {}, locale).find((d) => d.credentialId === s.credentialId)!.nameKey,
          claims: match.claimSets.find((c) => c.index === s.claimSetIndex)!.claims,
          outcome: after.phase === 'sent' ? 'success' : 'failed',
          t,
        }),
      );
    }
  };

  const decline = () => {
    const s = stateRef.current;
    if (s.phase === 'consent' || s.phase === 'no-match') wallet.presentations.decline(s.request);
    dispatch({ type: 'decline' });
    onClose();
  };

  const refreshStatus = async (credentialId: string) => {
    dispatch({ type: 'refresh-status' });
    const r = await wallet.credentials.refreshStatus(credentialId).catch(() => null);
    dispatch({ type: 'status-refreshed', credentialId, status: r?.ok ? credentialStatusFromVault(r.status) : null });
  };

  const labels = (fields: ConsentField[]) => fields.map((f) => t(f.labelKey)).join(', ');
  const screenId = `screen-present-credential${state.phase === 'consent' ? '' : `-${state.phase}`}`;

  return (
    <>
      <ScreenScroll id={screenId} colors={colors} contentStyle={walletStyles.content}>
        <AppHeader colors={colors} title={t('wallet.present.headerTitle')} onBack={state.phase === 'sent' || state.phase === 'failed' ? onClose : decline} />

        {state.phase === 'resolving' ? (
          <View style={walletStyles.center}>
            <ActivityIndicator color={colors.primaryDark} size="large" />
            <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.present.checking')}</Text>
          </View>
        ) : null}

        {state.phase === 'refused' ? (
          <>
            <Text style={[walletStyles.title, styles.title, { color: colors.text }]}>{state.retryLater ? t('wallet.present.retryLaterTitle') : t('wallet.present.refusedTitle')}</Text>
            <FailureNotice colors={colors} failure={state.failure} showTitle={false} />
            <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.nothingSent')}</Text>
            <View style={walletStyles.actions}>
              {state.retryLater ? (
                <PrimaryButton colors={colors} title={t('wallet.actions.tryAgain')} onPress={() => {
                    dispatch({ type: 'retry' });
                    setAttempt((a) => a + 1);
                  }}
                />
              ) : (
                <PrimaryButton colors={colors} title={t('wallet.actions.scanAgain')} onPress={onScanAgain} />
              )}
              <TextAction colors={colors} label={t('common.close')} onPress={onClose} />
            </View>
          </>
        ) : null}

        {state.phase === 'no-match' ? (
          <>
            <Text style={[walletStyles.title, styles.title, { color: colors.text }]}>{t('wallet.present.noMatchTitle')}</Text>
            <Text style={[walletStyles.lead, { color: colors.text }]}>
              {t('wallet.present.noMatchBody', { document: t(state.documentNameKey), verifier: state.request.verifier.trusted ? state.request.verifier.ten : t('wallet.present.activity.unverifiedPartner') })}
            </Text>
            <Text style={[walletStyles.lead, { color: colors.textSecondary }]}>{t('wallet.present.noMatchHow')}</Text>
            <View style={walletStyles.actions}>
              <PrimaryButton colors={colors} title={t('common.close')} onPress={decline} />
            </View>
          </>
        ) : null}

        {state.phase === 'consent' || state.phase === 'submitting' ? (
          <ConsentBody
            colors={colors}
            state={state}
            now={now}
            summaries={summaries}
            claims={claims[state.credentialId] ?? null}
            revealed={revealed}
            withheldOpen={withheldOpen}
            onToggleReveal={() => setRevealed((v) => !v)}
            onToggleWithheld={() => setWithheldOpen((v) => !v)}
            dispatch={dispatch}
            onShare={() => void submit()}
            onConfirmUntrusted={() => {
              dispatch({ type: 'confirm-untrusted' });
              void submit();
            }}
            onDecline={decline}
            onRefreshStatus={(id) => void refreshStatus(id)}
            onScanAgain={onScanAgain}
            labels={labels}
          />
        ) : null}

        {state.phase === 'sent' ? (
          <>
            <View style={walletStyles.center}>
              <CheckCircle2 color={colors.success} size={56} strokeWidth={1.8} />
              <Text style={[walletStyles.title, styles.centerText, { color: colors.text }]}>
                {state.verifierName ? t('wallet.present.sentTitle', { name: state.verifierName }) : t('wallet.present.sentTitleUnnamed')}
              </Text>
              <Text style={[walletStyles.lead, styles.centerText, { color: colors.textSecondary }]}>{t('wallet.present.sentBody')}</Text>
            </View>
            <Panel colors={colors}>
              <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.sentFieldsLabel')}</Text>
              <Text style={[walletStyles.value, { color: colors.text }]}>{state.claims.map((n) => t(fieldLabelKey(n))).join(', ')}</Text>
            </Panel>
            <PrimaryButton colors={colors} title={t('wallet.present.done')} onPress={onClose} />
          </>
        ) : null}

        {state.phase === 'failed' ? (
          <>
            <FailureNotice colors={colors} failure={state.failure} />
            <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>
              {state.failure.code === 'VERIFIER_ERROR' || state.failure.code === 'NETWORK_ERROR' ? t('wallet.present.maybeSent') : t('wallet.present.nothingSent')}
            </Text>
            <View style={walletStyles.actions}>
              {(state.failure.action === 'request-again' && issuerPortalUrl(summaries[state.credentialId]?.issuerUri ?? '', locale)) ? (
                <PrimaryButton colors={colors} title={t('wallet.restore.openPortal')} onPress={() => onOpenPortal(issuerPortalUrl(summaries[state.credentialId]!.issuerUri, locale)!)} />
              ) : (
                <PrimaryButton colors={colors} title={t('wallet.present.scanTheirCode')} onPress={onScanAgain} />
              )}
              <TextAction colors={colors} label={t('common.close')} onPress={onClose} />
            </View>
          </>
        ) : null}
      </ScreenScroll>
      <LoadingOverlay colors={colors} visible={state.phase === 'submitting'} title={t('wallet.present.sendingTitle')} description={t('wallet.present.sendingDescription')} />
    </>
  );
}

const FIELD_KEYS: Record<string, I18nKey> = {
  ho_ten: 'wallet.claims.ho_ten',
  ngay_sinh: 'wallet.claims.ngay_sinh',
  ma_sinh_vien: 'wallet.claims.ma_sinh_vien',
  nganh: 'wallet.claims.nganh',
  hang_tot_nghiep: 'wallet.claims.hang_tot_nghiep',
  nam_tot_nghiep: 'wallet.claims.nam_tot_nghiep',
  so_hieu_bang: 'wallet.claims.so_hieu_bang',
};
const fieldLabelKey = (name: string): I18nKey => FIELD_KEYS[name] ?? 'wallet.present.unknownField';

function ConsentBody({
  colors,
  state,
  now,
  summaries,
  claims,
  revealed,
  withheldOpen,
  onToggleReveal,
  onToggleWithheld,
  dispatch,
  onShare,
  onConfirmUntrusted,
  onDecline,
  onRefreshStatus,
  onScanAgain,
  labels,
}: {
  colors: AppColors;
  state: Extract<PresentState, { phase: 'consent' | 'submitting' }>;
  now: number;
  summaries: Record<string, WalletCredentialSummary>;
  claims: Record<string, unknown> | null;
  revealed: boolean;
  withheldOpen: boolean;
  onToggleReveal: () => void;
  onToggleWithheld: () => void;
  dispatch: (e: PresentEvent) => void;
  onShare: () => void;
  onConfirmUntrusted: () => void;
  onDecline: () => void;
  onRefreshStatus: (credentialId: string) => void;
  onScanAgain: () => void;
  labels: (f: ConsentField[]) => string;
}) {
  const { locale, t } = useI18n();
  const { request } = state;
  const trusted = request.verifier.trusted ? request.verifier : null;
  const purpose = purposeText(request, locale);
  const match = request.matches.find((m) => m.credentialId === state.credentialId)!;
  const choices = documentChoices(request, Object.fromEntries(Object.entries(summaries).map(([id, s]) => [id, s.issuerUri])), locale);
  const choice = claimSetChoice(match, state.claimSetIndex, match.vct, claims ?? {}, locale);
  const shared = [...choice.required, ...choice.optional];
  const block = state.phase === 'consent' ? shareBlock(state) : null;
  const left = secondsLeft(request.expiresAt, now);
  const value = (f: ConsentField) => (claims === null ? '…' : revealed ? f.value || '—' : MASKED_VALUE);

  return (
    <>
      {trusted ? (
        <View style={styles.verifier}>
          <View style={styles.verifierTop}>
            <View style={[styles.verifiedMark, { backgroundColor: colors.surfaceMuted }]}>
              <BadgeCheck color={colors.success} size={16} strokeWidth={2.2} />
              <Text style={[walletStyles.meta, { color: colors.text }]}>{t('wallet.present.verifiedMark')}</Text>
            </View>
            <Countdown colors={colors} seconds={left} />
          </View>
          <Text style={[walletStyles.title, styles.title, { color: colors.text }]}>{t('wallet.present.wantsToSee', { name: trusted.ten })}</Text>
          {purpose ? (
            <Text style={[walletStyles.lead, { color: colors.textSecondary }]}>
              {t('wallet.present.purposeLabel')}: {purpose}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.verifier}>
          <View style={styles.verifierTop}>
            <View />
            <Countdown colors={colors} seconds={left} />
          </View>
          <View accessibilityRole="alert" style={[styles.untrusted, { borderColor: colors.danger, backgroundColor: colors.surface }]}>
            <ShieldAlert color={colors.danger} size={26} strokeWidth={2} />
            <View style={styles.flex}>
              <Text style={[styles.untrustedTitle, { color: colors.danger }]}>{t('wallet.present.untrustedTitle')}</Text>
              <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.present.untrustedBody')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* What leaves the phone, in one line that is never masked. */}
      <View style={[styles.summary, { backgroundColor: colors.surfaceMuted }]}>
        <Text style={[walletStyles.label, { color: colors.text }]}>{t('wallet.present.summary', { fields: labels(shared) })}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[walletStyles.sectionTitle, { color: colors.text }]}>{choices.length > 1 ? t('wallet.present.chooseDocument') : t('wallet.present.documentLabel')}</Text>
        <Panel colors={colors} style={styles.listPanel}>
          {choices.map((c, i) => {
            const selected = c.credentialId === state.credentialId;
            const status = state.statuses[c.credentialId] ?? 'unknown';
            return (
              <Pressable
                key={c.credentialId}
                accessibilityRole={choices.length > 1 ? 'radio' : undefined}
                accessibilityState={choices.length > 1 ? { checked: selected } : undefined}
                disabled={choices.length < 2 || state.phase !== 'consent'}
                onPress={() => dispatch({ type: 'select-document', credentialId: c.credentialId })}
                style={[styles.docRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
              >
                {choices.length > 1 ? (
                  <View style={[styles.radio, { borderColor: selected ? colors.primaryDark : colors.border }]}>{selected ? <View style={[styles.radioDot, { backgroundColor: colors.primaryDark }]} /> : null}</View>
                ) : null}
                <CredentialIcon icon="graduation" boxSize={44} size={24} colors={colors} />
                <View style={styles.flex}>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{t(c.nameKey)}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{c.issuerName}</Text>
                  {summaries[c.credentialId] ? (
                    <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.list.receivedOn', { date: formatWalletDate(summaries[c.credentialId]!.createdAt, locale) })}</Text>
                  ) : null}
                  <View style={styles.pillRow}>
                    <StatusPill status={status} compact colors={colors} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </Panel>
      </View>

      {block === 'revoked' || block === 'suspended' ? (
        <View style={styles.section}>
          <View accessibilityRole="alert" style={[styles.blockNotice, { borderColor: colors.danger }]}>
            <Text style={[walletStyles.lead, { color: colors.text }]}>{block === 'revoked' ? t('wallet.present.revokedBlock') : t('wallet.present.suspendedBlock')}</Text>
          </View>
          <Pressable accessibilityRole="button" disabled={state.phase === 'consent' && state.refreshing} onPress={() => onRefreshStatus(state.credentialId)} style={[styles.refresh, { borderColor: colors.border }]}>
            {state.phase === 'consent' && state.refreshing ? <ActivityIndicator color={colors.primaryDark} /> : <RefreshCw color={colors.primaryDark} size={18} />}
            <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{t('wallet.detail.checkAgain')}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={[walletStyles.sectionTitle, { color: colors.text }]}>{t('wallet.present.fieldsTitle')}</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onToggleReveal} style={styles.inline}>
            {revealed ? <EyeOff color={colors.primaryDark} size={18} /> : <Eye color={colors.primaryDark} size={18} />}
            <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{revealed ? t('wallet.detail.hideValues') : t('wallet.detail.showValues')}</Text>
          </Pressable>
        </View>
        <Panel colors={colors} style={styles.listPanel}>
          {shared.map((f, i) => (
            <View key={f.name} style={[styles.field, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={styles.fieldHead}>
                <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t(f.labelKey)}</Text>
                {choice.required.includes(f) ? (
                  <Text style={[styles.tag, { color: colors.textSecondary, borderColor: colors.border }]}>{t('wallet.present.required')}</Text>
                ) : null}
              </View>
              <Text style={[walletStyles.value, { color: colors.text }]}>{value(f)}</Text>
            </View>
          ))}
        </Panel>
        {choice.required.length > 0 ? <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.requiredHint')}</Text> : null}
        {choice.smaller && state.phase === 'consent' && !state.expired ? (
          <Pressable accessibilityRole="button" onPress={() => dispatch({ type: 'select-claim-set', index: choice.smaller!.index })} style={[styles.switchRow, { borderColor: colors.border }]}>
            <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{t('wallet.present.shareLess')}</Text>
            <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.shareLessHint', { fields: labels(choice.smaller.dropped) })}</Text>
          </Pressable>
        ) : null}
        {choice.fuller && state.phase === 'consent' && !state.expired ? (
          <Pressable accessibilityRole="button" onPress={() => dispatch({ type: 'select-claim-set', index: choice.fuller!.index })} style={[styles.switchRow, { borderColor: colors.border }]}>
            <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{t('wallet.present.shareFull')}</Text>
            <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.shareFullHint', { fields: labels(choice.fuller.added) })}</Text>
          </Pressable>
        ) : null}
      </View>

      {choice.withheld.length > 0 ? (
        <View style={styles.section}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: withheldOpen }} onPress={onToggleWithheld} style={styles.sectionHead}>
            <Text style={[walletStyles.sectionTitle, { color: colors.text }]}>{t('wallet.present.withheldTitle', { count: choice.withheld.length })}</Text>
            {withheldOpen ? <ChevronUp color={colors.textSecondary} size={20} /> : <ChevronDown color={colors.textSecondary} size={20} />}
          </Pressable>
          {withheldOpen ? (
            <Panel colors={colors}>
              <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.withheldHint')}</Text>
              <Text style={[walletStyles.value, { color: colors.text }]}>{labels(choice.withheld)}</Text>
            </Panel>
          ) : null}
        </View>
      ) : null}

      {state.phase === 'consent' && state.failure ? <FailureNotice colors={colors} failure={state.failure} /> : null}

      {block === 'expired' ? (
        <>
          <View accessibilityRole="alert" style={[styles.blockNotice, { borderColor: colors.danger }]}>
            <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.present.expired')}</Text>
          </View>
          <View style={walletStyles.actions}>
            <PrimaryButton colors={colors} title={t('wallet.present.scanTheirCode')} onPress={onScanAgain} />
            <TextAction colors={colors} label={t('wallet.present.decline')} onPress={onDecline} />
          </View>
        </>
      ) : block === 'revoked' || block === 'suspended' ? (
        // Nothing to sign: the only ways on are "check again" (above) or declining.
        <View style={walletStyles.actions}>
          <PrimaryButton colors={colors} title={t('wallet.present.decline')} onPress={onDecline} />
        </View>
      ) : !trusted && state.phase === 'consent' && state.untrusted === 'warning' ? (
        <View style={walletStyles.actions}>
          <PrimaryButton colors={colors} title={t('wallet.present.decline')} onPress={onDecline} />
          <TextAction colors={colors} tone="danger" label={t('wallet.present.shareAnyway')} onPress={() => dispatch({ type: 'share-untrusted' })} />
        </View>
      ) : !trusted && state.phase === 'consent' && state.untrusted === 'confirming' ? (
        <View accessibilityRole="alert" style={[styles.confirm, { borderColor: colors.danger }]}>
          <Text style={[styles.untrustedTitle, { color: colors.text }]}>{t('wallet.present.confirmUntrustedTitle')}</Text>
          <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.present.confirmUntrustedBody', { fields: labels(shared) })}</Text>
          <BiometricNote colors={colors} />
          <Pressable accessibilityRole="button" onPress={onConfirmUntrusted} style={({ pressed }) => [styles.dangerButton, { borderColor: colors.danger, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[styles.dangerLabel, { color: colors.danger }]}>{t('wallet.present.confirmUntrusted')}</Text>
          </Pressable>
          <TextAction colors={colors} label={t('wallet.present.back')} onPress={() => dispatch({ type: 'cancel-untrusted' })} />
        </View>
      ) : (
        <>
          <BiometricNote colors={colors} />
          <View style={walletStyles.actions}>
            <PrimaryButton colors={colors} title={t('wallet.present.share')} onPress={onShare} loading={state.phase === 'submitting'} style={block ? styles.disabled : undefined} />
            <TextAction colors={colors} label={t('wallet.present.decline')} onPress={onDecline} disabled={state.phase === 'submitting'} />
          </View>
        </>
      )}
    </>
  );
}

function Countdown({ colors, seconds }: { colors: AppColors; seconds: number }) {
  const { t } = useI18n();
  const low = seconds <= 30;
  return (
    <View accessibilityLabel={t('wallet.present.expiresIn', { time: formatCountdown(seconds) })} style={[styles.countdown, { backgroundColor: colors.surfaceMuted }]}>
      <Clock3 color={low ? colors.danger : colors.textSecondary} size={14} />
      <Text style={[walletStyles.meta, { color: low ? colors.danger : colors.textSecondary }]}>{t('wallet.present.expiresIn', { time: formatCountdown(seconds) })}</Text>
    </View>
  );
}

function BiometricNote({ colors }: { colors: AppColors }) {
  const { t } = useI18n();
  return (
    <View style={[styles.note, { backgroundColor: colors.surfaceMuted }]}>
      <Fingerprint color={colors.primaryDark} size={20} strokeWidth={1.9} />
      <Text style={[styles.noteText, { color: colors.text }]}>{t('wallet.present.biometricNote')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  title: { fontSize: 24, lineHeight: 31 },
  centerText: { textAlign: 'center' },
  verifier: { gap: spacing.sm },
  verifierTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verifiedMark: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.round, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.round, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  untrusted: { flexDirection: 'row', gap: spacing.md, borderWidth: border.thick, borderRadius: radius.lg, padding: spacing.lg },
  untrustedTitle: { fontSize: typography.size.md, lineHeight: 22, fontWeight: typography.weight.extraBold },
  summary: { borderRadius: radius.lg, padding: spacing.md },
  section: { gap: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  listPanel: { paddingVertical: 0 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 72 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  pillRow: { flexDirection: 'row', marginTop: 2 },
  field: { paddingVertical: spacing.md, gap: 2 },
  fieldHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { fontSize: 11, fontWeight: typography.weight.semibold, borderWidth: 1, borderRadius: radius.round, paddingHorizontal: 6, paddingVertical: 1 },
  switchRow: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 2, minHeight: 44 },
  blockNotice: { borderWidth: border.medium, borderRadius: radius.lg, padding: spacing.lg },
  refresh: { minHeight: 44, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  confirm: { borderWidth: border.thick, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  dangerButton: { minHeight: 48, borderWidth: border.medium, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  dangerLabel: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  note: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 16, padding: spacing.md },
  noteText: { flex: 1, fontSize: 14, lineHeight: 20 },
  disabled: { opacity: 0.45 },
});
