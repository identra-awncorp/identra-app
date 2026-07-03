import {
  BadgeCheck,
  Check,
  CreditCard,
  Fingerprint,
  ReceiptText,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader, Card, ListChevron, PrimaryButton, ScreenScroll } from '../../components/AppUiPrimitives';
import {
  getTransferRecipientById,
  transferRecipients,
  type TransferRecipient,
} from '../../data/demo/paymentTransferDemoData';
import {
  isPaymentRequestLoading,
  parsePaymentBalance,
  runPaymentRequest,
  waitForPaymentRequest,
  type PaymentRequestState,
} from '../../domain/payment/paymentRequest';
import {
  canClosePaymentAuth,
  closePaymentAuthState,
  createClosedPaymentAuthState,
  isPaymentAuthOpen,
  markPaymentAuthDuplicate,
  markPaymentAuthFailed,
  markPaymentAuthLoading,
  openPaymentAuthState,
} from '../../domain/payment/paymentAuth';
import {
  createTransferReceipt,
  normalizePaymentRouteMemo,
  parsePaymentRouteAmount,
  validateTransferAmount,
  type TransferReceipt,
} from '../../domain/payment/paymentTransfer';
import { paymentCards } from '../../data/demo/paymentHomeDemoData';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../theme';
import { formatAmount, parseRawAmount } from '../chat/paymentUtils';
import { PaymentRequestFeedback } from './components/PaymentRequestFeedback';
import { paymentSurfaces } from './components/paymentSurfaces';
import { paymentCardText, paymentT } from './paymentI18n';

export function TransferRecipientScreen({
  colors,
  onBack,
  onSelectRecipient,
}: {
  colors: AppColors;
  onBack: () => void;
  onSelectRecipient: (recipient: TransferRecipient) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRecipients = transferRecipients.filter((recipient) => {
    if (!normalizedQuery) return true;
    return `${recipient.name} ${recipient.account} ${recipient.bank}`.toLowerCase().includes(normalizedQuery);
  });

  return (
    <ScreenScroll id="screen-transfer-recipient" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={paymentT(t, 'transfer.recipient.title')} onBack={onBack} />
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.textSecondary} size={22} strokeWidth={2} />
        <TextInput
          accessibilityLabel={paymentT(t, 'transfer.recipient.searchAccessibility')}
          onChangeText={setQuery}
          placeholder={paymentT(t, 'transfer.recipient.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={query}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'transfer.recipient.recent')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        {visibleRecipients.map((recipient, index) => (
          <TransferRecipientRow
            key={recipient.id}
            colors={colors}
            divider={index > 0}
            recipient={recipient}
            selectLabel={paymentT(t, 'transfer.recipient.selectRecipient', { name: recipient.name })}
            onPress={() => onSelectRecipient(recipient)}
          />
        ))}
      </Card>
    </ScreenScroll>
  );
}

export function TransferAmountScreen({
  colors,
  onBack,
  onContinue,
  recipientId,
}: {
  colors: AppColors;
  onBack: () => void;
  onContinue: (draft: { amount: number; note: string; recipient: TransferRecipient }) => void;
  recipientId?: string | string[];
}) {
  const { t } = useI18n();
  const recipient = getTransferRecipientById(recipientId);
  const source = paymentCards[0];
  const availableBalance = parsePaymentBalance(source.balance);
  const [rawAmount, setRawAmount] = useState(0);
  const [note, setNote] = useState('');
  const quickAmounts = [100_000, 200_000, 500_000, 1_000_000];

  const submit = () => {
    const validation = validateTransferAmount({ amount: rawAmount, availableBalance });

    if (!validation.ok && validation.reason === 'missing_amount') {
      Alert.alert(paymentT(t, 'transfer.amount.missingTitle'), paymentT(t, 'transfer.amount.missingDescription'));
      return;
    }

    if (!validation.ok && validation.reason === 'insufficient_balance') {
      Alert.alert(paymentT(t, 'request.failures.insufficient_balance.title'), paymentT(t, 'request.failures.insufficient_balance.description'));
      return;
    }

    onContinue({ amount: rawAmount, note, recipient });
  };

  return (
    <ScreenScroll id="screen-transfer-amount" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={paymentT(t, 'transfer.amount.title')} onBack={onBack} />
      <RecipientSummary colors={colors} recipient={recipient} />

      <Card colors={colors} style={[paymentSurfaces.card, styles.sourceCard]}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
          <CreditCard color={colors.primaryDark} size={23} strokeWidth={2} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{paymentCardText(t, source, 'balanceLabel')}</Text>
          <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{source.accountNumber}</Text>
        </View>
        <Text style={[styles.sourceBalance, { color: colors.text }]}>{source.balance} VND</Text>
      </Card>

      <Text style={[styles.fieldLabel, { color: colors.text }]}>{paymentT(t, 'common.amount')}</Text>
      <View style={[styles.amountBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          accessibilityLabel={paymentT(t, 'transfer.amount.amountAccessibility')}
          keyboardType="numeric"
          onChangeText={(value) => setRawAmount(parseRawAmount(value))}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          style={[styles.amountInput, { color: colors.text }]}
          value={formatAmount(rawAmount)}
        />
        <Text style={[styles.amountCurrency, { color: colors.textSecondary }]}>VND</Text>
      </View>
      <View style={styles.quickAmountRow}>
        {quickAmounts.map((amount) => (
          <Pressable
            key={amount}
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'transfer.amount.quickAmountAccessibility', { amount: formatAmount(amount) })}
            onPress={() => setRawAmount(amount)}
            style={({ pressed }) => [
              styles.quickAmount,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Text style={[styles.quickAmountText, { color: colors.primaryDark }]}>{formatAmount(amount)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { color: colors.text }]}>{paymentT(t, 'common.note')}</Text>
      <TextInput
        accessibilityLabel={paymentT(t, 'transfer.amount.noteAccessibility')}
        onChangeText={setNote}
        placeholder={paymentT(t, 'transfer.amount.notePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.noteInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        value={note}
      />

      <PrimaryButton colors={colors} title={t('common.continue')} onPress={submit} />
    </ScreenScroll>
  );
}

export function TransferConfirmScreen({
  amount,
  colors,
  confirmBeforeTransfer = true,
  note,
  onBack,
  onComplete,
  recipientId,
}: {
  amount?: string | string[];
  colors: AppColors;
  confirmBeforeTransfer?: boolean;
  note?: string | string[];
  onBack: () => void;
  onComplete: (receipt: TransferReceipt) => void;
  recipientId?: string | string[];
}) {
  const { t } = useI18n();
  const [authState, setAuthState] = useState(createClosedPaymentAuthState);
  const submittingRef = useRef(false);
  const recipient = getTransferRecipientById(recipientId);
  const source = paymentCards[0];
  const availableBalance = parsePaymentBalance(source.balance);
  const parsedAmount = parsePaymentRouteAmount(amount);
  const normalizedNote = normalizePaymentRouteMemo(note);
  const receiptPreview = useMemo(
    () => createTransferReceipt({
      amount: parsedAmount,
      note: normalizedNote,
      recipient,
      sourceAccount: source.accountNumber,
      sourceName: source.balanceLabel,
    }),
    [normalizedNote, parsedAmount, recipient, source.accountNumber, source.balanceLabel],
  );
  const openAuthSheet = () => {
    setAuthState(openPaymentAuthState());
  };

  const requestAuthSheet = () => {
    if (!confirmBeforeTransfer) {
      openAuthSheet();
      return;
    }

    Alert.alert(paymentT(t, 'transfer.confirm.preAuthTitle'), paymentT(t, 'transfer.confirm.preAuthDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: paymentT(t, 'transfer.confirm.preAuthAction'), onPress: openAuthSheet },
    ]);
  };

  const closeAuthSheet = () => {
    if (!canClosePaymentAuth(authState)) return;
    setAuthState(closePaymentAuthState());
  };

  const submitTransfer = async () => {
    if (submittingRef.current) {
      setAuthState((current) => markPaymentAuthDuplicate(current));
      return;
    }

    submittingRef.current = true;
    setAuthState((current) => markPaymentAuthLoading(current));

    const result = await runPaymentRequest({
      amount: receiptPreview.amount,
      availableBalance,
      operation: async () => {
        await waitForPaymentRequest();
        return receiptPreview;
      },
    });

    submittingRef.current = false;

    if (!result.ok) {
      setAuthState((current) => markPaymentAuthFailed(current, result.reason));
      return;
    }

    setAuthState(closePaymentAuthState());
    onComplete(result.data);
  };

  return (
    <>
      <ScreenScroll id="screen-transfer-confirm" colors={colors} contentStyle={styles.screenContent}>
        <AppHeader colors={colors} title={paymentT(t, 'transfer.confirm.title')} onBack={onBack} />
        <RecipientSummary colors={colors} recipient={recipient} />
        <Card colors={colors} style={[paymentSurfaces.card, styles.confirmCard]}>
          <SummaryRow colors={colors} label={paymentT(t, 'common.amount')} value={`${formatAmount(receiptPreview.amount)} ${receiptPreview.currency}`} strong />
          <SummaryRow colors={colors} label={paymentT(t, 'common.fee')} value={`${formatAmount(receiptPreview.fee)} ${receiptPreview.currency}`} />
          <SummaryRow colors={colors} label={paymentT(t, 'common.source')} value={receiptPreview.sourceAccount} />
          <SummaryRow colors={colors} label={paymentT(t, 'common.note')} value={receiptPreview.note} />
        </Card>
        <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={21} strokeWidth={2} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {paymentT(t, 'transfer.confirm.notice')}
          </Text>
        </View>
        <PrimaryButton colors={colors} title={paymentT(t, 'transfer.confirm.submit')} onPress={requestAuthSheet} />
      </ScreenScroll>
      <PaymentAuthSheet
        amount={receiptPreview.amount}
        colors={colors}
        onAuthenticated={() => void submitTransfer()}
        onClose={closeAuthSheet}
        recipientName={recipient.name}
        requestState={authState.request}
        visible={isPaymentAuthOpen(authState)}
      />
    </>
  );
}

export function TransferResultScreen({
  amount,
  colors,
  note,
  onBackHome,
  onOpenReceipt,
  recipientId,
}: {
  amount?: string | string[];
  colors: AppColors;
  note?: string | string[];
  onBackHome: () => void;
  onOpenReceipt: (receipt: TransferReceipt) => void;
  recipientId?: string | string[];
}) {
  const { t } = useI18n();
  const receipt = createTransferReceiptFromRoute({ amount, note, recipientId });

  return (
    <ScreenScroll id="screen-transfer-result" colors={colors} contentStyle={styles.resultContent}>
      <View style={[styles.resultIcon, { backgroundColor: colors.success }]}>
        <Check color={palette.white} size={42} strokeWidth={3} />
      </View>
      <Text style={[styles.resultTitle, { color: colors.text }]}>{paymentT(t, 'transfer.result.title')}</Text>
      <Text style={[styles.resultAmount, { color: colors.text }]}>
        {formatAmount(receipt.amount)} {receipt.currency}
      </Text>
      <Text style={[styles.resultDescription, { color: colors.textSecondary }]}>
        {paymentT(t, 'transfer.result.description', { recipient: receipt.recipient.name })}
      </Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.confirmCard]}>
        <SummaryRow colors={colors} label={paymentT(t, 'common.transactionId')} value={receipt.id} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.recipient')} value={receipt.recipient.name} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.time')} value={receipt.time} />
      </Card>
      <PrimaryButton colors={colors} title={paymentT(t, 'transfer.result.viewReceipt')} onPress={() => onOpenReceipt(receipt)} />
      <PrimaryButton colors={colors} title={paymentT(t, 'common.backHome')} onPress={onBackHome} secondary />
    </ScreenScroll>
  );
}

export function TransactionReceiptScreen({
  amount,
  colors,
  note,
  onBack,
  recipientId,
}: {
  amount?: string | string[];
  colors: AppColors;
  note?: string | string[];
  onBack: () => void;
  recipientId?: string | string[];
}) {
  const { t } = useI18n();
  const receipt = createTransferReceiptFromRoute({ amount, note, recipientId });

  return (
    <ScreenScroll id="screen-transfer-receipt" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={paymentT(t, 'transfer.receipt.title')} onBack={onBack} />
      <View style={[styles.receiptHero, paymentSurfaces.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.receiptIcon, { backgroundColor: colors.surfaceMuted }]}>
          <ReceiptText color={colors.primaryDark} size={34} strokeWidth={2} />
        </View>
        <Text style={[styles.receiptTitle, { color: colors.text }]}>Identra Pay</Text>
        <Text style={[styles.receiptAmount, { color: colors.text }]}>
          {formatAmount(receipt.amount)} {receipt.currency}
        </Text>
        <View style={[styles.successPill, { backgroundColor: `${colors.success}18` }]}>
          <BadgeCheck color={colors.success} size={16} strokeWidth={2.2} />
          <Text style={[styles.successPillText, { color: colors.success }]}>{paymentT(t, 'status.success')}</Text>
        </View>
      </View>
      <Card colors={colors} style={[paymentSurfaces.card, styles.confirmCard]}>
        <SummaryRow colors={colors} label={paymentT(t, 'common.transactionId')} value={receipt.id} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.recipient')} value={receipt.recipient.name} />
        <SummaryRow colors={colors} label={paymentT(t, 'transfer.receipt.recipientAccount')} value={receipt.recipient.account} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.source')} value={receipt.sourceAccount} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.note')} value={receipt.note} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.time')} value={receipt.time} />
      </Card>
      <View style={styles.receiptActions}>
        <PrimaryButton colors={colors} title={t('common.share')} onPress={() => Alert.alert(paymentT(t, 'transfer.receipt.shareAlertTitle'), paymentT(t, 'transfer.receipt.shareAlertDescription'))} />
        <PrimaryButton colors={colors} title={paymentT(t, 'common.copyTransactionId')} onPress={() => Alert.alert(paymentT(t, 'common.copied'), receipt.id)} secondary />
      </View>
    </ScreenScroll>
  );
}

function PaymentAuthSheet({
  amount,
  colors,
  onAuthenticated,
  onClose,
  recipientName,
  requestState,
  visible,
}: {
  amount: number;
  colors: AppColors;
  onAuthenticated: () => void;
  onClose: () => void;
  recipientName: string;
  requestState: PaymentRequestState;
  visible: boolean;
}) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const pinInputRef = useRef<TextInput>(null);
  const canSubmit = pin.length >= 6;
  const requestLoading = isPaymentRequestLoading(requestState);

  useEffect(() => {
    if (visible) setPin('');
  }, [visible]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={[styles.authLayer, { backgroundColor: colors.overlay }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={paymentT(t, 'auth.close')} disabled={requestLoading} onPress={onClose} style={styles.authBackdrop} />
        <View style={[styles.authSheet, paymentSurfaces.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.authHandle} />
          <View style={styles.authHeader}>
            <View style={[styles.authIcon, { backgroundColor: colors.surfaceMuted }]}>
              <ShieldCheck color={colors.primaryDark} size={28} strokeWidth={2.1} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} disabled={requestLoading} onPress={onClose} hitSlop={8} style={[styles.authClose, requestLoading && styles.disabledControl]}>
              <X color={colors.textSecondary} size={24} strokeWidth={2} />
            </Pressable>
          </View>
          <Text style={[styles.authTitle, { color: colors.text }]}>{paymentT(t, 'auth.title')}</Text>
          <Text style={[styles.authDescription, { color: colors.textSecondary }]}>
            {paymentT(t, 'transfer.auth.description', { amount: formatAmount(amount), recipient: recipientName })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'auth.pinBoxes')}
            onPress={() => pinInputRef.current?.focus()}
            style={styles.pinBoxes}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={[styles.pinBox, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.pinDot, { color: colors.text }]}>{pin[index] ? '•' : ''}</Text>
              </View>
            ))}
          </Pressable>
          <TextInput
            ref={pinInputRef}
            accessibilityLabel={paymentT(t, 'auth.pinInput')}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 6))}
            style={styles.hiddenPinInput}
            value={pin}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'auth.biometric')}
            disabled={requestLoading}
            onPress={() => setPin('123456')}
            style={({ pressed }) => [styles.biometricButton, { borderColor: colors.border, opacity: requestLoading ? 0.44 : pressed ? 0.72 : 1 }]}
          >
            <Fingerprint color={colors.primaryDark} size={22} strokeWidth={2} />
            <Text style={[styles.biometricText, { color: colors.primaryDark }]}>{paymentT(t, 'auth.biometric')}</Text>
          </Pressable>
          <PaymentRequestFeedback colors={colors} state={requestState} onRetry={canSubmit ? onAuthenticated : undefined} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'transfer.auth.confirm')}
            disabled={!canSubmit || requestLoading}
            onPress={onAuthenticated}
            style={({ pressed }) => [
              styles.authSubmit,
              { backgroundColor: colors.primaryDark, opacity: !canSubmit || requestLoading ? 0.42 : pressed ? 0.78 : 1 },
            ]}
          >
            {requestLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.authSubmitText}>{paymentT(t, 'transfer.auth.confirm')}</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function TransferRecipientRow({
  colors,
  divider,
  onPress,
  recipient,
  selectLabel,
}: {
  colors: AppColors;
  divider?: boolean;
  onPress: () => void;
  recipient: TransferRecipient;
  selectLabel: string;
}) {
  const Icon = recipient.icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={selectLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.recipientRow,
        divider && { borderTopColor: colors.border, borderTopWidth: border.hairline },
        { opacity: pressed ? 0.68 : 1 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: recipient.background }]}>
        <Icon color={recipient.color} size={22} strokeWidth={2} />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.recipientTitleRow}>
          <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.text }]}>{recipient.name}</Text>
          {recipient.verified ? <BadgeCheck color={colors.primaryDark} size={16} strokeWidth={2.2} /> : null}
        </View>
        <Text numberOfLines={1} style={[styles.rowDescription, { color: colors.textSecondary }]}>{recipient.bank} · {recipient.account}</Text>
        <Text numberOfLines={1} style={[styles.rowMeta, { color: colors.textSecondary }]}>{recipient.recent}</Text>
      </View>
      <ListChevron colors={colors} />
    </Pressable>
  );
}

function RecipientSummary({ colors, recipient }: { colors: AppColors; recipient: TransferRecipient }) {
  const Icon = recipient.icon;

  return (
    <Card colors={colors} style={[paymentSurfaces.card, styles.recipientSummary]}>
      <View style={[styles.avatarLarge, { backgroundColor: recipient.background }]}>
        <Icon color={recipient.color} size={28} strokeWidth={2} />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.recipientTitleRow}>
          <Text style={[styles.summaryName, { color: colors.text }]}>{recipient.name}</Text>
          {recipient.verified ? <BadgeCheck color={colors.primaryDark} size={17} strokeWidth={2.2} /> : null}
        </View>
        <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{recipient.bank}</Text>
        <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{recipient.account}</Text>
      </View>
    </Card>
  );
}

function SummaryRow({
  colors,
  label,
  strong = false,
  value,
}: {
  colors: AppColors;
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={2} style={[strong ? styles.summaryValueStrong : styles.summaryValue, { color: colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

function createTransferReceiptFromRoute({
  amount,
  note,
  recipientId,
}: {
  amount?: string | string[];
  note?: string | string[];
  recipientId?: string | string[];
}) {
  const recipient = getTransferRecipientById(recipientId);
  const source = paymentCards[0];

  return createTransferReceipt({
    amount: parsePaymentRouteAmount(amount),
    note,
    recipient,
    sourceAccount: source.accountNumber,
    sourceName: source.balanceLabel,
  });
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.xxl, gap: spacing.lg },
  searchBox: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  listCard: { paddingHorizontal: spacing.md, paddingVertical: 0 },
  recipientRow: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  recipientSummary: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, minWidth: 0 },
  recipientTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowTitle: {
    flexShrink: 1,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  summaryName: {
    flexShrink: 1,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.extraBold,
  },
  rowDescription: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  rowMeta: {
    marginTop: spacing.xs,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: typography.weight.semibold,
  },
  iconBox: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sourceBalance: {
    maxWidth: 112,
    textAlign: 'right',
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.semibold,
  },
  fieldLabel: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  amountBox: {
    minHeight: 68,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  amountCurrency: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAmount: {
    minHeight: 38,
    borderRadius: radius.round,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  noteInput: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  confirmCard: { paddingVertical: spacing.xs },
  summaryRow: {
    minHeight: 56,
    borderBottomWidth: border.hairline,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryLabel: {
    flex: 0.8,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  summaryValue: {
    flex: 1.2,
    textAlign: 'right',
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  summaryValueStrong: {
    flex: 1.2,
    textAlign: 'right',
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  notice: {
    minHeight: 66,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  resultContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  resultIcon: {
    marginTop: spacing.xl,
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  resultAmount: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.extraBold,
  },
  resultDescription: {
    textAlign: 'center',
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },
  receiptHero: {
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  receiptIcon: {
    width: 66,
    height: 66,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptTitle: {
    marginTop: spacing.md,
    fontSize: typography.size.md,
    fontWeight: typography.weight.extraBold,
  },
  receiptAmount: {
    marginTop: spacing.sm,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.extraBold,
  },
  successPill: {
    minHeight: 30,
    marginTop: spacing.md,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  successPillText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  receiptActions: { gap: spacing.sm },
  authLayer: { flex: 1, justifyContent: 'flex-end' },
  authBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  authSheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  authHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: radius.round,
    backgroundColor: palette.gray[200],
  },
  authHeader: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authClose: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledControl: { opacity: 0.44 },
  authTitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  authDescription: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },
  pinBoxes: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  pinBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extraBold,
  },
  hiddenPinInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  biometricButton: {
    minHeight: 48,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  biometricText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  authSubmit: {
    minHeight: 50,
    marginTop: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSubmitText: {
    color: palette.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
