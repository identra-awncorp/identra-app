import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  ClipboardCopy,
  Download,
  Info,
  QrCode,
  Share2,
  ShieldCheck,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, Share, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, Card, PrimaryButton, ScreenScroll } from '../../components/AppUiPrimitives';
import { paymentCards } from '../../data/demo/paymentHomeDemoData';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../theme';
import { formatAmount, parseRawAmount } from '../chat/paymentUtils';
import { paymentSurfaces } from './components/paymentSurfaces';
import { paymentT } from './paymentI18n';

const receiveProfile = {
  idPayId: 'idpay:nguyen-hoang-nam',
  displayName: 'Nguyen Hoang Nam',
  provider: 'IDPay by Identra',
};

const quickAmounts = [100_000, 200_000, 500_000, 1_000_000];

export function ReceiveMoneyScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const account = paymentCards[0];
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [amountSheetOpen, setAmountSheetOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const qrSize = Math.min(236, Math.max(190, width - 138));
  const maskedCard = `**** ${account.cardNumber.slice(-4)}`;
  const qrValue = useMemo(
    () =>
      JSON.stringify({
        type: 'idpay-receive',
        version: 1,
        recipient: receiveProfile.idPayId,
        account: account.accountNumber,
        holder: account.holder,
        amount: amount || undefined,
        currency: account.currency,
        note: note.trim() || undefined,
      }),
    [account.accountNumber, account.currency, account.holder, amount, note],
  );
  const shareMessage = useMemo(
    () =>
      [
        `Identra Pay - ${receiveProfile.displayName}`,
        `IDPay: ${receiveProfile.idPayId}`,
        paymentT(t, 'receive.share.accountLine', { account: account.accountNumber }),
        amount ? paymentT(t, 'receive.share.amountLine', { amount: formatAmount(amount), currency: account.currency }) : null,
        note.trim() ? paymentT(t, 'receive.share.noteLine', { note: note.trim() }) : null,
      ]
        .filter(Boolean)
        .join('\n'),
    [account.accountNumber, account.currency, amount, note, t],
  );

  return (
    <>
      <ScreenScroll id="screen-payment-receive" colors={colors} contentStyle={styles.screenContent}>
        <AppHeader colors={colors} title={paymentT(t, 'receive.title')} onBack={onBack} />

        <LinearGradient
          colors={['#101F75', '#2558FF', '#08A4D8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.receiveHero, paymentSurfaces.hero, { borderColor: 'rgba(255, 255, 255, 0.14)' }]}
        >
          <View style={styles.heroAuraLarge} />
          <View style={styles.heroAuraSmall} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroIdentity}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>NH</Text>
              </View>
              <View style={styles.heroCopy}>
                <View style={styles.heroNameRow}>
                  <Text numberOfLines={1} style={styles.heroName}>{receiveProfile.displayName}</Text>
                  <BadgeCheck color={palette.white} size={17} strokeWidth={2.2} />
                </View>
                <Text numberOfLines={1} style={styles.heroProvider}>{receiveProfile.provider}</Text>
              </View>
            </View>
            <View style={styles.idpayBadge}>
              <ShieldCheck color={palette.white} size={17} strokeWidth={2.2} />
              <Text style={styles.idpayBadgeText}>IDPay</Text>
            </View>
          </View>

          <View style={styles.qrPanel}>
            <View style={styles.qrFrame}>
              <QRCode value={qrValue} size={qrSize} backgroundColor="#FFFFFF" color="#050505" ecl="H" />
              <View style={styles.qrLogo}>
                <ShieldCheck color={colors.primaryDark} size={30} strokeWidth={2.2} />
              </View>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <View style={styles.heroInfo}>
              <Text style={styles.heroMetaLabel}>{paymentT(t, 'receive.hero.receiveAccount')}</Text>
              <Text numberOfLines={1} style={styles.heroMetaValue}>{account.accountNumber}</Text>
              <Text style={styles.heroCardHint}>{maskedCard}</Text>
            </View>
            <View style={styles.heroAmount}>
              <Text style={styles.heroMetaLabel}>{paymentT(t, 'common.amount').toUpperCase()}</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={styles.heroAmountValue}>
                {amount ? formatAmount(amount) : paymentT(t, 'receive.flexibleAmount')}
              </Text>
              <Text style={styles.heroCardHint}>{amount ? account.currency : paymentT(t, 'receive.senderInput')}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'receive.setAmount')}
            onPress={() => setAmountSheetOpen(true)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <CircleDollarSign color={colors.primaryDark} size={22} strokeWidth={2} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>{paymentT(t, 'receive.enterAmount')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'receive.shareInfo')}
            onPress={() => setShareSheetOpen(true)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryActionButton,
              { backgroundColor: colors.primaryDark, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Share2 color={palette.white} size={21} strokeWidth={2} />
            <Text style={styles.primaryActionText}>{t('common.share')}</Text>
          </Pressable>
        </View>

        <Card colors={colors} style={[paymentSurfaces.card, styles.accountCard]}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
            <Wallet color={colors.primaryDark} size={23} strokeWidth={2} />
          </View>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{paymentT(t, 'receive.infoTitle')}</Text>
            <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>
              {paymentT(t, 'receive.infoDescription')}
            </Text>
          </View>
        </Card>

        <Card colors={colors} style={[paymentSurfaces.card, styles.summaryCard]}>
          <ReceiveSummaryRow colors={colors} label={paymentT(t, 'receive.summary.owner')} value={account.holder} />
          <ReceiveSummaryRow colors={colors} label="IDPay" value={receiveProfile.idPayId} />
          <ReceiveSummaryRow colors={colors} label={paymentT(t, 'common.accountNumber')} value={account.accountNumber} />
          <ReceiveSummaryRow colors={colors} label={paymentT(t, 'common.amount')} value={amount ? `${formatAmount(amount)} ${account.currency}` : paymentT(t, 'receive.flexibleAmount')} />
          <ReceiveSummaryRow colors={colors} label={paymentT(t, 'common.note')} value={note.trim() || paymentT(t, 'receive.senderInput')} last />
        </Card>

        <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
          <Info color={colors.primaryDark} size={21} strokeWidth={2} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {paymentT(t, 'receive.notice')}
          </Text>
        </View>

        <PrimaryButton colors={colors} title={paymentT(t, 'receive.shareInfo')} onPress={() => setShareSheetOpen(true)} />
      </ScreenScroll>

      <ReceiveAmountSheet
        amount={amount}
        colors={colors}
        note={note}
        onClear={() => {
          setAmount(0);
          setNote('');
          setAmountSheetOpen(false);
        }}
        onClose={() => setAmountSheetOpen(false)}
        onSave={(nextAmount, nextNote) => {
          setAmount(nextAmount);
          setNote(nextNote);
          setAmountSheetOpen(false);
        }}
        visible={amountSheetOpen}
      />
      <ShareReceiveInfoSheet
        accountNumber={account.accountNumber}
        colors={colors}
        idPayId={receiveProfile.idPayId}
        message={shareMessage}
        onClose={() => setShareSheetOpen(false)}
        qrValue={qrValue}
        visible={shareSheetOpen}
      />
    </>
  );
}

function ReceiveAmountSheet({
  amount,
  colors,
  note,
  onClear,
  onClose,
  onSave,
  visible,
}: {
  amount: number;
  colors: AppColors;
  note: string;
  onClear: () => void;
  onClose: () => void;
  onSave: (amount: number, note: string) => void;
  visible: boolean;
}) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [draftAmount, setDraftAmount] = useState(amount);
  const [draftNote, setDraftNote] = useState(note);

  useEffect(() => {
    if (visible) {
      setDraftAmount(amount);
      setDraftNote(note);
    }
  }, [amount, note, visible]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={[styles.sheetLayer, { backgroundColor: colors.overlay }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={paymentT(t, 'receive.amountSheet.close')} onPress={onClose} style={styles.sheetBackdrop} />
        <View
          style={[
            styles.sheet,
            paymentSurfaces.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: Math.max(spacing.xxl, insets.bottom + spacing.lg) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIcon, { backgroundColor: colors.surfaceMuted }]}>
              <CircleDollarSign color={colors.primaryDark} size={27} strokeWidth={2} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} hitSlop={8} style={styles.sheetClose}>
              <X color={colors.textSecondary} size={24} strokeWidth={2} />
            </Pressable>
          </View>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{paymentT(t, 'receive.amountSheet.title')}</Text>
          <Text style={[styles.sheetDescription, { color: colors.textSecondary }]}>
            {paymentT(t, 'receive.amountSheet.description')}
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{paymentT(t, 'common.amount')}</Text>
          <View style={[styles.amountInputBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <TextInput
              accessibilityLabel={paymentT(t, 'receive.amountSheet.amountAccessibility')}
              keyboardType="numeric"
              onChangeText={(value) => setDraftAmount(parseRawAmount(value))}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              style={[styles.amountInput, { color: colors.text }]}
              value={formatAmount(draftAmount)}
            />
            <Text style={[styles.amountCurrency, { color: colors.textSecondary }]}>VND</Text>
          </View>
          <View style={styles.quickAmountRow}>
            {quickAmounts.map((quickAmount) => (
              <Pressable
                key={quickAmount}
                accessibilityRole="button"
                accessibilityLabel={paymentT(t, 'receive.amountSheet.quickAmountAccessibility', { amount: formatAmount(quickAmount) })}
                onPress={() => setDraftAmount(quickAmount)}
                style={({ pressed }) => [
                  styles.quickAmount,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
                ]}
              >
                <Text style={[styles.quickAmountText, { color: colors.primaryDark }]}>{formatAmount(quickAmount)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{paymentT(t, 'common.note')}</Text>
          <TextInput
            accessibilityLabel={paymentT(t, 'receive.amountSheet.noteAccessibility')}
            maxLength={100}
            onChangeText={setDraftNote}
            placeholder={paymentT(t, 'receive.amountSheet.notePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.noteInput, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, color: colors.text }]}
            value={draftNote}
          />

          <View style={styles.sheetActions}>
            <PrimaryButton colors={colors} title={paymentT(t, 'receive.amountSheet.clear')} onPress={onClear} secondary style={styles.sheetActionButton} />
            <PrimaryButton colors={colors} title={t('common.apply')} onPress={() => onSave(draftAmount, draftNote.trim())} style={styles.sheetActionButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ShareReceiveInfoSheet({
  accountNumber,
  colors,
  idPayId,
  message,
  onClose,
  qrValue,
  visible,
}: {
  accountNumber: string;
  colors: AppColors;
  idPayId: string;
  message: string;
  onClose: () => void;
  qrValue: string;
  visible: boolean;
}) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const shareInfo = async () => {
    try {
      await Share.share({ message });
    } catch {
      Alert.alert(paymentT(t, 'common.shareFailedTitle'), paymentT(t, 'common.tryAgain'));
    }
  };

  const copyText = async (title: string, value: string) => {
    await Clipboard.setStringAsync(value);
    Alert.alert(paymentT(t, 'common.copied'), title);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={[styles.sheetLayer, { backgroundColor: colors.overlay }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={paymentT(t, 'receive.shareSheet.close')} onPress={onClose} style={styles.sheetBackdrop} />
        <View
          style={[
            styles.sheet,
            styles.shareSheet,
            paymentSurfaces.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: Math.max(spacing.xxl, insets.bottom + spacing.lg) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIcon, { backgroundColor: colors.surfaceMuted }]}>
              <Share2 color={colors.primaryDark} size={26} strokeWidth={2} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} hitSlop={8} style={styles.sheetClose}>
              <X color={colors.textSecondary} size={24} strokeWidth={2} />
            </Pressable>
          </View>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{paymentT(t, 'receive.shareSheet.title')}</Text>
          <Text style={[styles.sheetDescription, { color: colors.textSecondary }]}>
            {paymentT(t, 'receive.shareSheet.description')}
          </Text>

          <View style={[styles.sharePreview, { backgroundColor: colors.surfaceMuted }]}>
            <QrCode color={colors.primaryDark} size={28} strokeWidth={2} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{paymentT(t, 'receive.shareSheet.qrTitle')}</Text>
              <Text numberOfLines={1} style={[styles.rowDescription, { color: colors.textSecondary }]}>
                {idPayId}
              </Text>
            </View>
          </View>

          <View style={[styles.shareOptions, { borderColor: colors.border }]}>
            <ShareOptionRow
              colors={colors}
              description={paymentT(t, 'receive.shareSheet.options.share.description')}
              icon={Share2}
              onPress={() => void shareInfo()}
              title={paymentT(t, 'receive.shareSheet.options.share.title')}
            />
            <ShareOptionRow
              colors={colors}
              description={paymentT(t, 'receive.shareSheet.options.copyId.description')}
              icon={ClipboardCopy}
              onPress={() => void copyText(paymentT(t, 'receive.shareSheet.copiedId'), idPayId)}
              title={paymentT(t, 'receive.shareSheet.options.copyId.title')}
              divider
            />
            <ShareOptionRow
              colors={colors}
              description={paymentT(t, 'receive.shareSheet.options.copyAccount.description')}
              icon={Banknote}
              onPress={() => void copyText(paymentT(t, 'receive.shareSheet.copiedAccount'), accountNumber)}
              title={paymentT(t, 'receive.shareSheet.options.copyAccount.title')}
              divider
            />
            <ShareOptionRow
              colors={colors}
              description={paymentT(t, 'receive.shareSheet.options.copyQr.description')}
              icon={Download}
              onPress={() => void copyText(paymentT(t, 'receive.shareSheet.copiedQr'), qrValue)}
              title={paymentT(t, 'receive.shareSheet.options.copyQr.title')}
              divider
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ShareOptionRow({
  colors,
  description,
  divider = false,
  icon: Icon,
  onPress,
  title,
}: {
  colors: AppColors;
  description: string;
  divider?: boolean;
  icon: LucideIcon;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.shareOptionRow,
        divider && { borderTopColor: colors.border, borderTopWidth: border.hairline },
        { opacity: pressed ? 0.68 : 1 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
        <Icon color={colors.primaryDark} size={22} strokeWidth={2} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

function ReceiveSummaryRow({
  colors,
  label,
  last = false,
  value,
}: {
  colors: AppColors;
  label: string;
  last?: boolean;
  value: string;
}) {
  return (
    <View style={[styles.summaryRow, !last && { borderBottomColor: colors.border, borderBottomWidth: border.hairline }]}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.xxl, gap: spacing.lg },
  receiveHero: {
    minHeight: 560,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  heroAuraLarge: {
    position: 'absolute',
    right: -88,
    bottom: 76,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroAuraSmall: {
    position: 'absolute',
    top: 104,
    left: -44,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.extraBold,
  },
  heroCopy: { flex: 1, minWidth: 0 },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroName: {
    flexShrink: 1,
    color: palette.white,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.extraBold,
  },
  heroProvider: {
    marginTop: spacing.xxs,
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  idpayBadge: {
    minHeight: 34,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm + spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.17)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255, 255, 255, 0.26)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  idpayBadgeText: {
    color: palette.white,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  qrPanel: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  qrFrame: {
    borderRadius: radius.xl,
    padding: spacing.md,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogo: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: radius.round,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  heroInfo: {
    minHeight: 82,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroAmount: {
    minHeight: 102,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: border.hairline,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  heroMetaLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
    fontWeight: typography.weight.medium,
  },
  heroMetaValue: {
    marginTop: spacing.xs,
    color: palette.white,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semibold,
  },
  heroAmountValue: {
    marginTop: spacing.xs,
    color: palette.white,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  heroCardHint: {
    marginTop: spacing.xs,
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primaryActionButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  primaryActionText: {
    color: palette.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  accountCard: {
    minHeight: 88,
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
  sheetLayer: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  shareSheet: {
    paddingHorizontal: spacing.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: radius.round,
    backgroundColor: palette.gray[200],
  },
  sheetHeader: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetClose: {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  sheetDescription: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },
  fieldLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  amountInputBox: {
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
  sheetActions: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sheetActionButton: {
    flex: 1,
  },
  sharePreview: {
    minHeight: 74,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  shareOptions: {
    marginTop: spacing.md,
    borderWidth: border.hairline,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  shareOptionRow: {
    minHeight: 76,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
