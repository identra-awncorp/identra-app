import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Check,
  ContactRound,
  History,
  LockKeyhole,
  MessageCircle,
  Share2,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppColors } from '../../theme';
import { border, palette, radius, shadows, spacing, typography } from '../../theme';
import type { CredentialsListState } from './credentials/CredentialsScreen';
import { FailureNotice, TextAction } from './wallet/WalletParts';
import { issuerText } from '../../domain/wallet/walletViews';
import { MainTopHeader } from '../../components/MainTopHeader';
import { useI18n } from '../../i18n';
import {
  Card,
  CredentialIcon,
  ListChevron,
  ScreenScroll,
  StatusPill,
} from '../../components/AppUiPrimitives';

interface Props {
  colors: AppColors;
  /** The wallet as the list screen sees it: loading, failed (locked, storage) or ready. */
  walletState: CredentialsListState;
  onOpenRestore: () => void;
  onRetry: () => void;
  onOpenCredential: (credentialId: string) => void;
  onOpenCredentials: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSecurity: () => void;
  onOpenShare: () => void;
  onOpenActivity: () => void;
  onOpenScan: () => void;
  onOpenChat: () => void;
  onOpenMenu: () => void;
}

export function WalletScreen({
  colors,
  walletState,
  onOpenRestore,
  onRetry,
  onOpenCredential,
  onOpenCredentials,
  onOpenNotifications,
  onOpenProfile,
  onOpenSecurity,
  onOpenShare,
  onOpenActivity,
  onOpenScan,
  onOpenChat,
  onOpenMenu,
}: Props) {
  const { t } = useI18n();
  const held = walletState.phase === 'ready' ? walletState.items : [];
  const restoreNeeded = walletState.phase === 'ready' && (walletState.restoreNeeded || walletState.toRequestCount > 0);
  const featured = held.find((item) => item.status === 'verified') ?? held[0];
  const visibleCredentials = held.slice(0, 3);
  const quickActions = [
    { id: 'profile', label: t('identity.wallet.quickActions.profile'), icon: ContactRound, action: onOpenProfile },
    { id: 'security', label: t('identity.wallet.quickActions.security'), icon: LockKeyhole, action: onOpenSecurity },
    { id: 'history', label: t('identity.wallet.quickActions.activity'), icon: History, action: onOpenActivity },
    { id: 'share', label: t('identity.wallet.quickActions.share'), icon: Share2, action: onOpenShare },
  ];

  return (
    <View nativeID="screen-wallet-home" testID="screen-wallet-home" style={[styles.screen, { backgroundColor: colors.background }]}>
      <MainTopHeader
        colors={colors}
        menuLabel={t('identity.wallet.openMenu')}
        onOpenMenu={onOpenMenu}
        actions={[
          {
            key: 'chat',
            label: t('identity.wallet.openChat'),
            icon: MessageCircle,
            onPress: onOpenChat,
          },
          {
            key: 'notifications',
            label: t('identity.wallet.openNotifications'),
            icon: Bell,
            onPress: onOpenNotifications,
            dot: true,
          },
        ]}
      />

      <ScreenScroll
        id="screen-wallet-home-content"
        colors={colors}
        contentStyle={styles.screenContent}
        includeTopInset={false}
      >
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.text }]}>{t('identity.wallet.title')}</Text>
        </View>
      </View>

      {featured ? (
      <Pressable accessibilityRole="button" onPress={() => onOpenCredential(featured.id)}>
        {({ pressed }) => (
          <LinearGradient
            colors={['#6252F5', '#3C80F6', '#35B7EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.walletCard, { opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={styles.walletGlowOne} />
            <View style={styles.walletGlowTwo} />
            <View style={styles.walletAvatarFrame}>
              <CredentialIcon icon="graduation" boxSize={64} size={36} />
            </View>
            <View style={styles.walletMain}>
              <Text style={styles.walletTitle}>{t(featured.nameKey)}</Text>
              <Text style={styles.walletIssuer}>{issuerText(featured, t)}</Text>
              <View style={[styles.walletVerified, featured.status !== 'verified' && styles.walletStatusOther]}>
                {featured.status === 'verified' ? <Check color={palette.white} size={14} strokeWidth={3} /> : null}
                <Text style={styles.walletVerifiedText}>{t(`common.status.${featured.status}`)}</Text>
              </View>
              <Text style={styles.walletDate}>{t('wallet.list.receivedOn', { date: featured.receivedDate })}</Text>
            </View>
            <ShieldCheck color="rgba(255,255,255,0.76)" size={76} strokeWidth={1.25} style={styles.walletShield} />
          </LinearGradient>
        )}
      </Pressable>
      ) : null}

      <Card colors={colors} style={[styles.quickMenu, styles.subtleCardShadow]}>
        <View nativeID="identra-quick-menu" testID="identra-quick-menu" style={styles.quickMenuInner}>
          {quickActions.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.id} style={styles.quickSlot}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.label.replace('\n', ' ')}
                  onPress={item.action}
                  style={({ pressed }) => [styles.quickButton, { opacity: pressed ? 0.65 : 1 }]}
                >
                  <View style={styles.quickIcon}>
                    <Icon color={palette.blue[600]} size={20} strokeWidth={1.9} />
                  </View>
                  <Text style={[styles.quickText, { color: colors.textSecondary }]}>{item.label}</Text>
                </Pressable>
                {index < quickActions.length - 1 ? <View style={[styles.quickDivider, { backgroundColor: colors.border }]} /> : null}
              </View>
            );
          })}
        </View>
      </Card>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('identity.wallet.sectionTitle')}</Text>
        <Pressable accessibilityRole="button" onPress={onOpenCredentials} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: colors.primaryDark }]}>{t('common.seeAll')}</Text>
        </Pressable>
      </View>

      {walletState.phase === 'failed' ? (
        <View style={styles.stateBlock}>
          <FailureNotice colors={colors} failure={walletState.failure} />
          <TextAction colors={colors} label={t('wallet.actions.tryAgain')} onPress={onRetry} />
        </View>
      ) : null}

      {restoreNeeded && walletState.phase === 'ready' ? (
        <Pressable accessibilityRole="button" onPress={onOpenRestore} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <View style={[styles.restoreCard, { backgroundColor: colors.surfaceMuted }]}>
            <History color={colors.primaryDark} size={22} strokeWidth={1.9} />
            <View style={styles.restoreText}>
              <Text style={[styles.credentialTitle, { color: colors.text }]}>
                {walletState.restoreNeeded ? t('wallet.list.restoreTitle') : t('wallet.list.toRequestTitle', { count: walletState.toRequestCount })}
              </Text>
              <Text style={[styles.credentialIssuer, { color: colors.textSecondary }]}>{t('wallet.list.restoreHint')}</Text>
            </View>
            <ListChevron colors={colors} />
          </View>
        </Pressable>
      ) : null}

      {visibleCredentials.length ? (
        <Card colors={colors} style={[styles.credentialList, styles.subtleCardShadow]}>
          {visibleCredentials.map((credential, index) => (
            <Pressable
              key={credential.id}
              accessibilityRole="button"
              onPress={() => onOpenCredential(credential.id)}
              style={({ pressed }) => [
                styles.credentialRow,
                index < visibleCredentials.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                { opacity: pressed ? 0.65 : 1 },
              ]}
            >
              <CredentialIcon icon="graduation" boxSize={52} size={28} colors={colors} />
              <View style={styles.credentialText}>
                <Text numberOfLines={1} style={[styles.credentialTitle, { color: colors.text }]}>
                  {t(credential.nameKey)}
                </Text>
                <Text numberOfLines={1} style={[styles.credentialIssuer, { color: colors.textSecondary }]}>
                  {issuerText(credential, t)}
                </Text>
                <StatusPill status={credential.status} compact colors={colors} />
              </View>
              <ListChevron colors={colors} />
            </Pressable>
          ))}
        </Card>
      ) : walletState.phase !== 'ready' || walletState.restoreNeeded ? null : (
        <Card colors={colors} style={[styles.walletEmpty, styles.subtleCardShadow]}>
          <Text style={[styles.walletEmptyTitle, { color: colors.text }]}>{t('identity.wallet.emptyTitle')}</Text>
          <Text style={[styles.walletEmptyText, { color: colors.textSecondary }]}>
            {t('identity.wallet.emptyDescription')}
          </Text>
          <Pressable onPress={onOpenScan} style={styles.walletEmptyButton}>
            <Text style={styles.walletEmptyButtonText}>{t('identity.wallet.scanQr')}</Text>
          </Pressable>
        </Card>
      )}

      <LinearGradient colors={['#F1F5FF', palette.white]} style={[styles.banner, { borderColor: '#CAD4FF' }]}>
        <View style={styles.bannerShield}>
          <ShieldCheck color={palette.blue[500]} fill="#6F7FFF" size={32} strokeWidth={1.7} />
          <View style={styles.bannerCheck}>
            <Check color={palette.white} size={11} strokeWidth={3} />
          </View>
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>{t('identity.wallet.bannerTitle')}</Text>
          <Text style={styles.bannerDescription}>{t('identity.wallet.bannerDescription')}</Text>
        </View>
      </LinearGradient>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.md },
  titleRow: { minHeight: 67, justifyContent: 'center', paddingHorizontal: spacing.xs },
  screenTitle: { fontSize: typography.size.lg + 1, fontWeight: typography.weight.extraBold, letterSpacing: -0.45 },
  did: { marginTop: spacing.xs - 1, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  walletCard: {
    height: 170,
    borderRadius: radius.lg + 2,
    padding: 18,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  walletGlowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: border.thin,
    borderColor: 'rgba(255,255,255,0.13)',
    right: -42,
    top: -5,
  },
  walletGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    right: -8,
    top: 24,
  },
  walletMain: { marginLeft: 17, flex: 1 },
  walletAvatarFrame: {
    width: 70,
    height: 70,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    backgroundColor: '#8ED8F7',
  },
  walletAvatar: { position: 'absolute', width: 120, height: 120, left: -25, top: -3 },
  walletTitle: { color: palette.white, fontSize: typography.size.lg, fontWeight: typography.weight.extraBold },
  walletIssuer: { color: 'rgba(255,255,255,0.92)', fontSize: typography.size.sm, fontWeight: typography.weight.medium, marginTop: spacing.xs + 1 },
  walletVerified: {
    alignSelf: 'flex-start',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(62,215,165,0.82)',
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm + 2,
    height: 29,
  },
  walletStatusOther: { backgroundColor: 'rgba(11,15,26,0.38)' },
  walletVerifiedText: { color: palette.white, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  walletDate: { color: 'rgba(255,255,255,0.92)', fontSize: typography.size.xs, fontWeight: typography.weight.medium, marginTop: spacing.md + 1 },
  walletShield: { position: 'absolute', right: 23, top: 55 },
  quickMenu: { paddingHorizontal: 5, paddingVertical: 10 },
  subtleCardShadow: shadows.subtle,
  quickMenuInner: { minHeight: 76, flexDirection: 'row', alignItems: 'stretch' },
  quickSlot: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  quickButton: { flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: spacing.sm - 1 },
  quickIcon: { width: 36, height: 36, borderRadius: radius.md - 1, backgroundColor: '#F0F2FF', alignItems: 'center', justifyContent: 'center' },
  quickText: { fontSize: 11, lineHeight: 14, fontWeight: typography.weight.medium, textAlign: 'center' },
  quickDivider: { width: border.thin, height: 62 },
  sectionHeading: { minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xxs },
  sectionTitle: { fontSize: 17, fontWeight: typography.weight.extraBold, letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: typography.weight.semibold },
  credentialList: { paddingHorizontal: 14, paddingVertical: 0, overflow: 'hidden' },
  credentialRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  credentialText: { flex: 1, gap: 3 },
  credentialTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.extraBold },
  credentialIssuer: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
  walletEmpty: { alignItems: 'center', gap: spacing.sm },
  stateBlock: { gap: spacing.xs },
  restoreCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 16, padding: spacing.lg },
  restoreText: { flex: 1, gap: 2 },
  walletEmptyTitle: { fontSize: typography.size.md, fontWeight: typography.weight.extraBold },
  walletEmptyText: { textAlign: 'center', fontSize: 13, lineHeight: 19 },
  walletEmptyButton: { minHeight: 44, marginTop: spacing.sm - 1, backgroundColor: palette.blue[500], paddingHorizontal: 20, borderRadius: radius.md, justifyContent: 'center' },
  walletEmptyButtonText: { color: palette.white, fontWeight: typography.weight.extraBold },
  banner: {
    minHeight: 76,
    borderRadius: radius.lg,
    borderWidth: border.thin,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerShield: {
    width: 48,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#E4E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCheck: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.blue[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: { color: '#17203B', fontSize: typography.size.xs, fontWeight: typography.weight.extraBold },
  bannerDescription: { color: palette.slate[600], fontSize: 10, lineHeight: 15, marginTop: spacing.xs - 1 },
  bannerButton: {
    minHeight: 38,
    borderRadius: radius.round,
    borderWidth: border.thin,
    borderColor: palette.blue[500],
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerButtonText: { color: palette.blue[700], fontSize: 11, fontWeight: typography.weight.semibold },
});
