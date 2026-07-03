import {
  Bell,
  CreditCard,
  History,
  LockKeyhole,
  ReceiptText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Wallet,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader, Card, ListChevron, PrimaryButton, ScreenScroll } from '../../components/AppUiPrimitives';
import type { PaymentFlowConfig } from '../../data/demo/paymentFlowDemoData';
import { getPaymentCardById } from '../../data/demo/paymentHomeDemoData';
import { isPaymentActionComingSoon } from '../../domain/payment/paymentAvailability';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../theme';
import { PaymentCvvSheet } from './components/PaymentCvvSheet';
import { paymentSurfaces } from './components/paymentSurfaces';
import { paymentCardText, paymentFlowStepText, paymentFlowText, paymentT } from './paymentI18n';
import type { PaymentCard } from './paymentTypes';

const searchSuggestions = [
  { id: 'transfer', title: 'Chuyển tiền cho người nhận mới', description: 'Tìm theo IDPay, số điện thoại hoặc số tài khoản', icon: Wallet },
  { id: 'phone', title: 'Nạp tiền điện thoại', description: 'Nạp nhanh cho số của bạn hoặc danh bạ đã lưu', icon: Smartphone },
  { id: 'bill', title: 'Tra cứu hóa đơn', description: 'Điện, nước, internet, học phí', icon: ReceiptText },
  { id: 'history', title: 'Tìm giao dịch gần đây', description: 'Lọc theo người nhận, số tiền hoặc trạng thái', icon: History },
];

const paymentNotifications = [
  {
    id: 'cashback',
    title: 'Hoàn tiền đã được ghi nhận',
    description: 'Giao dịch Identra Pay cuối tuần đã nhận hoàn tiền về tài khoản chính.',
    time: '5 phút trước',
    unread: true,
  },
  {
    id: 'security',
    title: 'Cảnh báo đăng nhập an toàn',
    description: 'Thiết bị hiện tại vừa xác thực để xem thông tin thẻ.',
    time: '1 giờ trước',
    unread: true,
  },
  {
    id: 'bill',
    title: 'Hóa đơn điện nước sắp đến hạn',
    description: 'Bạn có một hóa đơn có thể thanh toán bằng Identra Pay.',
    time: 'Hôm qua',
    unread: false,
  },
];

export function PaymentSearchScreen({
  colors,
  onBack,
  onOpenFlow,
}: {
  colors: AppColors;
  onBack: () => void;
  onOpenFlow: (flow: string) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  return (
    <ScreenScroll id="screen-payment-search" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={paymentT(t, 'search.title')} onBack={onBack} />
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search color={colors.textSecondary} size={22} strokeWidth={2} />
        <TextInput
          accessibilityLabel={paymentT(t, 'search.accessibility')}
          onChangeText={setQuery}
          placeholder={paymentT(t, 'search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={query}
        />
        <SlidersHorizontal color={colors.textSecondary} size={21} strokeWidth={2} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'search.quickSuggestions')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        {searchSuggestions.map((item, index) => (
          <PaymentNavRow
            key={item.id}
            colors={colors}
            icon={item.icon}
            title={paymentT(t, `search.suggestions.${item.id}.title`)}
            description={paymentT(t, `search.suggestions.${item.id}.description`)}
            divider={index > 0}
            onPress={() => onOpenFlow(item.id)}
          />
        ))}
      </Card>
    </ScreenScroll>
  );
}

export function PaymentNotificationsScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const { t } = useI18n();
  const [readAll, setReadAll] = useState(false);

  return (
    <ScreenScroll id="screen-payment-notifications" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader
        colors={colors}
        title={paymentT(t, 'notifications.title')}
        onBack={onBack}
        right={
          <Pressable accessibilityRole="button" accessibilityLabel={paymentT(t, 'notifications.markRead')} onPress={() => setReadAll(true)} hitSlop={8}>
            <Text style={[styles.headerAction, { color: colors.primaryDark }]}>{paymentT(t, 'notifications.markRead')}</Text>
          </Pressable>
        }
      />
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        {paymentNotifications.map((item, index) => (
          <View key={item.id} style={[styles.notificationRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: border.hairline }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
              <Bell color={colors.primaryDark} size={22} strokeWidth={2} />
            </View>
            <View style={styles.rowCopy}>
              <View style={styles.notificationTitleRow}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{paymentT(t, `notifications.items.${item.id}.title`)}</Text>
                {item.unread && !readAll ? <View style={[styles.unreadDot, { backgroundColor: colors.primaryDark }]} /> : null}
              </View>
              <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{paymentT(t, `notifications.items.${item.id}.description`)}</Text>
              <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{paymentT(t, `notifications.items.${item.id}.time`)}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}

export function PaymentAccountDetailScreen({
  cardId,
  colors,
  onBack,
  onManageCard,
  requireAuthForCvv = true,
}: {
  cardId?: string | string[];
  colors: AppColors;
  onBack: () => void;
  onManageCard: (card: PaymentCard) => void;
  requireAuthForCvv?: boolean;
}) {
  const { t } = useI18n();
  const card = getPaymentCardById(cardId);
  const [cvvCard, setCvvCard] = useState<PaymentCard | null>(null);
  const requestCvv = () => {
    if (!requireAuthForCvv) {
      setCvvCard(card);
      return;
    }

    Alert.alert(paymentT(t, 'common.cvvAuthTitle'), paymentT(t, 'common.cvvAuthDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: paymentT(t, 'common.cvvAuthAction'), onPress: () => setCvvCard(card) },
    ]);
  };

  return (
    <>
      <ScreenScroll id="screen-payment-account-detail" colors={colors} contentStyle={styles.screenContent}>
        <AppHeader colors={colors} title={paymentT(t, 'account.title')} onBack={onBack} />
        <View style={[styles.accountHero, paymentSurfaces.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.accountHeroTop}>
            <View style={[styles.cardIcon, { backgroundColor: colors.surfaceMuted }]}>
              <CreditCard color={colors.primaryDark} size={34} strokeWidth={1.9} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{card.brand} {card.cardNumber.slice(-4)}</Text>
              <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{paymentCardText(t, card, 'accountType')}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statusPillText, { color: colors.success }]}>{paymentCardText(t, card, 'status')}</Text>
            </View>
          </View>
          <Text style={[styles.accountBalanceLabel, { color: colors.textSecondary }]}>{paymentCardText(t, card, 'balanceLabel')}</Text>
          <View style={styles.accountBalanceRow}>
            <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.accountBalance, { color: colors.text }]}>
              {card.balance}
            </Text>
            <Text style={[styles.accountCurrency, { color: colors.text }]}>{card.currency}</Text>
          </View>
        </View>

        <View style={styles.accountActionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'account.manageCard')}
            onPress={() => onManageCard(card)}
            style={({ pressed }) => [styles.accountActionButton, { backgroundColor: colors.primaryDark, opacity: pressed ? 0.78 : 1 }]}
          >
            <Text style={styles.accountPrimaryActionText}>{paymentT(t, 'account.manageCard')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paymentT(t, 'account.getCvv')}
            onPress={requestCvv}
            style={({ pressed }) => [
              styles.accountActionButton,
              styles.accountSecondaryAction,
              { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Text style={[styles.accountSecondaryActionText, { color: colors.text }]}>{paymentT(t, 'account.getCvv')}</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'account.cardInfo')}</Text>
        <Card colors={colors} style={[paymentSurfaces.card, styles.infoGrid]}>
          <PaymentInfoItem colors={colors} label={paymentT(t, 'account.fields.cardNumber')} value={card.cardNumber} />
          <PaymentInfoItem colors={colors} label={paymentT(t, 'account.fields.linkedAccount')} value={card.accountNumber} />
          <PaymentInfoItem colors={colors} label={paymentT(t, 'account.fields.cardHolder')} value={card.holder} />
          <PaymentInfoItem colors={colors} label={paymentT(t, 'account.fields.expiry')} value={card.expiry} />
          <PaymentInfoItem colors={colors} label={paymentT(t, 'account.fields.dailyLimit')} value={card.dailyLimit} />
          <PaymentInfoItem colors={colors} label={paymentT(t, 'account.fields.onlineLimit')} value={card.onlineLimit} />
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'account.recentActivity')}</Text>
        <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
          {[
            { id: 'payment', amount: '-245,000 VND' },
            { id: 'cashback', amount: '+49,000 VND' },
            { id: 'receive', amount: '+1,200,000 VND' },
          ].map((item, index) => (
            <View key={item.id} style={[styles.transactionRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: border.hairline }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
                <History color={colors.primaryDark} size={22} strokeWidth={2} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{paymentT(t, `account.recent.${item.id}.title`)}</Text>
                <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{paymentT(t, `account.recent.${item.id}.description`)}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: item.amount.startsWith('+') ? colors.success : colors.text }]}>{item.amount}</Text>
            </View>
          ))}
        </Card>
      </ScreenScroll>
      <PaymentCvvSheet card={cvvCard} colors={colors} onClose={() => setCvvCard(null)} />
    </>
  );
}

export function PaymentCardManageScreen({
  cardId,
  colors,
  onBack,
}: {
  cardId?: string | string[];
  colors: AppColors;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const card = getPaymentCardById(cardId);
  const [cardLocked, setCardLocked] = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [atmEnabled, setAtmEnabled] = useState(true);
  const [contactlessEnabled, setContactlessEnabled] = useState(true);
  const [alertEnabled, setAlertEnabled] = useState(true);

  return (
    <ScreenScroll id="screen-payment-card-manage" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={paymentT(t, 'cardManage.title')} onBack={onBack} />
      <Card colors={colors} style={[paymentSurfaces.card, styles.cardSummary]}>
        <View style={[styles.cardIcon, { backgroundColor: colors.surfaceMuted }]}>
          <CreditCard color={colors.primaryDark} size={34} strokeWidth={1.9} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.brand} {card.cardNumber.slice(-4)}</Text>
          <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{card.accountNumber}</Text>
          <View style={[styles.statusPill, { backgroundColor: cardLocked ? palette.red[100] : colors.surfaceMuted }]}>
            <Text style={[styles.statusPillText, { color: cardLocked ? colors.danger : colors.success }]}>
              {cardLocked ? paymentT(t, 'cardManage.locked') : paymentCardText(t, card, 'status')}
            </Text>
          </View>
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'cardManage.securitySection')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        <PaymentToggleRow
          colors={colors}
          icon={LockKeyhole}
          title={paymentT(t, 'cardManage.toggles.lock.title')}
          description={paymentT(t, 'cardManage.toggles.lock.description')}
          value={cardLocked}
          onValueChange={setCardLocked}
        />
        <PaymentToggleRow
          colors={colors}
          icon={ShieldCheck}
          title={paymentT(t, 'cardManage.toggles.online.title')}
          description={paymentT(t, 'cardManage.toggles.online.description')}
          value={!cardLocked && onlineEnabled}
          onValueChange={(value) => {
            if (!cardLocked) setOnlineEnabled(value);
          }}
          divider
        />
        <PaymentToggleRow
          colors={colors}
          icon={Wallet}
          title={paymentT(t, 'cardManage.toggles.atm.title')}
          description={paymentT(t, 'cardManage.toggles.atm.description')}
          value={!cardLocked && atmEnabled}
          onValueChange={(value) => {
            if (!cardLocked) setAtmEnabled(value);
          }}
          divider
        />
        <PaymentToggleRow
          colors={colors}
          icon={CreditCard}
          title={paymentT(t, 'cardManage.toggles.contactless.title')}
          description={paymentT(t, 'cardManage.toggles.contactless.description')}
          value={!cardLocked && contactlessEnabled}
          onValueChange={(value) => {
            if (!cardLocked) setContactlessEnabled(value);
          }}
          divider
        />
        <PaymentToggleRow
          colors={colors}
          icon={Bell}
          title={paymentT(t, 'cardManage.toggles.alerts.title')}
          description={paymentT(t, 'cardManage.toggles.alerts.description')}
          value={alertEnabled}
          onValueChange={setAlertEnabled}
          divider
        />
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'cardManage.limitsSection')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        <PaymentNavRow
          colors={colors}
          icon={Wallet}
          title={paymentT(t, 'cardManage.nav.dailyLimit')}
          description={card.dailyLimit}
          onPress={() => Alert.alert(paymentT(t, 'cardManage.alerts.dailyLimit.title'), paymentT(t, 'cardManage.alerts.dailyLimit.description'))}
        />
        <PaymentNavRow
          colors={colors}
          icon={CreditCard}
          title={paymentT(t, 'cardManage.nav.onlineLimit')}
          description={card.onlineLimit}
          divider
          onPress={() => Alert.alert(paymentT(t, 'cardManage.alerts.onlineLimit.title'), paymentT(t, 'cardManage.alerts.onlineLimit.description'))}
        />
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'cardManage.otherSection')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        <PaymentNavRow
          colors={colors}
          icon={ShieldCheck}
          title={paymentT(t, 'cardManage.nav.changePin')}
          description={paymentT(t, 'cardManage.nav.changePinDescription')}
          onPress={() => Alert.alert(paymentT(t, 'cardManage.alerts.changePin.title'), paymentT(t, 'cardManage.alerts.changePin.description'))}
        />
        <PaymentNavRow
          colors={colors}
          icon={History}
          title={paymentT(t, 'cardManage.nav.statement')}
          description={paymentCardText(t, card, 'statementDate')}
          divider
          onPress={() => Alert.alert(paymentT(t, 'cardManage.alerts.statement.title'), paymentT(t, 'cardManage.alerts.statement.description'))}
        />
      </Card>
    </ScreenScroll>
  );
}

export function PaymentFlowScreen({
  colors,
  config,
  onBack,
}: {
  colors: AppColors;
  config: PaymentFlowConfig;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const flowTitle = paymentFlowText(t, config, 'title');
  const comingSoon = isPaymentActionComingSoon(config.id);

  return (
    <ScreenScroll id={`screen-payment-flow-${config.id}`} colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={flowTitle} onBack={onBack} />
      <View style={[styles.flowHero, paymentSurfaces.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.flowBadge, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.flowBadgeText, { color: colors.primaryDark }]}>{comingSoon ? paymentT(t, 'flow.comingSoon') : paymentFlowText(t, config, 'status')}</Text>
        </View>
        <Text style={[styles.flowTitle, { color: colors.text }]}>{flowTitle}</Text>
        <Text style={[styles.flowDescription, { color: colors.textSecondary }]}>{paymentFlowText(t, config, 'description')}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'flow.implementationSteps')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        {config.steps.map((step, index) => (
          <View key={step.title} style={[styles.stepRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: border.hairline }]}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primaryDark }]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{paymentFlowStepText(t, config, index, 'title')}</Text>
              <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{paymentFlowStepText(t, config, index, 'description')}</Text>
            </View>
          </View>
        ))}
      </Card>
      <PrimaryButton
        colors={colors}
        title={comingSoon ? paymentT(t, 'flow.comingSoonAction') : paymentFlowText(t, config, 'primaryAction')}
        onPress={() => Alert.alert(flowTitle, comingSoon ? paymentT(t, 'flow.comingSoonAlert') : paymentT(t, 'flow.placeholderAlert'))}
      />
    </ScreenScroll>
  );
}

function PaymentNavRow({
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
  icon: typeof Wallet;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.navRow,
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
      <ListChevron colors={colors} />
    </Pressable>
  );
}

function PaymentInfoItem({ colors, label, value }: { colors: AppColors; label: string; value: string }) {
  return (
    <View style={[styles.infoItem, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function PaymentToggleRow({
  colors,
  description,
  divider = false,
  icon: Icon,
  onValueChange,
  title,
  value,
}: {
  colors: AppColors;
  description: string;
  divider?: boolean;
  icon: typeof Wallet;
  onValueChange: (value: boolean) => void;
  title: string;
  value: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.navRow,
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
      <View style={[styles.switchTrack, { backgroundColor: value ? colors.primaryDark : colors.surfaceMuted }]}>
        <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
      </View>
    </Pressable>
  );
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
  navRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  notificationRow: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
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
  rowMeta: {
    marginTop: spacing.xs,
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },
  headerAction: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardSummary: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 62,
    height: 62,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  accountHero: {
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  accountHeroTop: {
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
  accountBalanceLabel: {
    marginTop: spacing.xl,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
  },
  accountBalanceRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  accountBalance: {
    flexShrink: 1,
    fontSize: typography.size.xl + 4,
    lineHeight: typography.lineHeight.xl + 3,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  accountCurrency: {
    flexShrink: 0,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  accountActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  accountActionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountSecondaryAction: {
    borderWidth: border.hairline,
  },
  accountPrimaryActionText: {
    color: palette.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  accountSecondaryActionText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoItem: {
    width: '48.5%',
    minHeight: 78,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: typography.weight.semibold,
  },
  infoValue: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  transactionRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  transactionAmount: {
    maxWidth: 112,
    textAlign: 'right',
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.weight.semibold,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: radius.round,
    padding: 3,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.white,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  flowHero: {
    borderWidth: border.hairline,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  flowBadge: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  flowTitle: {
    marginTop: spacing.lg,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.extraBold,
  },
  flowDescription: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },
  stepRow: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: palette.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});
