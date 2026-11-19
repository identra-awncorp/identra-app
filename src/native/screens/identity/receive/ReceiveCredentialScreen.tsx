import { Building2, CheckCircle2, Fingerprint, LockKeyhole } from 'lucide-react-native';
import type { ResolvedOffer } from '@identra/sdk-app';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { AppHeader, CredentialIcon, PrimaryButton, ScreenScroll, StatusPill } from '../../../components/AppUiPrimitives';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { documentNameKeys, documentTypeOf, issuerDisplayName } from '../../../domain/wallet/credentialPresentation';
import type { WalletApi } from '../../../domain/wallet/walletContainer';
import { abandonOffer, initialReceiveState, receiveReducer, runAccept, shouldClearPin, type ReceiveEvent, type ReceiveState } from '../../../domain/wallet/walletFlows';
import { issuerLabel, issuerPortalUrl, offerView, sanitizePin } from '../../../domain/wallet/walletViews';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { spacing } from '../../../theme';
import { FailureNotice, Panel, PinCodeInput, StickyFooter, TextAction, useAnnouncement, walletStyles } from '../wallet/WalletParts';

/**
 * "Nhận giấy tờ": first whether this phone can protect a key at all (before any code is spent),
 * then who offers what and the PIN, then the result. The PIN lives in this component's state
 * only and is dropped on unmount and after a wrong attempt.
 */
export function ReceiveCredentialScreen({
  colors,
  wallet,
  qrText,
  checkKeyProtection,
  onClose,
  onScanAgain,
  onOpenCredential,
  onOpenPortal,
  onOpenSettings,
  onReceived,
}: {
  colors: AppColors;
  wallet: WalletApi;
  qrText: string;
  checkKeyProtection: () => Promise<boolean>;
  onClose: () => void;
  onScanAgain: () => void;
  onOpenCredential: (credentialId: string) => void;
  onOpenPortal: (url: string) => void;
  onOpenSettings: () => void;
  /** The platform just verified biometrics for the new key. */
  onReceived: () => void;
}) {
  const { locale, t } = useI18n();
  const [state, rawDispatch] = useReducer(receiveReducer, initialReceiveState);
  const [pin, setPin] = useState('');
  const stateRef = useRef<ReceiveState>(state);
  const resolvedOffer = useRef<ResolvedOffer | null>(null);

  const onReceivedRef = useRef(onReceived);
  onReceivedRef.current = onReceived;
  // Stable: it reads only refs and setters, so effects can use it without re-running.
  const dispatch = useCallback((event: ReceiveEvent) => {
    const next = receiveReducer(stateRef.current, event);
    if (shouldClearPin(stateRef.current, next)) setPin('');
    if (next.phase === 'received' && stateRef.current.phase !== 'received') onReceivedRef.current();
    if (next.phase === 'consent') resolvedOffer.current = next.offer;
    stateRef.current = next;
    rawDispatch(event);
  }, []);

  // Leaving with a resolved offer that was not received: let the SDK forget its token and any key
  // waiting for a retried save. The PIN goes with the component.
  useEffect(
    () => () => {
      setPin('');
      abandonOffer(stateRef.current, resolvedOffer.current, wallet);
    },
    [wallet],
  );

  useEffect(() => {
    if (state.phase !== 'checking-device') return;
    let live = true;
    checkKeyProtection()
      .catch(() => false)
      .then((ready) => live && dispatch({ type: 'device-checked', ready }));
    return () => {
      live = false;
    };
  }, [state.phase, checkKeyProtection, dispatch]);

  useEffect(() => {
    if (state.phase !== 'resolving') return;
    let live = true;
    wallet.offers
      .resolve(qrText)
      .then((result) => live && dispatch({ type: 'resolved', result }))
      .catch(() => live && dispatch({ type: 'resolved', result: { ok: false, code: 'NETWORK_ERROR' } }));
    return () => {
      live = false;
    };
  }, [state.phase, qrText, wallet, dispatch]);

  useAnnouncement(
    (state.phase === 'consent' || state.phase === 'resume') && state.failure
      ? `${t(state.failure.titleKey)}. ${t(state.failure.sentenceKey)}`
      : state.phase === 'accept-failed' || state.phase === 'resolve-failed'
        ? t(state.failure.sentenceKey)
        : state.phase === 'received'
          ? t('wallet.receive.successTitle')
          : null,
  );

  const offer = state.phase === 'consent' || state.phase === 'accepting' || state.phase === 'resume' ? state.offer : null;
  const view = offer ? offerView(offer, locale) : null;
  const resuming = state.phase === 'resume' || (state.phase === 'accepting' && state.resuming);
  const pinReady = resuming || !view?.pin || pin.length === view.pin.length;

  // On resume the SDK keeps the access token: no PIN is sent again (acceptInput).
  const submit = () => runAccept({ get: () => stateRef.current, dispatch }, wallet, pin, view?.pin?.length ?? null);

  const footer =
    view && (state.phase === 'consent' || state.phase === 'accepting' || state.phase === 'resume') ? (
      <StickyFooter colors={colors}>
        {/* Next to the button, so it is seen without scrolling (the PIN step is long on small phones). */}
        {(state.phase === 'consent' || state.phase === 'resume') && state.failure ? <FailureNotice colors={colors} failure={state.failure} /> : null}
        <PrimaryButton
          colors={colors}
          title={resuming ? t('wallet.actions.tryAgain') : t('wallet.receive.accept')}
          onPress={() => void submit()}
          loading={state.phase === 'accepting'}
          disabled={!pinReady}
        />
        {!pinReady ? <Text style={[walletStyles.meta, styles.centerText, { color: colors.textSecondary }]}>{t('wallet.receive.pinIncomplete')}</Text> : null}
        <TextAction colors={colors} label={t('common.cancel')} onPress={onClose} disabled={state.phase === 'accepting'} />
      </StickyFooter>
    ) : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.flexFill, { backgroundColor: colors.background }]}>
      <ScreenScroll id={screenIdOf(state)} colors={colors} contentStyle={walletStyles.content} includeBottomInset={!footer}>
        <AppHeader colors={colors} title={t('wallet.receive.headerTitle')} onBack={onClose} />

        {state.phase === 'checking-device' || state.phase === 'resolving' ? (
          <View style={walletStyles.center}>
            <ActivityIndicator color={colors.primaryDark} size="large" />
            <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.receive.checking')}</Text>
          </View>
        ) : null}

        {state.phase === 'device-not-ready' ? (
          <>
            <View style={styles.intro}>
              <LockKeyhole color={colors.primaryDark} size={40} strokeWidth={1.7} />
              <Text style={[walletStyles.title, styles.offerTitle, { color: colors.text }]}>{t('wallet.receive.deviceNotReadyTitle')}</Text>
              <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.receive.deviceNotReadyBody')}</Text>
              <Text style={[walletStyles.lead, { color: colors.textSecondary }]}>{t('wallet.receive.deviceNotReadyCodeSafe')}</Text>
            </View>
            <View style={walletStyles.actions}>
              <PrimaryButton colors={colors} title={t('wallet.receive.openSettings')} onPress={onOpenSettings} />
              <TextAction colors={colors} label={t('common.close')} onPress={onClose} />
            </View>
          </>
        ) : null}

        {state.phase === 'resolve-failed' ? (
          <>
            <FailureNotice colors={colors} failure={state.failure} />
            <View style={walletStyles.actions}>
              {state.failure.action === 'retry' ? (
                <PrimaryButton colors={colors} title={t('wallet.actions.tryAgain')} onPress={() => dispatch({ type: 'retry-resolve' })} />
              ) : (
                <PrimaryButton colors={colors} title={t('wallet.actions.scanAgain')} onPress={onScanAgain} />
              )}
              <TextAction colors={colors} label={t('common.close')} onPress={onClose} />
            </View>
          </>
        ) : null}

        {view && offer && (state.phase === 'consent' || state.phase === 'accepting' || state.phase === 'resume') ? (
          <>
            <View style={styles.intro}>
              <Text style={[walletStyles.title, styles.offerTitle, { color: colors.text }]}>{t('wallet.receive.offerTitle', { issuer: view.issuerName, document: t(view.documentNameKey) })}</Text>
              <Text style={[walletStyles.lead, { color: colors.textSecondary }]}>{t('wallet.receive.lead')}</Text>
            </View>

            <Panel colors={colors}>
              <View style={walletStyles.row}>
                <CredentialIcon icon="graduation" boxSize={48} size={26} colors={colors} />
                <View style={styles.flex}>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.documentLabel')}</Text>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{t(view.documentNameKey)}</Text>
                </View>
              </View>
              <View style={[walletStyles.divider, { backgroundColor: colors.border }]} />
              <View style={walletStyles.row}>
                {/* Neutral icon: this name is the sender's own claim until the document is checked. */}
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
                  <Building2 color={colors.textSecondary} size={24} strokeWidth={1.8} />
                </View>
                <View style={styles.flex}>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.issuerLabel')}</Text>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{t('wallet.receive.issuerClaimed', { name: view.issuerName })}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{view.issuerOrigin ?? issuerDisplayName(offer.issuerUri)}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.issuerChecked')}</Text>
                </View>
              </View>
            </Panel>

            {view.pin && !resuming ? (
              <View style={styles.pinSection}>
                <Text style={[walletStyles.label, { color: colors.text }]}>{t('wallet.receive.pinLabel', { length: view.pin.length })}</Text>
                <PinCodeInput
                  colors={colors}
                  editable={state.phase === 'consent'}
                  error={state.phase === 'consent' && state.failure?.code === 'TX_CODE_WRONG'}
                  label={t('wallet.receive.pinLabel', { length: view.pin.length })}
                  length={view.pin.length}
                  numeric={view.pin.numeric}
                  onChangeText={(text) => setPin(sanitizePin(text, view.pin))}
                  value={pin}
                />
                <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.pinHint')}</Text>
              </View>
            ) : null}

            <View style={[styles.biometricNote, { backgroundColor: colors.surfaceMuted }]}>
              <Fingerprint color={colors.primaryDark} size={20} strokeWidth={1.9} />
              <Text style={[styles.biometricText, { color: colors.text }]}>
                {t(Platform.OS === 'android' ? 'wallet.receive.biometricNoteAndroid' : 'wallet.receive.biometricNote', { button: resuming ? t('wallet.actions.tryAgain') : t('wallet.receive.accept') })}
              </Text>
            </View>
          </>
        ) : null}

        {state.phase === 'received' ? (
          <>
            <View style={walletStyles.center}>
              <CheckCircle2 color={colors.success} size={56} strokeWidth={1.8} />
              <Text style={[walletStyles.title, styles.centerText, { color: colors.text }]}>{t('wallet.receive.successTitle')}</Text>
              <Text style={[walletStyles.lead, styles.centerText, { color: colors.textSecondary }]}>
                {state.status === 'unknown' ? t('wallet.receive.successLeadUnchecked') : t('wallet.receive.successLead')}
              </Text>
            </View>
            <Panel colors={colors}>
              <View style={walletStyles.row}>
                <CredentialIcon icon="graduation" boxSize={48} size={26} colors={colors} />
                <View style={styles.flex}>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{t(documentNameKeys[documentTypeOf(state.vct)])}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{issuerLabel(state.issuerUri, state.issuerName, locale)}</Text>
                  <View style={styles.pillRow}>
                    <StatusPill status={state.status === 'unknown' ? 'unknown' : 'verified'} compact colors={colors} />
                  </View>
                </View>
              </View>
            </Panel>
            <View style={walletStyles.actions}>
              <PrimaryButton colors={colors} title={t('wallet.receive.viewDocument')} onPress={() => onOpenCredential(state.credentialId)} />
              <TextAction colors={colors} label={t('common.close')} onPress={onClose} />
            </View>
          </>
        ) : null}

        {state.phase === 'accept-failed' ? (
          <>
            <FailureNotice colors={colors} failure={state.failure} />
            <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.nothingSaved')}</Text>
            <Text style={[walletStyles.lead, { color: colors.text }]}>{state.codeSpent ? t('wallet.receive.codeSpent') : t('wallet.receive.newCodeNeeded')}</Text>
            <AcceptFailedActions colors={colors} portalUrl={issuerPortalUrl(state.issuerUri, locale)} contactIssuer={state.failure.action === 'contact-issuer'} onOpenPortal={onOpenPortal} onScanAgain={onScanAgain} onClose={onClose} />
          </>
        ) : null}
      </ScreenScroll>
      {footer}
      <LoadingOverlay colors={colors} visible={state.phase === 'accepting'} title={t('wallet.receive.acceptingTitle')} description={t('wallet.receive.acceptingDescription')} />
    </KeyboardAvoidingView>
  );
}

/** One primary action: the issuer's page when the issuer must act and we know where, else a new scan. */
function AcceptFailedActions({ colors, portalUrl, contactIssuer, onOpenPortal, onScanAgain, onClose }: { colors: AppColors; portalUrl: string | null; contactIssuer: boolean; onOpenPortal: (url: string) => void; onScanAgain: () => void; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <View style={walletStyles.actions}>
      {contactIssuer && portalUrl ? (
        <>
          <PrimaryButton colors={colors} title={t('wallet.restore.openPortal')} onPress={() => onOpenPortal(portalUrl)} />
          <TextAction colors={colors} label={t('wallet.actions.scanAgain')} onPress={onScanAgain} />
        </>
      ) : (
        <PrimaryButton colors={colors} title={t('wallet.actions.scanAgain')} onPress={onScanAgain} />
      )}
      <TextAction colors={colors} label={t('common.close')} onPress={onClose} />
    </View>
  );
}

function screenIdOf(state: ReceiveState): string {
  switch (state.phase) {
    case 'checking-device':
    case 'resolving':
      return 'screen-receive-credential-checking';
    case 'device-not-ready':
      return 'screen-receive-credential-device-not-ready';
    case 'resolve-failed':
      return 'screen-receive-credential-unavailable';
    case 'consent':
    case 'accepting':
      return 'screen-receive-credential';
    case 'resume':
      return 'screen-receive-credential-resume';
    case 'received':
      return 'screen-receive-credential-success';
    case 'accept-failed':
      return 'screen-receive-credential-failed';
  }
}

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  flex: { flex: 1, gap: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pillRow: { flexDirection: 'row', marginTop: 2 },
  intro: { gap: spacing.xs },
  offerTitle: { fontSize: 24, lineHeight: 31 },
  pinSection: { gap: spacing.sm },
  biometricNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 16, padding: spacing.md },
  biometricText: { flex: 1, fontSize: 14, lineHeight: 20 },
  centerText: { textAlign: 'center' },
});
