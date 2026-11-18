import { CheckCircle2, Fingerprint, ShieldCheck } from 'lucide-react-native';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppHeader, CredentialIcon, PrimaryButton, ScreenScroll } from '../../../components/AppUiPrimitives';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { documentNameKeys, documentTypeOf } from '../../../domain/wallet/credentialPresentation';
import type { WalletApi } from '../../../domain/wallet/walletContainer';
import { initialReceiveState, receiveReducer, shouldClearPin, type ReceiveEvent, type ReceiveState } from '../../../domain/wallet/walletFlows';
import { failureCodeOfError } from '../../../domain/wallet/walletMessages';
import { issuerPortalUrl, offerView, sanitizePin } from '../../../domain/wallet/walletViews';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { spacing } from '../../../theme';
import { FailureNotice, Panel, PinCodeInput, TextAction, walletStyles } from '../wallet/WalletParts';

/**
 * "Nhận giấy tờ": who offers what, the PIN, then the result. The PIN lives in this component's
 * state only and is dropped on unmount and after a wrong attempt.
 */
export function ReceiveCredentialScreen({
  colors,
  wallet,
  qrText,
  onClose,
  onScanAgain,
  onOpenCredential,
  onOpenPortal,
}: {
  colors: AppColors;
  wallet: WalletApi;
  qrText: string;
  onClose: () => void;
  onScanAgain: () => void;
  onOpenCredential: (credentialId: string) => void;
  onOpenPortal: (url: string) => void;
}) {
  const { locale, t } = useI18n();
  const [state, rawDispatch] = useReducer(receiveReducer, initialReceiveState);
  const [pin, setPin] = useState('');
  const stateRef = useRef<ReceiveState>(state);
  stateRef.current = state;

  const dispatch = (event: ReceiveEvent) => {
    const next = receiveReducer(stateRef.current, event);
    if (shouldClearPin(stateRef.current, next)) setPin('');
    stateRef.current = next;
    rawDispatch(event);
  };

  useEffect(() => () => setPin(''), []);

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
  }, [state.phase, qrText, wallet]);

  const view = state.phase === 'consent' || state.phase === 'accepting' ? offerView(state.offer, locale) : null;
  const pinReady = !view?.pin || pin.length === view.pin.length;

  const submit = async () => {
    const current = stateRef.current;
    if (current.phase !== 'consent' || !pinReady) return;
    const offer = current.offer;
    const txCode = view?.pin ? pin : undefined;
    dispatch({ type: 'submit' });
    try {
      dispatch({ type: 'accepted', result: await wallet.offers.accept(offer, txCode === undefined ? {} : { txCode }) });
    } catch (error) {
      dispatch({ type: 'accept-threw', code: failureCodeOfError(error) });
    }
  };

  return (
    <>
      <ScreenScroll id={screenIdOf(state)} colors={colors} contentStyle={walletStyles.content}>
        <AppHeader colors={colors} title={t('wallet.receive.headerTitle')} onBack={onClose} />

        {state.phase === 'resolving' ? (
          <View style={walletStyles.center}>
            <ActivityIndicator color={colors.primaryDark} size="large" />
            <Text style={[walletStyles.lead, { color: colors.text }]}>{t('wallet.receive.checking')}</Text>
          </View>
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

        {view && (state.phase === 'consent' || state.phase === 'accepting') ? (
          <>
            <View style={styles.intro}>
              <Text style={[walletStyles.title, styles.offerTitle, { color: colors.text }]}>{t('wallet.receive.offerTitle', { issuer: view.issuerName, document: t(view.documentNameKey) })}</Text>
              <Text style={[walletStyles.lead, { color: colors.textSecondary }]}>{t('wallet.receive.lead')}</Text>
            </View>

            <Panel colors={colors}>
              <View style={walletStyles.row}>
                <CredentialIcon icon="graduation" boxSize={48} size={26} />
                <View style={styles.flex}>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.documentLabel')}</Text>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{t(view.documentNameKey)}</Text>
                </View>
              </View>
              <View style={[walletStyles.divider, { backgroundColor: colors.border }]} />
              <View style={walletStyles.row}>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
                  <ShieldCheck color={colors.primaryDark} size={24} strokeWidth={1.8} />
                </View>
                <View style={styles.flex}>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.issuerLabel')}</Text>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{view.issuerName}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{t('wallet.receive.issuerChecked')}</Text>
                </View>
              </View>
            </Panel>

            {view.pin ? (
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

            {state.phase === 'consent' && state.failure ? <FailureNotice colors={colors} failure={state.failure} /> : null}

            <View style={[styles.biometricNote, { backgroundColor: colors.surfaceMuted }]}>
              <Fingerprint color={colors.primaryDark} size={20} strokeWidth={1.9} />
              <Text style={[styles.biometricText, { color: colors.text }]}>{t('wallet.receive.biometricNote')}</Text>
            </View>

            <View style={walletStyles.actions}>
              <PrimaryButton
                colors={colors}
                title={t('wallet.receive.accept')}
                onPress={() => void submit()}
                loading={state.phase === 'accepting'}
                style={!pinReady ? styles.disabled : undefined}
              />
              {!pinReady ? <Text style={[walletStyles.meta, styles.centerText, { color: colors.textSecondary }]}>{t('wallet.receive.pinIncomplete')}</Text> : null}
              <TextAction colors={colors} label={t('common.cancel')} onPress={onClose} disabled={state.phase === 'accepting'} />
            </View>
          </>
        ) : null}

        {state.phase === 'received' ? (
          <>
            <View style={walletStyles.center}>
              <CheckCircle2 color={colors.success} size={56} strokeWidth={1.8} />
              <Text style={[walletStyles.title, styles.centerText, { color: colors.text }]}>{t('wallet.receive.successTitle')}</Text>
              <Text style={[walletStyles.lead, styles.centerText, { color: colors.textSecondary }]}>{t('wallet.receive.successLead')}</Text>
            </View>
            <Panel colors={colors}>
              <View style={walletStyles.row}>
                <CredentialIcon icon="graduation" boxSize={48} size={26} />
                <View style={styles.flex}>
                  <Text style={[walletStyles.value, { color: colors.text }]}>{t(documentNameKeys[documentTypeOf(state.vct)])}</Text>
                  <Text style={[walletStyles.meta, { color: colors.textSecondary }]}>{state.issuerName}</Text>
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
            <AcceptFailedActions colors={colors} portalUrl={issuerPortalUrl(state.issuerUri, locale)} contactIssuer={state.failure.action === 'contact-issuer'} onOpenPortal={onOpenPortal} onScanAgain={onScanAgain} onClose={onClose} />
          </>
        ) : null}
      </ScreenScroll>
      <LoadingOverlay colors={colors} visible={state.phase === 'accepting'} title={t('wallet.receive.acceptingTitle')} description={t('wallet.receive.acceptingDescription')} />
    </>
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
    case 'resolving':
      return 'screen-receive-credential-checking';
    case 'resolve-failed':
      return 'screen-receive-credential-unavailable';
    case 'consent':
    case 'accepting':
      return 'screen-receive-credential';
    case 'received':
      return 'screen-receive-credential-success';
    case 'accept-failed':
      return 'screen-receive-credential-failed';
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  intro: { gap: spacing.xs },
  offerTitle: { fontSize: 24, lineHeight: 31 },
  pinSection: { gap: spacing.sm },
  biometricNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 16, padding: spacing.md },
  biometricText: { flex: 1, fontSize: 14, lineHeight: 20 },
  centerText: { textAlign: 'center' },
  disabled: { opacity: 0.45 },
});
