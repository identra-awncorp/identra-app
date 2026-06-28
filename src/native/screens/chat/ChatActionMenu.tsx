import {
  ArrowLeftRight,
  CalendarClock,
  CreditCard,
  FilePlus2,
  QrCode,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { border, radius, spacing, typography, type AppColors } from '../../theme';
import { useI18n } from '../../i18n';

export function ChatActionMenu({
  colors,
  onOpenBankAccount,
  onOpenContract,
  onOpenPaymentQr,
  onOpenReminder,
  onOpenTransfer,
  onShareCredential,
}: {
  colors: AppColors;
  onOpenBankAccount: () => void;
  onOpenContract: () => void;
  onOpenPaymentQr: () => void;
  onOpenReminder: () => void;
  onOpenTransfer: () => void;
  onShareCredential: () => void;
}) {
  const { t } = useI18n();
  return (
    <View style={styles.grid}>
      <ActionItem colors={colors} description={t('chat.menu.contractDescription')} icon={FilePlus2} onPress={onOpenContract} title={t('chat.menu.contractTitle')} />
      <ActionItem colors={colors} description={t('chat.menu.paymentQrDescription')} icon={QrCode} onPress={onOpenPaymentQr} title={t('chat.menu.paymentQrTitle')} />
      <ActionItem colors={colors} description={t('chat.menu.transferDescription')} icon={ArrowLeftRight} onPress={onOpenTransfer} title={t('chat.menu.transferTitle')} />
      <ActionItem colors={colors} description={t('chat.menu.reminderDescription')} icon={CalendarClock} onPress={onOpenReminder} title={t('chat.menu.reminderTitle')} />
      <ActionItem colors={colors} description={t('chat.menu.bankDescription')} icon={CreditCard} onPress={onOpenBankAccount} title={t('chat.menu.bankTitle')} />
      <ActionItem colors={colors} description={t('chat.menu.credentialDescription')} icon={ShieldCheck} onPress={onShareCredential} title={t('chat.menu.credentialTitle')} />
    </View>
  );
}

function ActionItem({
  colors,
  description,
  icon: Icon,
  onPress,
  title,
}: {
  colors: AppColors;
  description: string;
  icon: typeof ShieldCheck;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon color={colors.primaryDark} size={38} strokeWidth={1.8} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { alignContent: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' },
  item: { alignItems: 'center', minHeight: 190, paddingHorizontal: spacing.xs + 1, width: '33.333%' },
  itemPressed: { opacity: 0.65 },
  icon: { alignItems: 'center', borderRadius: radius.lg - 3, borderWidth: border.thin, height: 76, justifyContent: 'center', marginBottom: spacing.sm + spacing.xxs, width: 76 },
  title: { fontSize: typography.size.sm, fontWeight: typography.weight.extraBold, lineHeight: 19, textAlign: 'center' },
  description: { fontSize: typography.size.xs, lineHeight: 17, marginTop: spacing.xxs, maxWidth: 105, textAlign: 'center' },
});
