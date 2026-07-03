import { LinearGradient } from 'expo-linear-gradient';
import {
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Gift,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, PrimaryButton, ScreenScroll } from '../../components/AppUiPrimitives';
import {
  getPaymentExploreDetail,
  type PaymentExploreDetail,
  type PaymentExploreSection,
} from '../../data/demo/paymentExploreDemoData';
import { isPaymentExploreActionComingSoon } from '../../domain/payment/paymentAvailability';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { border, palette, radius, spacing, touchTarget, typography } from '../../theme';
import { paymentSurfaces } from './components/paymentSurfaces';
import { paymentT } from './paymentI18n';

export function PaymentExploreDetailScreen({
  colors,
  itemId,
  onBack,
  onPrimaryAction,
  section,
}: {
  colors: AppColors;
  itemId?: string | string[];
  onBack: () => void;
  onPrimaryAction: (detail: PaymentExploreDetail) => void;
  section?: PaymentExploreSection | string | string[];
}) {
  const { t } = useI18n();
  const detail = getPaymentExploreDetail(section, itemId);
  const [saved, setSaved] = useState(false);
  const [activated, setActivated] = useState(false);
  const Icon = detail.icon;
  const comingSoon = isPaymentExploreActionComingSoon(detail.actionTarget);

  const handlePrimary = () => {
    if (!comingSoon && detail.actionTarget === 'activate') {
      setActivated(true);
      setSaved(true);
    }

    onPrimaryAction(detail);
  };

  return (
    <ScreenScroll id="screen-payment-explore-detail" colors={colors} contentStyle={styles.screenContent}>
      <AppHeader colors={colors} title={detail.badge} onBack={onBack} />

      <LinearGradient
        colors={detail.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, paymentSurfaces.hero, { borderColor: colors.border }]}
      >
        <View style={styles.heroAuraLarge} />
        <View style={styles.heroAuraSmall} />
        <View style={styles.heroTopRow}>
          <View style={[styles.heroIcon, { backgroundColor: detail.background }]}>
            <Icon color={detail.color} size={34} strokeWidth={2.1} />
          </View>
          <View style={[styles.badgePill, { backgroundColor: palette.white }]}>
            <Sparkles color={detail.color} size={15} strokeWidth={2.2} />
            <Text style={[styles.badgeText, { color: detail.color }]}>{comingSoon ? paymentT(t, 'flow.comingSoon') : detail.badge}</Text>
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{detail.title}</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{detail.subtitle}</Text>
        <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>{detail.description}</Text>

        <View style={styles.heroMetricRow}>
          <View style={styles.heroMetric}>
            <Gift color={detail.color} size={18} strokeWidth={2.2} />
            <View style={styles.metricCopy}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{paymentT(t, 'explore.reward')}</Text>
              <Text numberOfLines={1} style={[styles.metricValue, { color: colors.text }]}>{detail.reward}</Text>
            </View>
          </View>
          <View style={styles.heroMetric}>
            <CalendarDays color={detail.color} size={18} strokeWidth={2.2} />
            <View style={styles.metricCopy}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{paymentT(t, 'explore.validUntil')}</Text>
              <Text numberOfLines={1} style={[styles.metricValue, { color: colors.text }]}>{detail.validUntil}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={saved ? paymentT(t, 'explore.saved') : paymentT(t, 'explore.saveItem')}
          onPress={() => setSaved((value) => !value)}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: saved ? detail.background : colors.surface, borderColor: saved ? detail.color : colors.border, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          {saved ? <Check color={detail.color} size={20} strokeWidth={2.4} /> : <Gift color={colors.primaryDark} size={20} strokeWidth={2} />}
          <Text style={[styles.saveButtonText, { color: saved ? detail.color : colors.text }]}>{saved ? paymentT(t, 'explore.saved') : paymentT(t, 'explore.save')}</Text>
        </Pressable>
        <View style={styles.primaryActionWrap}>
          <PrimaryButton colors={colors} title={comingSoon ? paymentT(t, 'flow.comingSoonAction') : activated ? paymentT(t, 'explore.activated') : detail.actionLabel} onPress={handlePrimary} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'explore.benefits')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        {detail.benefits.map((benefit, index) => (
          <ExploreListRow
            key={benefit}
            colors={colors}
            divider={index > 0}
            icon={CheckCircle2}
            iconBackground={detail.background}
            iconColor={detail.color}
            title={benefit}
          />
        ))}
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'explore.howTo')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.stepCard]}>
        {detail.steps.map((step, index) => (
          <View key={step.title} style={[styles.stepRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: border.hairline }]}>
            <View style={[styles.stepNumber, { backgroundColor: detail.color }]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>{step.description}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{paymentT(t, 'explore.conditions')}</Text>
      <Card colors={colors} style={[paymentSurfaces.card, styles.listCard]}>
        {detail.conditions.map((condition, index) => (
          <ExploreListRow
            key={condition}
            colors={colors}
            divider={index > 0}
            icon={Info}
            iconBackground={colors.surfaceMuted}
            iconColor={colors.primaryDark}
            title={condition}
          />
        ))}
      </Card>

      <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
        <BadgeCheck color={colors.primaryDark} size={21} strokeWidth={2} />
        <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
          {paymentT(t, 'explore.demoNotice')}
        </Text>
      </View>
    </ScreenScroll>
  );
}

function ExploreListRow({
  colors,
  divider = false,
  icon: Icon,
  iconBackground,
  iconColor,
  title,
}: {
  colors: AppColors;
  divider?: boolean;
  icon: typeof CheckCircle2;
  iconBackground: string;
  iconColor: string;
  title: string;
}) {
  return (
    <View style={[styles.listRow, divider && { borderTopColor: colors.border, borderTopWidth: border.hairline }]}>
      <View style={[styles.listIcon, { backgroundColor: iconBackground }]}>
        <Icon color={iconColor} size={20} strokeWidth={2.2} />
      </View>
      <Text style={[styles.listText, { color: colors.text }]}>{title}</Text>
      <ChevronRight color={colors.textSecondary} size={18} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingBottom: spacing.xxl, gap: spacing.lg },
  hero: {
    minHeight: 314,
    borderWidth: border.hairline,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  heroAuraLarge: {
    position: 'absolute',
    right: -62,
    bottom: -74,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
  heroAuraSmall: {
    position: 'absolute',
    top: 32,
    right: 38,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    minHeight: 32,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  heroTitle: {
    marginTop: spacing.xl,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.extraBold,
  },
  heroSubtitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semibold,
  },
  heroDescription: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.medium,
  },
  heroMetricRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroMetric: {
    flex: 1,
    minHeight: 66,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricCopy: { flex: 1, minWidth: 0 },
  metricLabel: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },
  metricValue: {
    marginTop: spacing.xxs,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButton: {
    minWidth: 104,
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: border.hairline,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  primaryActionWrap: { flex: 1 },
  sectionTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
  },
  listCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  listRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  listIcon: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listText: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  stepCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  stepRow: {
    minHeight: 84,
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
});
