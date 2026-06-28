import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  IdCard,
  MapPin,
  Medal,
  RefreshCw,
  ShieldCheck,
  Ticket,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { assetManifest } from '../../../assets/assetManifest';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { border, palette } from '../../../theme';
import type { SmartContractFeedPost } from '../../../types';


import {
  AppHeader,
  ScreenScroll,
} from '../../../components/AppUiPrimitives';
import { styles } from '../../shared/DetailScreenSharedStyles';

const verifiedBadgeIcon = assetManifest.badges.verified;
export function SmartContractDetailScreen({
  colors,
  onBack,
  post,
}: {
  colors: AppColors;
  onBack: () => void;
  post: SmartContractFeedPost;
}) {
  const { t } = useI18n();
  const { contract } = post;
  const isSoldOut = contract.availability === 'soldOut';
  const statusTone = isSoldOut
    ? { label: t('newsFeed.smartContractDetail.status.soldOut'), color: colors.danger, background: palette.red[100] }
    : { label: t('newsFeed.smartContract.availableTickets', { count: contract.remainingCount }), color: colors.success, background: palette.green[100] };
  const screenId = isSoldOut ? 'screen-smart-contract-detail-sold-out' : 'screen-smart-contract-detail-available';

  return (
    <ScreenScroll id={screenId} colors={colors} contentStyle={styles.contractDetailScreenContent}>
      <AppHeader
        colors={colors}
        title={contract.title}
        onBack={onBack}
        right={
          <View style={[styles.contractHeaderShield, { backgroundColor: colors.surfaceMuted }]}>
            <ShieldCheck color={colors.text} size={25} strokeWidth={2} />
          </View>
        }
      />

      <View style={[styles.contractHeroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.contractHeroTop}>
          <LinearTicketArt />
          <View style={styles.contractHeroMain}>
            <View style={styles.contractTitleRow}>
              <Text style={[styles.contractTicketTitle, { color: colors.text }]}>{contract.assetTitle}</Text>
              <Image source={verifiedBadgeIcon} style={styles.contractVerifiedBadge} resizeMode="contain" />
            </View>
            <Text style={[styles.contractTicketSubtitle, { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.flow.vipRank')}</Text>
            <ContractMetaLine colors={colors} icon={CalendarDays} label={t('newsFeed.smartContractDetail.meta.eventDate')} value={contract.eventDate} />
            <ContractMetaLine colors={colors} icon={MapPin} label={t('newsFeed.smartContractDetail.meta.location')} value={contract.location} />
            <ContractMetaLine colors={colors} icon={IdCard} label={t('newsFeed.smartContractDetail.meta.ticketCode')} value={contract.assetCode.replace(/^.*?:\s*/, '')} />
            <ContractMetaLine colors={colors} icon={UserRound} label={t('newsFeed.smartContractDetail.meta.owner')} value={contract.owner} valueColor={colors.primaryDark} />
          </View>
        </View>

        <View style={[styles.contractHeroFooter, { borderTopColor: colors.border }]}>
          <View style={styles.contractBelongsRow}>
            <ShieldCheck color={colors.textSecondary} size={23} strokeWidth={2} />
            <Text style={[styles.contractBelongsText, { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.belongsToSmartContract')}</Text>
          </View>
          <View style={[styles.contractStateBadge, { backgroundColor: statusTone.background }]}>
            {isSoldOut ? <X color={statusTone.color} size={15} strokeWidth={2.3} /> : <CheckCircle2 color={statusTone.color} size={15} strokeWidth={2.3} />}
            <Text style={[styles.contractStateBadgeText, { color: statusTone.color }]}>{statusTone.label}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.contractSectionTitle, { color: colors.text }]}>{t('newsFeed.smartContractDetail.sections.itemInfo')}</Text>
      <View style={[styles.contractTableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ContractTableRow colors={colors} icon={FileCheck2} label={t('newsFeed.smartContractDetail.table.itemType')} value={contract.itemType} />
        <ContractTableRow colors={colors} icon={Medal} label={t('newsFeed.smartContractDetail.table.remaining')} value={`${contract.remainingCount}`} />
        <ContractTableRow colors={colors} icon={RefreshCw} label={t('newsFeed.smartContractDetail.table.transferability')} value={contract.transferability} />
        <ContractTableRow colors={colors} icon={Building2} label={t('newsFeed.smartContractDetail.table.issuer')} value={contract.issuer} />
        <ContractTableRow colors={colors} icon={ShieldCheck} label={t('newsFeed.smartContractDetail.table.verificationMethod')} value={contract.verificationMethod} />
        <ContractTableRow
          colors={colors}
          icon={isSoldOut ? X : CheckCircle2}
          label={t('newsFeed.smartContractDetail.table.status')}
          value={contract.transactionStatus}
          valueColor={isSoldOut ? colors.textSecondary : colors.success}
          last
        />
      </View>

      {isSoldOut ? (
        <>
          <Text style={[styles.contractSectionTitle, { color: colors.text }]}>{t('newsFeed.smartContractDetail.sections.transferConditions')}</Text>
          <View style={[styles.contractTableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ContractTableRow colors={colors} icon={FileCheck2} label={t('newsFeed.smartContractDetail.table.counterPayment')} value={`${contract.amount.replace('₫ ', '')} ${t('newsFeed.smartContractDetail.flow.viaIdentraPay')}`} />
            <ContractTableRow colors={colors} icon={IdCard} label={t('newsFeed.smartContractDetail.table.execution')} value={contract.condition} />
            <ContractTableRow colors={colors} icon={ShieldCheck} label={t('newsFeed.smartContractDetail.table.safety')} value={contract.security} last />
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.contractSectionTitle, { color: colors.text }]}>{t('newsFeed.smartContractDetail.sections.tradeFlow')}</Text>
          <View style={[styles.contractFlowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.contractFlowPanel, { borderColor: colors.primaryDark, backgroundColor: colors.surface }]}>
              <View style={styles.contractFlowTitleRow}>
                <UserRound color={colors.primaryDark} size={18} />
                <Text style={[styles.contractFlowTitle, { color: colors.primaryDark }]}>{t('newsFeed.smartContractDetail.flow.sellerTransfers')}</Text>
              </View>
              <View style={[styles.contractFlowInner, { borderColor: colors.border }]}>
                <LinearTicketIcon />
                <View style={styles.contractFlowCopy}>
                  <Text style={[styles.contractFlowItemTitle, { color: colors.text }]}>{t('newsFeed.smartContractDetail.flow.ticketName')}</Text>
                  <Text style={[styles.contractFlowItemMeta, { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.flow.vipRank')}</Text>
                  <Text style={[styles.contractFlowItemMeta, { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.flow.quantity', { count: contract.remainingCount })}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.contractFlowSwap, { backgroundColor: colors.surfaceMuted }]}>
              <RefreshCw color={colors.primaryDark} size={22} strokeWidth={2.2} />
            </View>
            <View style={[styles.contractFlowPanel, { borderColor: colors.success, backgroundColor: palette.green[100] }]}>
              <View style={styles.contractFlowTitleRow}>
                <UserRound color={colors.success} size={18} />
                <Text style={[styles.contractFlowTitle, { color: colors.success }]}>{t('newsFeed.smartContractDetail.flow.youPay')}</Text>
              </View>
              <View style={[styles.contractFlowInner, { borderColor: '#BFEFD2', backgroundColor: colors.surface }]}>
                <View style={[styles.contractPayIcon, { backgroundColor: palette.green[100] }]}>
                  <FileCheck2 color={colors.success} size={28} />
                </View>
                <View style={styles.contractFlowCopy}>
                  <Text style={[styles.contractFlowItemTitle, { color: colors.text }]}>{contract.amount.replace('₫ ', '')}</Text>
                  <Text style={[styles.contractFlowItemMeta, { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.flow.viaIdentraPay')}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.contractSectionTitle, { color: colors.text }]}>{t('newsFeed.smartContractDetail.sections.currentStatus')}</Text>
          <View style={[styles.contractTableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ContractTableRow colors={colors} icon={CheckCircle2} label={t('newsFeed.smartContractDetail.table.status')} value={contract.transactionStatus} valueColor={colors.success} />
            <ContractTableRow colors={colors} icon={Clock3} label={t('newsFeed.smartContractDetail.table.responseDeadline')} value={contract.deadline} />
            <ContractTableRow colors={colors} icon={ShieldCheck} label={t('newsFeed.smartContractDetail.table.tradeCondition')} value={contract.condition} />
            <ContractTableRow colors={colors} icon={ShieldCheck} label={t('newsFeed.smartContractDetail.table.safetyAndTransparency')} value={contract.security} last />
          </View>
        </>
      )}

      <View style={[styles.contractIssuerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.contractIssuerLogo}>
          <Text style={styles.contractIssuerLogoText}>GENFEST</Text>
        </View>
        <View style={styles.contractIssuerMain}>
          <View style={styles.contractIssuerNameRow}>
            <Text style={[styles.contractIssuerName, { color: colors.text }]}>{contract.issuer}</Text>
            <Image source={verifiedBadgeIcon} style={styles.contractIssuerBadge} resizeMode="contain" />
          </View>
          <Text style={[styles.contractIssuerDescription, { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.issuerDescription')}</Text>
        </View>
        <ChevronRight color={colors.textSecondary} size={23} />
      </View>

      <View style={styles.contractDetailActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('newsFeed.smartContractDetail.viewCredential')}
          accessibilityState={{ disabled: true }}
          disabled
          style={[styles.contractDetailSecondaryButton, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
        >
          <ShieldCheck color={colors.textSecondary} size={18} />
          <Text style={[styles.contractDetailSecondaryText, { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.viewCredential')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('newsFeed.smartContractDetail.tradeAccessibility')}
          accessibilityState={{ disabled: isSoldOut }}
          disabled={isSoldOut}
          style={({ pressed }) => [
            styles.contractDetailPrimaryButton,
            { backgroundColor: isSoldOut ? colors.surfaceMuted : colors.primaryDark, opacity: pressed && !isSoldOut ? 0.78 : 1 },
          ]}
        >
          <Text style={[styles.contractDetailPrimaryText, isSoldOut && { color: colors.textSecondary }]}>{t('newsFeed.smartContractDetail.trade')}</Text>
        </Pressable>
      </View>
    </ScreenScroll>
  );
}

function LinearTicketArt() {
  return (
    <View style={styles.contractTicketArt}>
      <Text style={styles.contractTicketSmall}>identra</Text>
      <Text style={styles.contractTicketBrand}>GENFEST</Text>
      <Text style={styles.contractTicketYear}>2025</Text>
      <Text style={styles.contractTicketDate}>08.06.2025</Text>
    </View>
  );
}

function LinearTicketIcon() {
  return (
    <View style={styles.contractFlowTicketIcon}>
      <Ticket color={palette.white} size={24} strokeWidth={2.2} />
    </View>
  );
}

function ContractMetaLine({
  colors,
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  colors: AppColors;
  icon: LucideIcon;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.contractMetaLine}>
      <Icon color={colors.textSecondary} size={17} strokeWidth={2} />
      <Text style={[styles.contractMetaLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.contractMetaValue, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}

function ContractTableRow({
  colors,
  icon: Icon,
  label,
  last = false,
  value,
  valueColor,
}: {
  colors: AppColors;
  icon: LucideIcon;
  label: string;
  last?: boolean;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={[styles.contractTableRow, !last && { borderBottomColor: colors.border, borderBottomWidth: border.thin }]}>
      <Icon color={colors.primaryDark} size={18} strokeWidth={2} />
      <Text style={[styles.contractTableLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.contractTableValue, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}
