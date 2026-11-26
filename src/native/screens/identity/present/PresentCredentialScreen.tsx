import { BadgeCheck, CheckCircle2, ChevronDown, ChevronUp, Clock3, Eye, EyeOff, Fingerprint, RefreshCw, ShieldAlert } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, CredentialIcon, PrimaryButton, ScreenScroll, StatusPill } from '../../../components/AppUiPrimitives';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { credentialStatusFromVault } from '../../../domain/wallet/credentialPresentation';
import {
  claimSetChoice,
  createPresentationActions,
  documentChoices,
  fieldLabelKey,
  formatCountdown,
  initialPresentState,
  presentationActivityEntry,
  presentReducer,
  purposeText,
  secondsLeft,
  shareBlock,
  type ClaimSetChoice,
  type ConsentField,
  type PresentEvent,
  type PresentState,
  type ShareBlock,
} from '../../../domain/wallet/presentationFlow';
import type { WalletApi, WalletCredentialSummary } from '../../../domain/wallet/walletContainer';
import { failureCodeOfError, MAYBE_SENT_CODES } from '../../../domain/wallet/walletMessages';
import { formatWalletDate, issuerPortalUrl, issuerText, MASKED_VALUE, trustPathKey, type Locale } from '../../../domain/wallet/walletViews';
import { useI18n, type I18nKey } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, radius, spacing, typography } from '../../../theme';
import type { ActivityLog } from '../../../types';
import { FailureNotice, Panel, StickyFooter, TextAction, useAnnouncement, useRevealedWhileActive, walletStyles } from '../wallet/WalletParts';

function randomId(): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return `share-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/** Why sharing is impossible now, with its sentence (the untrusted step is not a stop). */
const STOP_SENTENCES: Record<Exclude<ShareBlock, 'untrusted'>, I18nKey> = {
  'request-expired': 'wallet.present.expired',
  revoked: 'wallet.present.revokedBlock',
  suspended: 'wallet.present.suspendedBlock',
  invalid: 'wallet.present.invalidBlock',
  expired: 'wallet.present.documentExpiredBlock',
};
type Stop = keyof typeof STOP_SENTENCES;
const stopOf = (block: ShareBlock | null): Stop | null => (block && block !== 'untrusted' ? block : null);

/**
 * Sharing a document with a verifier: WHO asks, WHAT leaves the phone (values masked until
 * revealed; the summary of field names is always visible), required vs optional, and the choice.
 * Leaving the screen declines locally; "Chia sẻ" submits once. The decision stays in a footer.
 */
export function PresentCredentialScreen({
  colors,
  wallet,
  qrText,
  onClose,
  onScanAgain,
  onOpenPortal,
  onRecordActivity,
  onSigningStarted,
  onSigned,
}: {
  colors: AppColors;
  wallet: WalletApi;
  qrText: string;
  onClose: () => void;
  onScanAgain: () => void;
  onOpenPortal: (url: string) => void;
  onRecordActivity: (entry: ActivityLog) => void;
  /** The signing key is about to be used: its own biometric prompt follows. */
  onSigningStarted?: () => void;
  /** The signing prompt succeeded (the answer was posted). */
  onSigned?: () => void;
}) {
  const { locale, t } = useI18n();
  const [state, rawDispatch] = useReducer(presentReducer, initialPresentState);
  const stateRef = useRef<PresentState>(state);
  const [summaries, setSummaries] = useState<Record<string, WalletCredentialSummary>>({});
  const [claims, setClaims] = useState<Record<string, Record<string, unknown>>>({});
  const [revealed, setRevealed] = useRevealedWhileActive();
  const [withheldOpen, setWithheldOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [attempt, setAttempt] = useState(0);

  const dispatch = useCallback((event: PresentEvent) => {
    stateRef.current = presentReducer(stateRef.current, event);
    rawDispatch(event);
  }, []);
  const actions = useMemo(() => createPresentationActions(wallet, { get: () => stateRef.current, dispatch }), [wallet, dispatch]);

  // Resolve the request; leaving the screen before it was answered declines it (no network).
  useEffect(() => {
    let live = true;
    wallet.presentations
      .resolve(qrText)
      .then((result) => live && dispatch({ type: 'resolved', result, nowMs: Date.now() }))
      .catch((error: unknown) => live && dispatch({ type: 'resolved', result: { ok: false, code: failureCodeOfError(error) }, nowMs: Date.now() }));
    return () => {
      live = false;
      actions.leave();
    };
  }, [qrText, wallet, attempt, actions, dispatch]);

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
  }, [request, wallet, dispatch]);

  // The request's countdown.
  useEffect(() => {
    if (state.phase !== 'consent') return;
    const timer = setInterval(() => {
      const nowMs = Date.now();
      setNow(nowMs);
      dispatch({ type: 'tick', nowMs });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.phase, dispatch]);

  const share = async () => {
    const result = await actions.share(onSigningStarted);
    if (!result) return;
    if (result.outcome !== 'failed') onSigned?.();
    onRecordActivity(
      presentationActivityEntry({
        id: randomId(),
        now: new Date(),
        verifierName: result.request.verifier.trusted ? result.request.verifier.ten : null,
        credentialId: result.credentialId,
        documentNameKey: result.documentNameKey,
        claims: result.claims,
        outcome: result.outcome,
        t,
      }),
    );
  };

  const decline = () => {
    actions.leave();
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
  const inConsent = state.phase === 'consent' || state.phase === 'submitting';
  const stop = state.phase === 'consent' ? stopOf(shareBlock(state)) : null;

  useAnnouncement(
    state.phase === 'sent'
      ? state.verifierName
        ? t('wallet.present.sentTitle', { name: state.verifierName })
        : t('wallet.present.sentTitleUnnamed')
      : state.phase === 'failed' || state.phase === 'refused'
        ? `${t(state.failure.titleKey)}. ${t(state.failure.sentenceKey)}`
        : stop
          ? t(STOP_SENTENCES[stop])
          : state.phase === 'consent' && state.failure
            ? t(state.failure.sentenceKey)
            : null,
  );

  const footer = inConsent ? (
    <ConsentFooter
      colors={colors}
      state={state}
      stop={stop}
      sharedLabels={labels(sharedFields(state, claims, locale))}
      onShare={() => void share()}
      onShareAnyway={() => dispatch({ type: 'share-untrusted' })}
      onConfirmUntrusted={() => {
        dispatch({ type: 'confirm-untrusted' });
        void share();
      }}
      onCancelUntrusted={() => dispatch({ type: 'cancel-untrusted' })}
      onDecline={decline}
      onScanAgain={onScanAgain}
    />
  ) : null;

  return (
    <>
      <ScreenScroll id={screenId} colors={colors} contentStyle={walletStyles.content} includeBottomInset={!footer}>
        <AppHeader colors={colors} title={t('wallet.present.headerTitle')} onBack={state.phase === 'sent' || state.phase === 'failed' ? onClose : decline} />

        {state.phase === 'resolving' ? (
          <View style={walletStyles.center}>
            <ActivityIndicator color={colors.primaryDark} size="large" />
            <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.present.checking')}</Text>
          </View>
        ) : null}

        {state.phase === 'refused' ? (
          <>
            <Text style={[walletStyles.title, styles.title, { color: colors.text }]}>{t(state.failure.titleKey)}</Text>
            <FailureNotice colors={colors} failure={state.failure} showTitle={false} />
            <View style={walletStyles.actions}>
              {state.retryLater ? (
                <PrimaryButton
                  colors={colors}
                  title={t('wallet.actions.tryAgain')}
                  onPress={() => {
                    dispatch({ type: 'retry' });
                    setAttempt((a) => a + 1);
                  }}
                />
              ) : (
                <PrimaryButton colors={colors} title={t('wallet.present.scanTheirCode')} onPress={onScanAgain} />
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

        {inConsent ? (
          <ConsentBody
            colors={colors}
            state={state}
            stop={stop}
            now={now}
            summaries={summaries}
            claims={claims[state.credentialId] ?? null}
            revealed={revealed}
            withheldOpen={withheldOpen}
            onToggleReveal={() => setRevealed((v) => !v)}
            onToggleWithheld={() => setWithheldOpen((v) => !v)}
            dispatch={dispatch}
            onRefreshStatus={(id) => void refreshStatus(id)}
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
            {MAYBE_SENT_CODES.has(state.failure.code) ? null : <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.nothingSent')}</Text>}
            <View style={walletStyles.actions}>
              {state.failure.action === 'request-again' && issuerPortalUrl(summaries[state.credentialId]?.issuerUri ?? '', locale) ? (
                <PrimaryButton colors={colors} title={t('wallet.restore.openPortal')} onPress={() => onOpenPortal(issuerPortalUrl(summaries[state.credentialId]!.issuerUri, locale)!)} />
              ) : (
                <PrimaryButton colors={colors} title={t('wallet.present.scanTheirCode')} onPress={onScanAgain} />
              )}
              <TextAction colors={colors} label={t('common.close')} onPress={onClose} />
            </View>
          </>
        ) : null}
      </ScreenScroll>
      {footer}
      <LoadingOverlay colors={colors} visible={state.phase === 'submitting'} title={t('wallet.present.sendingTitle')} description={t('wallet.present.sendingDescription')} />
    </>
  );
}

type ConsentLike = Extract<PresentState, { phase: 'consent' | 'submitting' }>;

function currentChoice(state: ConsentLike, claims: Record<string, unknown> | null, locale: Locale): ClaimSetChoice {
  const match = state.request.matches.find((m) => m.credentialId === state.credentialId)!;
  return claimSetChoice(match, state.claimSetIndex, match.vct, claims ?? {}, locale);
}

function sharedFields(state: ConsentLike, claims: Record<string, Record<string, unknown>>, locale: Locale): ConsentField[] {
  const choice = currentChoice(state, claims[state.credentialId] ?? null, locale);
  return [...choice.required, ...choice.optional];
}

function ConsentBody({
  colors,
  state,
  stop,
  now,
  summaries,
  claims,
  revealed,
  withheldOpen,
  onToggleReveal,
  onToggleWithheld,
  dispatch,
  onRefreshStatus,
  labels,
}: {
  colors: AppColors;
  state: ConsentLike;
  stop: Stop | null;
  now: number;
  summaries: Record<string, WalletCredentialSummary>;
  claims: Record<string, unknown> | null;
  revealed: boolean;
  withheldOpen: boolean;
  onToggleReveal: () => void;
  onToggleWithheld: () => void;
  dispatch: (e: PresentEvent) => void;
  onRefreshStatus: (credentialId: string) => void;
  labels: (f: ConsentField[]) => string;
}) {
  const { locale, t } = useI18n();
  const { request } = state;
  const trusted = request.verifier.trusted ? request.verifier : null;
  const purpose = purposeText(request, locale);
  const choices = documentChoices(request, Object.fromEntries(Object.entries(summaries).map(([id, s]) => [id, s.issuerUri])), locale);
  const choice = currentChoice(state, claims, locale);
  const shared = [...choice.required, ...choice.optional];
  const left = secondsLeft(request.expiresAt, now);
  const value = (f: ConsentField) => (claims === null ? '…' : revealed ? f.value || '—' : MASKED_VALUE);
  const canChoose = state.phase === 'consent' && !stop;
  const refreshing = state.phase === 'consent' && state.refreshing;

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

      {stop ? (
        // Right under who asks: nothing can be sent, and why.
        <View style={styles.section}>
          <View accessibilityRole="alert" style={[styles.blockNotice, { borderColor: colors.danger }]}>
            <Text style={[walletStyles.lead, { color: colors.text }]}>{t(STOP_SENTENCES[stop])}</Text>
          </View>
          {stop !== 'request-expired' ? (
            <Pressable accessibilityRole="button" accessibilityState={{ busy: refreshing }} disabled={refreshing} onPress={() => onRefreshStatus(state.credentialId)} style={[styles.refresh, { borderColor: colors.border }]}>
              {refreshing ? <ActivityIndicator color={colors.primaryDark} /> : <RefreshCw color={colors.primaryDark} size={18} />}
              <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{t('wallet.detail.checkAgain')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        // What leaves the phone, in one line that is never masked.
        <View style={[styles.summary, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[walletStyles.label, { color: colors.text }]}>{t('wallet.present.summary', { fields: labels(shared) })}</Text>
        </View>
      )}

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
                {choices.length > 1 ? <Radio colors={colors} selected={selected} /> : null}
                <CredentialIcon icon="graduation" boxSize={44} size={24} colors={colors} />
                <View style={styles.flex}>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{t(c.nameKey)}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{issuerText(c, t)}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t(trustPathKey(c))}</Text>
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

      {stop ? (
        // Nothing will be sent: the names of what was asked, no values, no choice.
        <Panel colors={colors}>
          <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.requestedLabel')}</Text>
          <Text style={[walletStyles.value, { color: colors.text }]}>{labels(shared)}</Text>
        </Panel>
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[walletStyles.sectionTitle, styles.flex, { color: colors.text }]}>{t('wallet.present.fieldsTitle')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={revealed ? t('wallet.detail.hideValues') : t('wallet.detail.showValues')}
                onPress={onToggleReveal}
                style={[styles.inline, styles.revealButton]}
              >
                {revealed ? <EyeOff color={colors.primaryDark} size={18} /> : <Eye color={colors.primaryDark} size={18} />}
                <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{revealed ? t('wallet.detail.hideValues') : t('wallet.detail.showValues')}</Text>
              </Pressable>
            </View>
            <Panel colors={colors} style={styles.listPanel}>
              {shared.map((f, i) => (
                <View key={f.name} style={[styles.field, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                  <View style={styles.fieldHead}>
                    <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t(f.labelKey)}</Text>
                    {choice.required.includes(f) ? <Text style={[styles.tag, { color: colors.textSecondary, borderColor: colors.border }]}>{t('wallet.present.required')}</Text> : null}
                  </View>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{value(f)}</Text>
                </View>
              ))}
            </Panel>
            {choice.required.length > 0 && choice.options.length > 1 ? <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.requiredHint')}</Text> : null}
            {canChoose ? <ClaimSetOptions colors={colors} choice={choice} labels={labels} onSelect={(index) => dispatch({ type: 'select-claim-set', index })} /> : null}
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
        </>
      )}

      {!stop && (trusted || state.untrusted !== 'warning') ? (
        <BiometricNote colors={colors} button={trusted ? t('wallet.present.share') : t('wallet.present.confirmUntrusted')} />
      ) : null}
    </>
  );
}

/**
 * The verifier's options. Two: one switch naming what it adds and drops. More: an explicit list,
 * each option naming exactly the fields it sends ("Đủ như yêu cầu", "Ít hơn: …").
 */
function ClaimSetOptions({ colors, choice, labels, onSelect }: { colors: AppColors; choice: ClaimSetChoice; labels: (f: ConsentField[]) => string; onSelect: (index: number) => void }) {
  const { t } = useI18n();
  if (choice.options.length < 2) return null;
  if (choice.options.length === 2) {
    const other = choice.options.find((o) => o.index !== choice.index)!;
    const title = other.first ? t('wallet.present.shareFull') : other.added.length === 0 ? t('wallet.present.shareLess') : t('wallet.present.shareOther');
    return (
      <Pressable accessibilityRole="button" onPress={() => onSelect(other.index)} style={[styles.switchRow, { borderColor: colors.border }]}>
        <Text style={[walletStyles.label, { color: colors.primaryDark }]}>{title}</Text>
        {other.added.length ? <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.shareFullHint', { fields: labels(other.added) })}</Text> : null}
        {other.dropped.length ? <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.shareLessHint', { fields: labels(other.dropped) })}</Text> : null}
      </Pressable>
    );
  }
  const first = choice.options[0]!;
  const firstNames = new Set(first.fields.map((f) => f.name));
  return (
    <View accessibilityRole="radiogroup" style={styles.section}>
      <Text style={[walletStyles.label, { color: colors.text }]}>{t('wallet.present.optionsTitle')}</Text>
      <Panel colors={colors} style={styles.listPanel}>
        {choice.options.map((o, i) => {
          const selected = o.index === choice.index;
          const smaller = o.fields.every((f) => firstNames.has(f.name));
          const names = new Set(o.fields.map((f) => f.name));
          const title = o.first ? t('wallet.present.optionFull') : smaller ? t('wallet.present.optionLess', { fields: labels(first.fields.filter((f) => !names.has(f.name))) }) : t('wallet.present.optionOther');
          return (
            <Pressable
              key={o.index}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onSelect(o.index)}
              style={[styles.optionRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
            >
              <Radio colors={colors} selected={selected} />
              <View style={styles.flex}>
                <Text style={[walletStyles.value, { color: colors.text }]}>{title}</Text>
                <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.present.optionSends', { fields: labels(o.fields) })}</Text>
              </View>
            </Pressable>
          );
        })}
      </Panel>
    </View>
  );
}

function ConsentFooter({
  colors,
  state,
  stop,
  sharedLabels,
  onShare,
  onShareAnyway,
  onConfirmUntrusted,
  onCancelUntrusted,
  onDecline,
  onScanAgain,
}: {
  colors: AppColors;
  state: ConsentLike;
  stop: Stop | null;
  sharedLabels: string;
  onShare: () => void;
  onShareAnyway: () => void;
  onConfirmUntrusted: () => void;
  onCancelUntrusted: () => void;
  onDecline: () => void;
  onScanAgain: () => void;
}) {
  const { t } = useI18n();
  const untrusted = !state.request.verifier.trusted && state.phase === 'consent' ? state.untrusted : null;
  if (stop === 'request-expired') {
    return (
      <StickyFooter colors={colors}>
        <PrimaryButton colors={colors} title={t('wallet.present.scanTheirCode')} onPress={onScanAgain} />
        <TextAction colors={colors} label={t('wallet.present.decline')} onPress={onDecline} />
      </StickyFooter>
    );
  }
  if (stop) {
    // Nothing to sign: "Kiểm tra lại" (by the notice) or declining.
    return (
      <StickyFooter colors={colors}>
        <PrimaryButton colors={colors} title={t('wallet.present.decline')} onPress={onDecline} />
      </StickyFooter>
    );
  }
  if (untrusted === 'warning') {
    return (
      <StickyFooter colors={colors}>
        <PrimaryButton colors={colors} title={t('wallet.present.decline')} onPress={onDecline} />
        <TextAction colors={colors} tone="danger" label={t('wallet.present.shareAnyway')} onPress={onShareAnyway} />
      </StickyFooter>
    );
  }
  if (untrusted === 'confirming') {
    return (
      <StickyFooter colors={colors}>
        <View accessibilityRole="alert" style={styles.confirmText}>
          <Text style={[styles.untrustedTitle, { color: colors.text }]}>{t('wallet.present.confirmUntrustedTitle')}</Text>
          <Text style={[walletStyles.meta, { color: colors.text }]}>{t('wallet.present.confirmUntrustedBody', { fields: sharedLabels })}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onConfirmUntrusted} style={({ pressed }) => [styles.dangerButton, { borderColor: colors.danger, opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.dangerLabel, { color: colors.danger }]}>{t('wallet.present.confirmUntrusted')}</Text>
        </Pressable>
        <TextAction colors={colors} label={t('wallet.present.back')} onPress={onCancelUntrusted} />
      </StickyFooter>
    );
  }
  return (
    <StickyFooter colors={colors}>
      {/* The last attempt sent nothing (prompt cancelled, phone locked): said next to the button. */}
      {state.phase === 'consent' && state.failure ? <FailureNotice colors={colors} failure={state.failure} /> : null}
      <PrimaryButton colors={colors} title={t('wallet.present.share')} onPress={onShare} loading={state.phase === 'submitting'} />
      <TextAction colors={colors} label={t('wallet.present.decline')} onPress={onDecline} disabled={state.phase === 'submitting'} />
    </StickyFooter>
  );
}

function Radio({ colors, selected }: { colors: AppColors; selected: boolean }) {
  return <View style={[styles.radio, { borderColor: selected ? colors.primaryDark : colors.textSecondary }]}>{selected ? <View style={[styles.radioDot, { backgroundColor: colors.primaryDark }]} /> : null}</View>;
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

/** Names the button that actually starts the signing prompt. */
function BiometricNote({ colors, button }: { colors: AppColors; button: string }) {
  const { t } = useI18n();
  return (
    <View style={[styles.note, { backgroundColor: colors.surfaceMuted }]}>
      <Fingerprint color={colors.primaryDark} size={20} strokeWidth={1.9} />
      <Text style={[styles.noteText, { color: colors.text }]}>{t('wallet.present.biometricNote', { button })}</Text>
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
  revealButton: { minHeight: 44, minWidth: 44, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  listPanel: { paddingVertical: 0 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 72 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 56 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  pillRow: { flexDirection: 'row', marginTop: 2 },
  field: { paddingVertical: spacing.md, gap: 2 },
  fieldHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { fontSize: 11, fontWeight: typography.weight.semibold, borderWidth: 1, borderRadius: radius.round, paddingHorizontal: 6, paddingVertical: 1 },
  switchRow: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 2, minHeight: 44 },
  blockNotice: { borderWidth: border.medium, borderRadius: radius.lg, padding: spacing.lg },
  refresh: { minHeight: 44, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  confirmText: { gap: spacing.xs, paddingBottom: spacing.xs },
  dangerButton: { minHeight: 48, borderWidth: border.medium, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  dangerLabel: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  note: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 16, padding: spacing.md },
  noteText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
