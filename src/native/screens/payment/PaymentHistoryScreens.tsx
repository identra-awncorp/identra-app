import * as Clipboard from 'expo-clipboard';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  ReceiptText,
  Search,
  SlidersHorizontal,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';

import { AppHeader, Card, EmptyState, PrimaryButton, ScreenScroll } from '../../components/AppUiPrimitives';
import {
  getHistorySummary,
  getPaymentTransactionById,
  paymentTransactions,
  type PaymentTransaction,
  type PaymentTransactionStatus,
} from '../../data/demo/paymentHistoryDemoData';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../theme';
import { formatAmount } from '../chat/paymentUtils';
import { paymentSurfaces } from './components/paymentSurfaces';
import { paymentT } from './paymentI18n';

type HistoryFilterId = 'all' | 'in' | 'out' | 'bill' | 'topup' | 'failed';

const historyFilters: { id: HistoryFilterId; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'in', label: 'Tiền vào' },
  { id: 'out', label: 'Tiền ra' },
  { id: 'bill', label: 'Hóa đơn' },
  { id: 'topup', label: 'Nạp ĐT' },
  { id: 'failed', label: 'Lỗi' },
];

const statusContent: Record<PaymentTransactionStatus, { label: string; colorKey: 'success' | 'warning' | 'danger'; icon: LucideIcon }> = {
  failed: { label: 'Không thành công', colorKey: 'danger', icon: XCircle },
  pending: { label: 'Đang xử lý', colorKey: 'warning', icon: Clock3 },
  success: { label: 'Thành công', colorKey: 'success', icon: CheckCircle2 },
};

export function PaymentHistoryScreen({
  colors,
  onBack,
  onOpenTransaction,
}: {
  colors: AppColors;
  onBack: () => void;
  onOpenTransaction: (transaction: PaymentTransaction) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [filterId, setFilterId] = useState<HistoryFilterId>('all');
  const summary = getHistorySummary();
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTransactions = useMemo(
    () =>
      paymentTransactions.filter((transaction) => {
        const matchesQuery =
          !normalizedQuery ||
          `${transaction.title} ${transaction.counterparty} ${transaction.description} ${transaction.reference}`
            .toLowerCase()
            .includes(normalizedQuery);

        if (!matchesQuery) return false;
        if (filterId === 'all') return true;
        if (filterId === 'in') return transaction.direction === 'in';
        if (filterId === 'out') return transaction.direction === 'out';
        if (filterId === 'failed') return transaction.status === 'failed';
        return transaction.category === filterId;
      }),
    [filterId, normalizedQuery],
  );
  const groupedTransactions = groupTransactionsByDate(visibleTransactions);

  return (
    <ScreenScroll id="screen-payment-history" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader
        colors={colors}
        title={paymentT(t, 'history.title')}
        onBack={onBack}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'history.export')}
            onPress={() => Alert.alert(paymentT(t, 'history.export'), paymentT(t, 'history.exportDescription'))}
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.72 : 1 }]}
          >
            <Download color={colors.primaryDark} size={19} strokeWidth={2} />
          </Pressable>
        }
      />

      <View style={[styles.historyHero, paymentSurfaces.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={[styles.heroEyebrow, { color: colors.textSecondary }]}>{paymentT(t, 'history.currentMonth')}</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{paymentT(t, 'history.cashFlow')}</Text>
          </View>
          <View style={[styles.heroIcon, { backgroundColor: colors.surfaceMuted }]}>
            <ReceiptText color={colors.primaryDark} size={30} strokeWidth={2} />
          </View>
        </View>
        <View style={styles.summaryGrid}>
          <HistoryMetric colors={colors} label={paymentT(t, 'history.moneyIn')} value={`+${formatAmount(summary.income)} VND`} tone="success" />
          <HistoryMetric colors={colors} label={paymentT(t, 'history.moneyOut')} value={`-${formatAmount(summary.outcome)} VND`} tone="danger" />
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.textSecondary} size={22} strokeWidth={2} />
        <TextInput
          accessibilityLabel={paymentT(t, 'history.searchAccessibility')}
          onChangeText={setQuery}
          placeholder={paymentT(t, 'history.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={query}
        />
        <SlidersHorizontal color={colors.textSecondary} size={21} strokeWidth={2} />
      </View>

      <View style={styles.filterRow}>
        {historyFilters.map((filter) => {
          const selected = filter.id === filterId;
          return (
            <Pressable
              key={filter.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilterId(filter.id)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: selected ? colors.primaryDark : colors.surface,
                  borderColor: selected ? colors.primaryDark : colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: selected ? palette.white : colors.text }]}>{paymentT(t, `history.filters.${filter.id}`)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'history.transactions')}</Text>
        <View style={[styles.countPill, { backgroundColor: colors.surfaceMuted }]}>
          <Filter color={colors.primaryDark} size={14} strokeWidth={2} />
          <Text style={[styles.countText, { color: colors.primaryDark }]}>{visibleTransactions.length}</Text>
        </View>
      </View>

      {groupedTransactions.length ? (
        groupedTransactions.map((group) => (
          <View key={group.dateLabel} style={styles.transactionGroup}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{group.dateLabel}</Text>
            <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
              {group.items.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  colors={colors}
                  divider={index > 0}
                  onPress={() => onOpenTransaction(transaction)}
                  transaction={transaction}
                />
              ))}
            </Card>
          </View>
        ))
      ) : (
        <EmptyState
          colors={colors}
          icon={ReceiptText}
          title={paymentT(t, 'history.emptyTitle')}
          description={paymentT(t, 'history.emptyDescription')}
        />
      )}
    </ScreenScroll>
  );
}

export function PaymentTransactionDetailScreen({
  colors,
  onBack,
  transactionId,
}: {
  colors: AppColors;
  onBack: () => void;
  transactionId?: string | string[];
}) {
  const { t } = useI18n();
  const transaction = getPaymentTransactionById(transactionId);
  const StatusIcon = statusContent[transaction.status].icon;
  const statusColor = colors[statusContent[transaction.status].colorKey];
  const signedAmount = `${transaction.direction === 'in' ? '+' : '-'}${formatAmount(transaction.amount)} ${transaction.currency}`;
  const totalAmount = transaction.direction === 'out' ? transaction.amount + transaction.fee : transaction.amount;

  const shareReceipt = async () => {
    try {
      await Share.share({
        message: [
          'Identra Pay',
          transaction.title,
          paymentT(t, 'history.share.transactionIdLine', { reference: transaction.reference }),
          paymentT(t, 'history.share.amountLine', { amount: signedAmount }),
          paymentT(t, 'history.share.statusLine', { status: paymentT(t, `history.status.${transaction.status}`) }),
        ].join('\n'),
      });
    } catch {
      Alert.alert(paymentT(t, 'common.shareFailedTitle'), paymentT(t, 'common.tryAgain'));
    }
  };

  const copyReference = async () => {
    await Clipboard.setStringAsync(transaction.reference);
    Alert.alert(paymentT(t, 'common.copied'), transaction.reference);
  };

  return (
    <ScreenScroll id="screen-payment-transaction-detail" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={paymentT(t, 'history.detailTitle')} onBack={onBack} />

      <View style={[styles.receiptHero, paymentSurfaces.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.receiptIcon, { backgroundColor: transaction.background }]}>
          <transaction.icon color={transaction.color} size={34} strokeWidth={2} />
        </View>
        <Text style={[styles.receiptTitle, { color: colors.text }]}>{transaction.title}</Text>
        <Text style={[styles.receiptAmount, { color: transaction.direction === 'in' ? colors.success : colors.text }]}>
          {signedAmount}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
          <StatusIcon color={statusColor} size={16} strokeWidth={2.2} />
          <Text style={[styles.statusPillText, { color: statusColor }]}>{paymentT(t, `history.status.${transaction.status}`)}</Text>
        </View>
      </View>

      <Card colors={colors} style={[paymentSurfaces.card, styles.detailCard]}>
        <DetailRow colors={colors} label={paymentT(t, 'common.transactionId')} value={transaction.reference} />
        <DetailRow colors={colors} label={paymentT(t, 'history.detail.category')} value={paymentT(t, `history.categories.${transaction.category}`)} />
        <DetailRow colors={colors} label={paymentT(t, 'history.detail.counterparty')} value={transaction.counterparty} />
        <DetailRow colors={colors} label={paymentT(t, 'common.description')} value={transaction.description} />
        <DetailRow colors={colors} label={paymentT(t, 'history.detail.channel')} value={transaction.channel} />
        <DetailRow colors={colors} label={paymentT(t, 'common.source')} value={transaction.sourceAccount} />
        <DetailRow colors={colors} label={paymentT(t, 'common.time')} value={`${transaction.dateLabel} · ${transaction.time}`} />
        <DetailRow colors={colors} label={paymentT(t, 'common.fee')} value={`${formatAmount(transaction.fee)} ${transaction.currency}`} />
        <DetailRow colors={colors} label={paymentT(t, 'history.detail.totalRecorded')} value={`${formatAmount(totalAmount)} ${transaction.currency}`} strong last />
      </Card>

      <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
        <BadgeCheck color={colors.primaryDark} size={21} strokeWidth={2} />
        <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
          {paymentT(t, 'history.detail.demoNotice')}
        </Text>
      </View>

      <View style={styles.detailActions}>
        <PrimaryButton colors={colors} title={paymentT(t, 'history.detail.shareReceipt')} onPress={() => void shareReceipt()} />
        <PrimaryButton colors={colors} title={paymentT(t, 'common.copyTransactionId')} onPress={() => void copyReference()} secondary />
      </View>
    </ScreenScroll>
  );
}

function HistoryMetric({
  colors,
  label,
  tone,
  value,
}: {
  colors: AppColors;
  label: string;
  tone: 'success' | 'danger';
  value: string;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.metricValue, { color: colors[tone] }]}>{value}</Text>
    </View>
  );
}

function TransactionRow({
  colors,
  divider = false,
  onPress,
  transaction,
}: {
  colors: AppColors;
  divider?: boolean;
  onPress: () => void;
  transaction: PaymentTransaction;
}) {
  const { t } = useI18n();
  const StatusIcon = statusContent[transaction.status].icon;
  const statusColor = colors[statusContent[transaction.status].colorKey];
  const amountPrefix = transaction.direction === 'in' ? '+' : '-';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={paymentT(t, 'history.openTransaction', { title: transaction.title })}
      onPress={onPress}
      style={({ pressed }) => [
        styles.transactionRow,
        divider && { borderTopColor: colors.border, borderTopWidth: border.hairline },
        { opacity: pressed ? 0.68 : 1 },
      ]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: transaction.background }]}>
        <transaction.icon color={transaction.color} size={22} strokeWidth={2} />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.rowTitleLine}>
          <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.text }]}>{transaction.title}</Text>
          <StatusIcon color={statusColor} size={14} strokeWidth={2.2} />
        </View>
        <Text numberOfLines={1} style={[styles.rowDescription, { color: colors.textSecondary }]}>{transaction.counterparty} · {transaction.description}</Text>
        <Text numberOfLines={1} style={[styles.rowMeta, { color: colors.textSecondary }]}>{transaction.time} · {transaction.reference}</Text>
      </View>
      <View style={styles.amountColumn}>
        <Text
          numberOfLines={1}
          style={[
            styles.rowAmount,
            { color: transaction.direction === 'in' ? colors.success : transaction.status === 'failed' ? colors.textSecondary : colors.text },
          ]}
        >
          {amountPrefix}{formatAmount(transaction.amount)}
        </Text>
        <Text style={[styles.rowCurrency, { color: colors.textSecondary }]}>{transaction.currency}</Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={19} strokeWidth={2} />
    </Pressable>
  );
}

function DetailRow({
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
    <View style={[styles.detailRow, !last && { borderBottomColor: colors.border, borderBottomWidth: border.hairline }]}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={3} style={[strong ? styles.detailValueStrong : styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function groupTransactionsByDate(transactions: PaymentTransaction[]) {
  return transactions.reduce<{ dateLabel: string; items: PaymentTransaction[] }[]>((groups, transaction) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.dateLabel === transaction.dateLabel) {
      lastGroup.items.push(transaction);
      return groups;
    }

    groups.push({ dateLabel: transaction.dateLabel, items: [transaction] });
    return groups;
  }, []);
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.xxl, gap: spacing.lg },
  headerButton: {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyHero: {
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  heroTitle: {
    marginTop: spacing.xs,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.black,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGrid: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  metricValue: {
    marginTop: spacing.xs,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.black,
    fontVariant: ['tabular-nums'],
  },
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
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    minHeight: 38,
    borderRadius: radius.round,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.black,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.black,
  },
  countPill: {
    minHeight: 28,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.black,
  },
  transactionGroup: {
    gap: spacing.sm,
  },
  dateLabel: {
    paddingHorizontal: spacing.xxs,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.black,
  },
  listCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  transactionRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  transactionIcon: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowTitle: {
    flexShrink: 1,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.black,
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
  amountColumn: {
    maxWidth: 86,
    alignItems: 'flex-end',
  },
  rowAmount: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.black,
    fontVariant: ['tabular-nums'],
  },
  rowCurrency: {
    fontSize: 10,
    fontWeight: typography.weight.semibold,
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
    textAlign: 'center',
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.black,
  },
  receiptAmount: {
    marginTop: spacing.sm,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.black,
    fontVariant: ['tabular-nums'],
  },
  statusPill: {
    minHeight: 30,
    marginTop: spacing.md,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusPillText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.black,
  },
  detailCard: {
    paddingVertical: spacing.xs,
  },
  detailRow: {
    minHeight: 56,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    flex: 0.76,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  detailValue: {
    flex: 1.24,
    textAlign: 'right',
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.bold,
  },
  detailValueStrong: {
    flex: 1.24,
    textAlign: 'right',
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.black,
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
  detailActions: {
    gap: spacing.sm,
  },
});
