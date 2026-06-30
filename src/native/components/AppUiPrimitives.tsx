import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  GraduationCap,
  Languages,
  ShieldCheck,
  ShieldX,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../i18n';
import type { AppColors } from '../theme';
import { border, componentSize, iconSize, layout, palette, radius, shadows, spacing, touchTarget, typography } from '../theme';
import type { CredentialIconName, CredentialStatus } from '../types';

interface ScreenScrollProps extends PropsWithChildren {
  id: string;
  colors: AppColors;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactNode;
}

export function ScreenScroll({ id, colors, children, contentStyle }: ScreenScrollProps) {
  const insets = useSafeAreaInsets();
  const content = StyleSheet.flatten([styles.screenContent, contentStyle]) ?? {};

  return (
    <View nativeID={id} testID={id} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          content,
          {
            paddingTop: getNumericStyleValue(content.paddingTop) + insets.top,
            paddingBottom: getNumericStyleValue(content.paddingBottom) + insets.bottom,
          },
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function getNumericStyleValue(value: unknown) {
  return typeof value === 'number' ? value : 0;
}

export function AppHeader({
  colors,
  title,
  onBack,
  right,
}: {
  colors: AppColors;
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <View style={styles.header}>
      {onBack ? (
        <IconButton label={t('common.back')} onPress={onBack} colors={colors}>
          <ArrowLeft size={24} color={colors.text} />
        </IconButton>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right ?? <View style={styles.headerSpacer} />}</View>
    </View>
  );
}

export function IconButton({
  label,
  colors,
  children,
  style,
  ...props
}: PropsWithChildren<
  PressableProps & { label: string; colors: AppColors; style?: StyleProp<ViewStyle> }
>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: pressed ? colors.surfaceMuted : 'transparent', opacity: pressed ? 0.78 : 1 },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export function Card({
  colors,
  children,
  style,
}: PropsWithChildren<{ colors: AppColors; style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.card, shadows.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function SectionHeading({
  colors,
  title,
  action,
  onAction,
}: {
  colors: AppColors;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: colors.primaryDark }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const credentialIcons: Record<CredentialIconName, LucideIcon> = {
  graduation: GraduationCap,
  languages: Languages,
  shield: ShieldCheck,
  bank: Banknote,
  clock: Clock3,
  security: ShieldX,
  identity: CreditCard,
  briefcase: BriefcaseBusiness,
};

export function CredentialIcon({
  icon,
  color = palette.blue[700],
  background = palette.blue[100],
  size = iconSize.md,
  boxSize = touchTarget.comfortable,
}: {
  icon: CredentialIconName;
  color?: string;
  background?: string;
  size?: number;
  boxSize?: number;
}) {
  const Icon = credentialIcons[icon];
  const renderIcon = () => {
    if (icon === 'languages') {
      return (
        <View style={styles.ieltsBadge}>
          <Text style={styles.ieltsBadgeText}>IELTS</Text>
        </View>
      );
    }

    if (icon === 'shield') {
      return (
        <View style={styles.kycIcon}>
          <ShieldCheck color={palette.slate[700]} fill={palette.slate[700]} size={size + 5} strokeWidth={1.5} />
          <Text style={styles.kycIconText}>KYC</Text>
        </View>
      );
    }

    return (
      <Icon
        color={icon === 'graduation' && color === palette.blue[700] ? palette.navy[600] : color}
        size={icon === 'graduation' ? size + 4 : size}
        strokeWidth={1.9}
      />
    );
  };

  return (
    <View
      style={[
        styles.credentialIcon,
        { width: boxSize, height: boxSize, borderRadius: Math.max(radius.md, boxSize * 0.28), backgroundColor: background },
      ]}
    >
      {renderIcon()}
    </View>
  );
}

const statusStyle: Record<CredentialStatus, { color: string; background: string; icon: LucideIcon }> = {
  verified: { color: palette.green[600], background: palette.green[100], icon: Check },
  pending: { color: palette.orange[500], background: palette.orange[100], icon: Clock3 },
  expired: { color: palette.red[500], background: palette.red[100], icon: ShieldX },
};

export function StatusPill({ status, compact = false }: { status: CredentialStatus; compact?: boolean }) {
  const { t } = useI18n();
  const config = statusStyle[status];
  const Icon = config.icon;
  return (
    <View style={[styles.statusPill, { backgroundColor: config.background }, compact && styles.statusCompact]}>
      {compact ? (
        <View style={[styles.statusCompactIcon, { backgroundColor: config.color }]}>
          <Icon color="#FFFFFF" size={9} strokeWidth={3} />
        </View>
      ) : (
        <Icon color={config.color} size={14} strokeWidth={2.5} />
      )}
      <Text style={[styles.statusText, { color: config.color }, compact && styles.statusTextCompact]}>{t(`common.status.${status}`)}</Text>
    </View>
  );
}

export function ListChevron({ colors }: { colors: AppColors }) {
  return <ChevronRight color={colors.textSecondary} size={20} strokeWidth={2} />;
}

export function PrimaryButton({
  colors,
  title,
  onPress,
  secondary = false,
  loading = false,
  style,
}: {
  colors: AppColors;
  title: string;
  onPress: () => void;
  secondary?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        secondary
          ? { backgroundColor: colors.surface, borderColor: colors.primaryDark, borderWidth: border.thin }
          : { backgroundColor: colors.primaryDark },
        { opacity: pressed || loading ? 0.75 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primaryDark : palette.white} />
      ) : (
        <Text style={[styles.primaryButtonText, { color: secondary ? colors.primaryDark : palette.white }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function EmptyState({
  colors,
  icon: Icon = ShieldCheck,
  title,
  description,
  action,
  onAction,
}: {
  colors: AppColors;
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Card colors={colors} style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Icon color={colors.primary} size={38} strokeWidth={1.7} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>{description}</Text>
      {action && onAction ? <PrimaryButton colors={colors} title={action} onPress={onAction} style={styles.emptyAction} /> : null}
    </Card>
  );
}

export function UserAvatar({ size = 56 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <UserRound color={palette.white} size={size * 0.6} strokeWidth={1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm, paddingBottom: 112, gap: spacing.lg },
  header: { minHeight: layout.appBarHeight, flexDirection: 'row', alignItems: 'center' },
  headerSpacer: { width: touchTarget.minimum, height: touchTarget.minimum },
  headerTitle: { flex: 1, fontSize: typography.size.lg, fontWeight: typography.weight.extraBold, letterSpacing: -0.3 },
  headerRight: { minWidth: touchTarget.minimum, alignItems: 'flex-end' },
  iconButton: { width: touchTarget.minimum, height: touchTarget.minimum, borderRadius: radius.md + 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: border.thin, borderRadius: radius.lg + 2, padding: spacing.lg },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xxs },
  sectionTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.extraBold, letterSpacing: -0.35 },
  sectionAction: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  credentialIcon: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ieltsBadge: { borderRadius: radius.xs + 1, backgroundColor: palette.slate[700], paddingHorizontal: spacing.xs + 1, paddingVertical: spacing.sm },
  ieltsBadgeText: { color: palette.white, fontSize: 8, fontWeight: typography.weight.black, letterSpacing: -0.2 },
  kycIcon: { alignItems: 'center', justifyContent: 'center' },
  kycIconText: { position: 'absolute', color: palette.white, fontSize: 7, fontWeight: typography.weight.black },
  statusPill: {
    alignSelf: 'flex-start',
    minHeight: 27,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.round,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
  },
  statusCompact: { minHeight: 22, paddingHorizontal: spacing.none, backgroundColor: 'transparent' },
  statusCompactIcon: { width: 14, height: 14, borderRadius: radius.sm - 1, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  statusTextCompact: { fontSize: 11, fontWeight: typography.weight.semibold },
  primaryButton: {
    minHeight: componentSize.buttonHeight + 2,
    borderRadius: radius.md + 2,
    paddingHorizontal: spacing.lg + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { fontSize: typography.size.md, fontWeight: typography.weight.extraBold },
  emptyState: { minHeight: 330, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl + spacing.xxs },
  emptyIcon: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: spacing.lg + spacing.xxs, fontSize: 19, fontWeight: typography.weight.extraBold },
  emptyDescription: { marginTop: spacing.sm, textAlign: 'center', fontSize: typography.size.sm, lineHeight: typography.lineHeight.md - 2 },
  emptyAction: { marginTop: spacing.xl - spacing.xxs, alignSelf: 'stretch' },
  avatar: {
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    borderWidth: border.thin,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
