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
import type { AppColors } from '../theme';
import { shadows } from '../theme';
import type { CredentialIconName, CredentialStatus } from '../types';

interface ScreenScrollProps extends PropsWithChildren {
  id: string;
  colors: AppColors;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactNode;
}

export function ScreenScroll({ id, colors, children, contentStyle }: ScreenScrollProps) {
  return (
    <View nativeID={id} testID={id} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.screenContent, contentStyle]}
      >
        {children}
      </ScrollView>
    </View>
  );
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
  return (
    <View style={styles.header}>
      {onBack ? (
        <IconButton label="Quay lại" onPress={onBack} colors={colors}>
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
  color = '#355CFF',
  background = '#EEF3FF',
  size = 24,
  boxSize = 48,
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
          <ShieldCheck color="#42516E" fill="#42516E" size={size + 5} strokeWidth={1.5} />
          <Text style={styles.kycIconText}>KYC</Text>
        </View>
      );
    }

    return (
      <Icon
        color={icon === 'graduation' && color === '#355CFF' ? '#263856' : color}
        size={icon === 'graduation' ? size + 4 : size}
        strokeWidth={1.9}
      />
    );
  };

  return (
    <View
      style={[
        styles.credentialIcon,
        { width: boxSize, height: boxSize, borderRadius: Math.max(12, boxSize * 0.28), backgroundColor: background },
      ]}
    >
      {renderIcon()}
    </View>
  );
}

const statusStyle: Record<CredentialStatus, { label: string; color: string; background: string; icon: LucideIcon }> = {
  verified: { label: 'Đã xác minh', color: '#12B76A', background: '#EAFDF4', icon: Check },
  pending: { label: 'Đang chờ xác nhận', color: '#F57900', background: '#FFF3E8', icon: Clock3 },
  expired: { label: 'Đã hết hạn', color: '#FF3D47', background: '#FFF0F1', icon: ShieldX },
};

export function StatusPill({ status, compact = false }: { status: CredentialStatus; compact?: boolean }) {
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
      <Text style={[styles.statusText, { color: config.color }, compact && styles.statusTextCompact]}>{config.label}</Text>
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
          ? { backgroundColor: colors.surface, borderColor: colors.primaryDark, borderWidth: 1 }
          : { backgroundColor: colors.primaryDark },
        { opacity: pressed || loading ? 0.75 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primaryDark : '#FFFFFF'} />
      ) : (
        <Text style={[styles.primaryButtonText, { color: secondary ? colors.primaryDark : '#FFFFFF' }]}>{title}</Text>
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
      <UserRound color="#FFFFFF" size={size * 0.6} strokeWidth={1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 112, gap: 16 },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center' },
  headerSpacer: { width: 44, height: 44 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  headerRight: { minWidth: 44, alignItems: 'flex-end' },
  iconButton: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.35 },
  sectionAction: { fontSize: 14, fontWeight: '600' },
  credentialIcon: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ieltsBadge: { borderRadius: 7, backgroundColor: '#42516E', paddingHorizontal: 5, paddingVertical: 8 },
  ieltsBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: -0.2 },
  kycIcon: { alignItems: 'center', justifyContent: 'center' },
  kycIconText: { position: 'absolute', color: '#FFFFFF', fontSize: 7, fontWeight: '900' },
  statusPill: {
    alignSelf: 'flex-start',
    minHeight: 27,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusCompact: { minHeight: 22, paddingHorizontal: 0, backgroundColor: 'transparent' },
  statusCompactIcon: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextCompact: { fontSize: 11, fontWeight: '600' },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '800' },
  emptyState: { minHeight: 330, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  emptyIcon: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 18, fontSize: 19, fontWeight: '800' },
  emptyDescription: { marginTop: 8, textAlign: 'center', fontSize: 14, lineHeight: 21 },
  emptyAction: { marginTop: 22, alignSelf: 'stretch' },
  avatar: {
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
