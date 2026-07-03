import {
  BadgeCheck,
  Check,
  ChevronRight,
  CreditCard,
  Fingerprint,
  Info,
  Phone,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader, Card, PrimaryButton, ScreenScroll } from '../../components/AppUiPrimitives';
import { paymentCards } from '../../data/demo/paymentHomeDemoData';
import {
  billCategories,
  getBillCategoryById,
  getCarrierById,
  mobileCarriers,
  topupAmounts,
  topupContacts,
  type BillCategory,
  type TopupAmount,
  type TopupContact,
} from '../../data/demo/paymentServiceDemoData';
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
  createBillPreview,
  createServiceReceipt,
  lookupBillPreview,
  validateBillPaymentDraft,
  validatePhoneTopUpDraft,
  type PaymentBillPreview,
  type PaymentServiceReceipt,
} from '../../domain/payment/paymentServices';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../theme';
import { formatAmount } from '../chat/paymentUtils';
import { PaymentRequestFeedback } from './components/PaymentRequestFeedback';
import { paymentSurfaces } from './components/paymentSurfaces';
import { paymentCardText, paymentT } from './paymentI18n';

export function PhoneTopUpScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const { t } = useI18n();
  const source = paymentCards[0];
  const [phoneNumber, setPhoneNumber] = useState(topupContacts[0].phone);
  const [carrierId, setCarrierId] = useState(topupContacts[0].carrierId);
  const [amountId, setAmountId] = useState(topupAmounts[1].id);
  const [authState, setAuthState] = useState(createClosedPaymentAuthState);
  const [receipt, setReceipt] = useState<PaymentServiceReceipt | null>(null);
  const submittingRef = useRef(false);
  const selectedCarrier = getCarrierById(carrierId);
  const selectedAmount = topupAmounts.find((amount) => amount.id === amountId) ?? topupAmounts[0];
  const availableBalance = parsePaymentBalance(source.balance);

  const submit = () => {
    const validation = validatePhoneTopUpDraft({ phoneNumber });

    if (!validation.ok) {
      Alert.alert(paymentT(t, 'service.phone.missingPhoneTitle'), paymentT(t, 'service.phone.missingPhoneDescription'));
      return;
    }

    setAuthState(openPaymentAuthState());
  };

  const closeAuthSheet = () => {
    if (!canClosePaymentAuth(authState)) return;
    setAuthState(closePaymentAuthState());
  };

  const confirmTopup = async () => {
    if (submittingRef.current) {
      setAuthState((current) => markPaymentAuthDuplicate(current));
      return;
    }

    submittingRef.current = true;
    setAuthState((current) => markPaymentAuthLoading(current));

    const receiptDraft = createServiceReceipt({
      title: paymentT(t, 'service.phone.successTitle'),
      amount: selectedAmount.value,
      fee: 0,
      target: phoneNumber,
      description: `${selectedCarrier.name} - ${selectedAmount.bonus}`,
      source: source.accountNumber,
    });

    const result = await runPaymentRequest({
      amount: selectedAmount.value,
      availableBalance,
      operation: async () => {
        await waitForPaymentRequest();
        return receiptDraft;
      },
    });

    submittingRef.current = false;

    if (!result.ok) {
      setAuthState((current) => markPaymentAuthFailed(current, result.reason));
      return;
    }

    setAuthState(closePaymentAuthState());
    setReceipt(result.data);
  };

  if (receipt) {
    return (
      <PaymentServiceResultScreen
        colors={colors}
        onBackHome={onBack}
        onPrimary={() => setReceipt(null)}
        primaryTitle={paymentT(t, 'service.phone.topupAgain')}
        receipt={receipt}
      />
    );
  }

  return (
    <>
      <ScreenScroll id="screen-payment-phone-topup" colors={colors} contentStyle={styles.screenContent}>
        <AppHeader colors={colors} title={paymentT(t, 'service.phone.title')} onBack={onBack} />

        <View style={[styles.heroCard, paymentSurfaces.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: selectedCarrier.background }]}>
            <Smartphone color={selectedCarrier.color} size={32} strokeWidth={2} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{paymentT(t, 'service.phone.heroTitle')}</Text>
            <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
              {paymentT(t, 'service.phone.heroDescription')}
            </Text>
          </View>
          <View style={[styles.promoPill, { backgroundColor: selectedCarrier.background }]}>
            <Text style={[styles.promoPillText, { color: selectedCarrier.color }]}>{selectedCarrier.bonus}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'service.phone.phoneSection')}</Text>
        <Card colors={colors} style={[paymentSurfaces.card, styles.inputCard]}>
          <View style={[styles.inputRow, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Phone color={colors.primaryDark} size={21} strokeWidth={2} />
            <TextInput
              accessibilityLabel={paymentT(t, 'service.phone.inputAccessibility')}
              keyboardType="phone-pad"
              onChangeText={setPhoneNumber}
              placeholder={paymentT(t, 'service.phone.inputPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              style={[styles.inputText, { color: colors.text }]}
              value={phoneNumber}
            />
          </View>
          <View style={styles.contactRow}>
            {topupContacts.map((contact) => (
              <TopupContactChip
                key={contact.id}
                colors={colors}
                contact={contact}
                selected={contact.phone === phoneNumber}
                onPress={() => {
                  setPhoneNumber(contact.phone);
                  setCarrierId(contact.carrierId);
                }}
              />
            ))}
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'service.phone.carrierSection')}</Text>
        <View style={styles.carrierGrid}>
          {mobileCarriers.map((carrier) => (
            <Pressable
              key={carrier.id}
              accessibilityRole="button"
              accessibilityState={{ selected: carrier.id === carrierId }}
              onPress={() => setCarrierId(carrier.id)}
              style={({ pressed }) => [
                styles.carrierCard,
                paymentSurfaces.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: carrier.id === carrierId ? carrier.color : colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <View style={[styles.carrierBadge, { backgroundColor: carrier.background }]}>
                <Text style={[styles.carrierShortName, { color: carrier.color }]}>{carrier.shortName}</Text>
              </View>
              <Text style={[styles.carrierName, { color: colors.text }]}>{carrier.name}</Text>
              <Text style={[styles.carrierBonus, { color: carrier.color }]}>{carrier.bonus}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'service.phone.amountSection')}</Text>
        <View style={styles.amountGrid}>
          {topupAmounts.map((amount) => (
            <TopupAmountTile
              key={amount.id}
              amount={amount}
              colors={colors}
              selected={amount.id === amountId}
              onPress={() => setAmountId(amount.id)}
            />
          ))}
        </View>

        <PaymentSourceCard colors={colors} />

        <Card colors={colors} style={[paymentSurfaces.card, styles.summaryCard]}>
          <SummaryRow colors={colors} label={paymentT(t, 'service.phone.phoneSection')} value={phoneNumber || paymentT(t, 'common.notEntered')} />
          <SummaryRow colors={colors} label={paymentT(t, 'service.phone.carrierSection')} value={selectedCarrier.name} />
          <SummaryRow colors={colors} label={paymentT(t, 'service.phone.amountSection')} value={`${formatAmount(selectedAmount.value)} VND`} strong />
          <SummaryRow colors={colors} label={paymentT(t, 'service.common.promotion')} value={selectedAmount.bonus} />
          <SummaryRow colors={colors} label={paymentT(t, 'common.source')} value={source.accountNumber} last />
        </Card>

        <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
          <Info color={colors.primaryDark} size={21} strokeWidth={2} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {paymentT(t, 'service.phone.notice')}
          </Text>
        </View>

        <PrimaryButton colors={colors} title={paymentT(t, 'service.phone.confirm')} onPress={submit} />
      </ScreenScroll>

      <PaymentServiceAuthSheet
        amount={selectedAmount.value}
        colors={colors}
        description={paymentT(t, 'service.phone.authDescription', { amount: formatAmount(selectedAmount.value), phone: phoneNumber })}
        onClose={closeAuthSheet}
        onConfirm={() => void confirmTopup()}
        requestState={authState.request}
        title={paymentT(t, 'service.phone.authTitle')}
        visible={isPaymentAuthOpen(authState)}
      />
    </>
  );
}

export function BillPaymentScreen({
  colors,
  initialCategoryId,
  onBack,
}: {
  colors: AppColors;
  initialCategoryId?: string | string[];
  onBack: () => void;
}) {
  const { t } = useI18n();
  const source = paymentCards[0];
  const initialCategory = getBillCategoryById(initialCategoryId);
  const [categoryId, setCategoryId] = useState(initialCategory.id);
  const [providerIndex, setProviderIndex] = useState(0);
  const [customerCode, setCustomerCode] = useState(initialCategory.savedCode);
  const [bill, setBill] = useState<PaymentBillPreview | null>(createBillPreview(initialCategory, 0, initialCategory.savedCode));
  const [authState, setAuthState] = useState(createClosedPaymentAuthState);
  const [receipt, setReceipt] = useState<PaymentServiceReceipt | null>(null);
  const submittingRef = useRef(false);
  const selectedCategory = getBillCategoryById(categoryId);
  const totalAmount = bill ? bill.amount + bill.fee : 0;
  const availableBalance = parsePaymentBalance(source.balance);

  useEffect(() => {
    const category = getBillCategoryById(initialCategoryId);
    setCategoryId(category.id);
    setProviderIndex(0);
    setCustomerCode(category.savedCode);
    setBill(createBillPreview(category, 0, category.savedCode));
  }, [initialCategoryId]);

  const selectCategory = (category: BillCategory) => {
    setCategoryId(category.id);
    setProviderIndex(0);
    setCustomerCode(category.savedCode);
    setBill(createBillPreview(category, 0, category.savedCode));
  };

  const lookupBill = () => {
    const result = lookupBillPreview({ category: selectedCategory, customerCode, providerIndex });

    if (!result.ok) {
      Alert.alert(paymentT(t, 'service.bill.missingCodeTitle'), paymentT(t, 'service.bill.missingCodeDescription'));
      return;
    }

    setBill(result.bill);
  };

  const payBill = () => {
    const validation = validateBillPaymentDraft({ bill });

    if (!validation.ok) {
      Alert.alert(paymentT(t, 'service.bill.noBillTitle'), paymentT(t, 'service.bill.noBillDescription'));
      return;
    }

    setAuthState(openPaymentAuthState());
  };

  const closeAuthSheet = () => {
    if (!canClosePaymentAuth(authState)) return;
    setAuthState(closePaymentAuthState());
  };

  const confirmBillPayment = async () => {
    if (!bill) return;

    if (submittingRef.current) {
      setAuthState((current) => markPaymentAuthDuplicate(current));
      return;
    }

    submittingRef.current = true;
    setAuthState((current) => markPaymentAuthLoading(current));

    const receiptDraft = createServiceReceipt({
      title: paymentT(t, 'service.bill.successTitle'),
      amount: bill.amount,
      fee: bill.fee,
      target: bill.provider,
      description: `${bill.label} · ${bill.period}`,
      source: source.accountNumber,
    });

    const result = await runPaymentRequest({
      amount: totalAmount,
      availableBalance,
      operation: async () => {
        await waitForPaymentRequest();
        return receiptDraft;
      },
    });

    submittingRef.current = false;

    if (!result.ok) {
      setAuthState((current) => markPaymentAuthFailed(current, result.reason));
      return;
    }

    setAuthState(closePaymentAuthState());
    setReceipt(result.data);
  };

  if (receipt) {
    return (
      <PaymentServiceResultScreen
        colors={colors}
        onBackHome={onBack}
        onPrimary={() => setReceipt(null)}
        primaryTitle={paymentT(t, 'service.bill.payAnother')}
        receipt={receipt}
      />
    );
  }

  return (
    <>
      <ScreenScroll id="screen-payment-bill" colors={colors} contentStyle={styles.screenContent}>
        <AppHeader colors={colors} title={paymentT(t, 'service.bill.title')} onBack={onBack} />

        <View style={[styles.billHero, paymentSurfaces.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: selectedCategory.background }]}>
            <selectedCategory.icon color={selectedCategory.color} size={32} strokeWidth={2} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{paymentT(t, 'service.bill.heroTitle')}</Text>
            <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
              {paymentT(t, 'service.bill.heroDescription')}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'service.bill.serviceSection')}</Text>
        <View style={styles.billCategoryGrid}>
          {billCategories.map((category) => (
            <BillCategoryTile
              key={category.id}
              category={category}
              colors={colors}
              selected={category.id === categoryId}
              onPress={() => selectCategory(category)}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'service.bill.providerSection')}</Text>
        <View style={styles.providerRow}>
          {selectedCategory.providers.map((provider, index) => (
            <Pressable
              key={provider}
              accessibilityRole="button"
              accessibilityState={{ selected: index === providerIndex }}
              onPress={() => {
                setProviderIndex(index);
                setBill(null);
              }}
              style={({ pressed }) => [
                styles.providerChip,
                {
                  backgroundColor: index === providerIndex ? selectedCategory.background : colors.surface,
                  borderColor: index === providerIndex ? selectedCategory.color : colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Text style={[styles.providerText, { color: index === providerIndex ? selectedCategory.color : colors.text }]}>
                {provider}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'common.customerCode')}</Text>
        <Card colors={colors} style={[paymentSurfaces.card, styles.inputCard]}>
          <View style={[styles.inputRow, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <ReceiptText color={colors.primaryDark} size={21} strokeWidth={2} />
            <TextInput
              accessibilityLabel={paymentT(t, 'common.customerCode')}
              autoCapitalize="characters"
              onChangeText={(value) => {
                setCustomerCode(value);
                setBill(null);
              }}
              placeholder={selectedCategory.customerCodePlaceholder}
              placeholderTextColor={colors.textSecondary}
              style={[styles.inputText, { color: colors.text }]}
              value={customerCode}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'service.bill.useSavedCode')}
            onPress={() => {
              setCustomerCode(selectedCategory.savedCode);
              setBill(createBillPreview(selectedCategory, providerIndex, selectedCategory.savedCode));
            }}
            style={({ pressed }) => [
              styles.savedCodeButton,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <BadgeCheck color={colors.primaryDark} size={18} strokeWidth={2.2} />
            <Text style={[styles.savedCodeText, { color: colors.text }]}>{paymentT(t, 'service.bill.savedCode', { code: selectedCategory.savedCode })}</Text>
            <ChevronRight color={colors.textSecondary} size={18} strokeWidth={2} />
          </Pressable>
        </Card>

        <PrimaryButton colors={colors} title={paymentT(t, 'service.bill.lookup')} onPress={lookupBill} secondary />

        {bill ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'service.bill.billToPay')}</Text>
            <Card colors={colors} style={[paymentSurfaces.card, styles.billCard]}>
              <View style={styles.billTopRow}>
                <View style={[styles.iconBox, { backgroundColor: selectedCategory.background }]}>
                  <selectedCategory.icon color={selectedCategory.color} size={22} strokeWidth={2} />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{bill.provider}</Text>
                  <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{paymentT(t, 'service.bill.periodDue', { period: bill.period, dueDate: bill.dueDate })}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.statusPillText, { color: colors.success }]}>{paymentT(t, 'service.bill.unpaid')}</Text>
                </View>
              </View>
              <SummaryRow colors={colors} label={paymentT(t, 'service.bill.customer')} value={bill.customerName} />
              <SummaryRow colors={colors} label={paymentT(t, 'common.customerCode')} value={bill.customerCode} />
              <SummaryRow colors={colors} label={paymentT(t, 'service.bill.addressPackage')} value={bill.address} />
              <SummaryRow colors={colors} label={paymentT(t, 'service.bill.billAmount')} value={`${formatAmount(bill.amount)} VND`} />
              <SummaryRow colors={colors} label={paymentT(t, 'common.fee')} value={`${formatAmount(bill.fee)} VND`} />
              <SummaryRow colors={colors} label={paymentT(t, 'common.total')} value={`${formatAmount(totalAmount)} VND`} strong last />
            </Card>
            <PaymentSourceCard colors={colors} />
            <PrimaryButton colors={colors} title={paymentT(t, 'service.bill.pay')} onPress={payBill} />
          </>
        ) : (
          <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
            <Info color={colors.primaryDark} size={21} strokeWidth={2} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              {paymentT(t, 'service.bill.lookupHint')}
            </Text>
          </View>
        )}
      </ScreenScroll>

      <PaymentServiceAuthSheet
        amount={totalAmount}
        colors={colors}
        description={bill ? paymentT(t, 'service.bill.authDescription', { amount: formatAmount(totalAmount), provider: bill.provider }) : ''}
        onClose={closeAuthSheet}
        onConfirm={() => void confirmBillPayment()}
        requestState={authState.request}
        title={paymentT(t, 'service.bill.authTitle')}
        visible={isPaymentAuthOpen(authState)}
      />
    </>
  );
}

function TopupContactChip({
  colors,
  contact,
  onPress,
  selected,
}: {
  colors: AppColors;
  contact: TopupContact;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactChip,
        {
          backgroundColor: selected ? colors.surfaceMuted : colors.surface,
          borderColor: selected ? colors.primaryDark : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.contactAvatar, { backgroundColor: colors.surfaceMuted }]}>
        <Text style={[styles.contactAvatarText, { color: colors.primaryDark }]}>{contact.name.slice(0, 1)}</Text>
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
        <Text numberOfLines={1} style={[styles.contactPhone, { color: colors.textSecondary }]}>{contact.phone}</Text>
      </View>
    </Pressable>
  );
}

function TopupAmountTile({
  amount,
  colors,
  onPress,
  selected,
}: {
  amount: TopupAmount;
  colors: AppColors;
  onPress: () => void;
  selected: boolean;
}) {
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.amountTile,
        paymentSurfaces.card,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.primaryDark : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      {amount.popular ? (
        <View style={[styles.popularPill, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.popularText}>{paymentT(t, 'service.phone.popular')}</Text>
        </View>
      ) : null}
      <Text style={[styles.amountValue, { color: colors.text }]}>{formatAmount(amount.value)}</Text>
      <Text style={[styles.amountCurrencySmall, { color: colors.textSecondary }]}>VND</Text>
      <Text style={[styles.amountBonus, { color: colors.success }]}>{amount.bonus}</Text>
    </Pressable>
  );
}

function BillCategoryTile({
  category,
  colors,
  onPress,
  selected,
}: {
  category: BillCategory;
  colors: AppColors;
  onPress: () => void;
  selected: boolean;
}) {
  const { t } = useI18n();
  const Icon = category.icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.billCategoryTile,
        paymentSurfaces.card,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? category.color : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.background }]}>
        <Icon color={category.color} size={22} strokeWidth={2} />
      </View>
      <Text numberOfLines={1} style={[styles.categoryLabel, { color: colors.text }]}>{paymentT(t, `service.bill.categories.${category.id}`)}</Text>
    </Pressable>
  );
}

function PaymentSourceCard({ colors }: { colors: AppColors }) {
  const { t } = useI18n();
  const source = paymentCards[0];

  return (
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
  );
}

function PaymentServiceAuthSheet({
  amount,
  colors,
  description,
  onClose,
  onConfirm,
  requestState,
  title,
  visible,
}: {
  amount: number;
  colors: AppColors;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  requestState: PaymentRequestState;
  title: string;
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
          <Text style={[styles.authTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.authDescription, { color: colors.textSecondary }]}>{description}</Text>
          <View style={[styles.authAmountBox, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.authAmountLabel, { color: colors.textSecondary }]}>{paymentT(t, 'common.total')}</Text>
            <Text style={[styles.authAmountValue, { color: colors.text }]}>{formatAmount(amount)} VND</Text>
          </View>
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
          <PaymentRequestFeedback colors={colors} state={requestState} onRetry={canSubmit ? onConfirm : undefined} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'service.common.confirmPayment')}
            disabled={!canSubmit || requestLoading}
            onPress={onConfirm}
            style={({ pressed }) => [
              styles.authSubmit,
              { backgroundColor: colors.primaryDark, opacity: !canSubmit || requestLoading ? 0.42 : pressed ? 0.78 : 1 },
            ]}
          >
            {requestLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.authSubmitText}>{paymentT(t, 'service.common.confirmPayment')}</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PaymentServiceResultScreen({
  colors,
  onBackHome,
  onPrimary,
  primaryTitle,
  receipt,
}: {
  colors: AppColors;
  onBackHome: () => void;
  onPrimary: () => void;
  primaryTitle: string;
  receipt: PaymentServiceReceipt;
}) {
  const { t } = useI18n();

  return (
    <ScreenScroll id="screen-payment-service-result" colors={colors} contentStyle={styles.resultContent}>
      <View style={[styles.resultIcon, { backgroundColor: colors.success }]}>
        <Check color={palette.white} size={42} strokeWidth={3} />
      </View>
      <Text style={[styles.resultTitle, { color: colors.text }]}>{receipt.title}</Text>
      <Text style={[styles.resultAmount, { color: colors.text }]}>{formatAmount(receipt.total)} VND</Text>
      <Text style={[styles.resultDescription, { color: colors.textSecondary }]}>
        {paymentT(t, 'service.result.description')}
      </Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.summaryCard]}>
        <SummaryRow colors={colors} label={paymentT(t, 'common.transactionId')} value={receipt.id} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.service')} value={receipt.target} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.description')} value={receipt.description} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.amount')} value={`${formatAmount(receipt.amount)} VND`} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.fee')} value={`${formatAmount(receipt.fee)} VND`} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.source')} value={receipt.source} />
        <SummaryRow colors={colors} label={paymentT(t, 'common.time')} value={receipt.time} last />
      </Card>
      <PrimaryButton colors={colors} title={primaryTitle} onPress={onPrimary} />
      <PrimaryButton colors={colors} title={paymentT(t, 'common.backHome')} onPress={onBackHome} secondary />
    </ScreenScroll>
  );
}

function SummaryRow({
  colors,
  label,
  last = false,
  strong = false,
  value,
}: {
  colors: AppColors;
  label: string;
  last?: boolean;
  strong?: boolean;
  value: string;
}) {
  return (
    <View style={[styles.summaryRow, !last && { borderBottomColor: colors.border, borderBottomWidth: border.hairline }]}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={2} style={[strong ? styles.summaryValueStrong : styles.summaryValue, { color: colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.xxl, gap: spacing.lg },
  heroCard: {
    minHeight: 132,
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  billHero: {
    minHeight: 124,
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, minWidth: 0 },
  heroTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  heroDescription: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  promoPill: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoPillText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  inputCard: { gap: spacing.md },
  inputRow: {
    minHeight: 54,
    borderWidth: border.hairline,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputText: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  contactChip: {
    width: '48.4%',
    minHeight: 64,
    borderWidth: border.hairline,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.extraBold,
  },
  contactName: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  contactPhone: {
    marginTop: spacing.xxs,
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },
  carrierGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  carrierCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrierBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrierShortName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  carrierName: {
    marginTop: spacing.sm,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  carrierBonus: {
    marginTop: spacing.xxs,
    fontSize: 11,
    fontWeight: typography.weight.medium,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amountTile: {
    width: '48.7%',
    minHeight: 108,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    padding: spacing.md,
    justifyContent: 'center',
  },
  popularPill: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    minHeight: 22,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: typography.weight.semibold,
  },
  amountValue: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  amountCurrencySmall: {
    marginTop: spacing.xxs,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  amountBonus: {
    marginTop: spacing.sm,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  sourceCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  rowDescription: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.medium,
  },
  sourceBalance: {
    maxWidth: 112,
    textAlign: 'right',
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.semibold,
  },
  summaryCard: {
    paddingVertical: spacing.xs,
  },
  summaryRow: {
    minHeight: 56,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryLabel: {
    flex: 0.78,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  summaryValue: {
    flex: 1.22,
    textAlign: 'right',
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  summaryValueStrong: {
    flex: 1.22,
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
  billCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  billCategoryTile: {
    width: '31.8%',
    minHeight: 92,
    borderWidth: border.hairline,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    marginTop: spacing.sm,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  providerChip: {
    minHeight: 40,
    borderWidth: border.hairline,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  savedCodeButton: {
    minHeight: 48,
    borderWidth: border.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savedCodeText: {
    flex: 1,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  billCard: {
    paddingVertical: spacing.xs,
  },
  billTopRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusPill: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },
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
    width: touchTarget.minimum,
    height: touchTarget.minimum,
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
  authAmountBox: {
    minHeight: 74,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: 'center',
  },
  authAmountLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  authAmountValue: {
    marginTop: spacing.xs,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
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
    textAlign: 'center',
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
});
