import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Check,
  ContactRound,
  History,
  LockKeyhole,
  Menu,
  MessageCircle,
  Share2,
  ShieldCheck,
} from 'lucide-react-native';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppColors } from '../theme';
import type { Credential } from '../types';
import { AppBrandLogo } from '../components/AppLogo';
import {
  Card,
  CredentialIcon,
  IconButton,
  ListChevron,
  ScreenScroll,
  StatusPill,
} from '../components/ui';

interface Props {
  colors: AppColors;
  credentials: Credential[];
  did: string;
  onOpenCredential: (credential: Credential) => void;
  onOpenCredentials: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSecurity: () => void;
  onOpenShare: () => void;
  onOpenActivity: () => void;
  onOpenScan: () => void;
  onOpenChat: () => void;
}

export function WalletScreen({
  colors,
  credentials,
  did,
  onOpenCredential,
  onOpenCredentials,
  onOpenNotifications,
  onOpenProfile,
  onOpenSecurity,
  onOpenShare,
  onOpenActivity,
  onOpenScan,
  onOpenChat,
}: Props) {
  const featured =
    credentials.find((item) => item.id === 'cred-degree') ??
    credentials.find((item) => item.status === 'verified') ??
    credentials[0];
  const preferredCredentialOrder = ['cred-degree', 'cred-ielts', 'cred-kyc'];
  const visibleCredentials = credentials
    .filter((item) => item.status === 'verified')
    .sort((first, second) => {
      const firstRank = preferredCredentialOrder.indexOf(first.id);
      const secondRank = preferredCredentialOrder.indexOf(second.id);
      return (firstRank === -1 ? preferredCredentialOrder.length : firstRank) -
        (secondRank === -1 ? preferredCredentialOrder.length : secondRank);
    })
    .slice(0, 3);
  const quickActions = [
    { id: 'profile', label: 'Thông tin\ncá nhân', icon: ContactRound, action: onOpenProfile },
    { id: 'security', label: 'Bảo mật', icon: LockKeyhole, action: onOpenSecurity },
    { id: 'history', label: 'Lịch sử\nhoạt động', icon: History, action: onOpenActivity },
    { id: 'share', label: 'Chia sẻ\ndữ liệu', icon: Share2, action: onOpenShare },
  ];

  return (
    <ScreenScroll
      id="screen-wallet-home"
      colors={colors}
      contentStyle={styles.screenContent}
    >
      <View style={styles.brandHeader}>
        <IconButton label="Mở menu" colors={colors}>
          <Menu color={colors.text} size={26} />
        </IconButton>
        <AppBrandLogo colors={colors} style={styles.brandLogo} />
        <IconButton label="Mở Chat" colors={colors} onPress={onOpenChat}>
          <MessageCircle color={colors.text} size={25} />
        </IconButton>
      </View>

      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Ví của tôi</Text>
          <Text style={[styles.did, { color: colors.textSecondary }]}>{did}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở thông báo"
          onPress={onOpenNotifications}
          style={({ pressed }) => [
            styles.notification,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Bell color={colors.text} size={25} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" onPress={() => featured && onOpenCredential(featured)}>
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
              <Image
                accessibilityLabel="Ảnh đại diện sinh viên"
                source={require('../../assets/images/student_avatar_png_1781051105999.png')}
                style={styles.walletAvatar}
              />
            </View>
            <View style={styles.walletMain}>
              <Text style={styles.walletTitle}>Sinh viên</Text>
              <Text style={styles.walletIssuer}>Đại học Công nghệ</Text>
              <View style={styles.walletVerified}>
                <Check color="#FFFFFF" size={14} strokeWidth={3} />
                <Text style={styles.walletVerifiedText}>Đã xác minh</Text>
              </View>
              <Text style={styles.walletDate}>Ngày cấp {featured?.issueDate ?? '20/06/2024'}</Text>
            </View>
            <ShieldCheck color="rgba(255,255,255,0.76)" size={76} strokeWidth={1.25} style={styles.walletShield} />
          </LinearGradient>
        )}
      </Pressable>

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
                    <Icon color="#4B63F4" size={20} strokeWidth={1.9} />
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Danh tính của bạn</Text>
        <Pressable accessibilityRole="button" onPress={onOpenCredentials} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: colors.primaryDark }]}>Xem tất cả</Text>
        </Pressable>
      </View>

      {visibleCredentials.length ? (
        <Card colors={colors} style={[styles.credentialList, styles.subtleCardShadow]}>
          {visibleCredentials.map((credential, index) => (
            <Pressable
              key={credential.id}
              accessibilityRole="button"
              onPress={() => onOpenCredential(credential)}
              style={({ pressed }) => [
                styles.credentialRow,
                index < visibleCredentials.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                { opacity: pressed ? 0.65 : 1 },
              ]}
            >
              <CredentialIcon icon={credential.icon} boxSize={52} size={28} />
              <View style={styles.credentialText}>
                <Text numberOfLines={1} style={[styles.credentialTitle, { color: colors.text }]}>
                  {credential.title}
                </Text>
                <Text numberOfLines={1} style={[styles.credentialIssuer, { color: colors.textSecondary }]}>
                  {credential.issuer}
                </Text>
                <StatusPill status={credential.status} compact />
              </View>
              <ListChevron colors={colors} />
            </Pressable>
          ))}
        </Card>
      ) : (
        <Card colors={colors} style={[styles.walletEmpty, styles.subtleCardShadow]}>
          <Text style={[styles.walletEmptyTitle, { color: colors.text }]}>Ví chưa có thực chứng</Text>
          <Text style={[styles.walletEmptyText, { color: colors.textSecondary }]}>
            Quét mã QR để nhận thực chứng đầu tiên của bạn.
          </Text>
          <Pressable onPress={onOpenScan} style={styles.walletEmptyButton}>
            <Text style={styles.walletEmptyButtonText}>Quét mã QR</Text>
          </Pressable>
        </Card>
      )}

      <LinearGradient colors={['#F1F5FF', '#FFFFFF']} style={[styles.banner, { borderColor: '#CAD4FF' }]}>
        <View style={styles.bannerShield}>
          <ShieldCheck color="#5B6CFF" fill="#6F7FFF" size={32} strokeWidth={1.7} />
          <View style={styles.bannerCheck}>
            <Check color="#FFFFFF" size={11} strokeWidth={3} />
          </View>
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Dữ liệu của bạn, quyền của bạn</Text>
          <Text style={styles.bannerDescription}>Bạn toàn quyền kiểm soát việc chia sẻ và sử dụng dữ liệu cá nhân.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tìm hiểu thêm về quyền dữ liệu"
          style={({ pressed }) => [styles.bannerButton, { opacity: pressed ? 0.65 : 1 }]}
        >
          <Text style={styles.bannerButtonText}>Tìm hiểu thêm</Text>
        </Pressable>
      </LinearGradient>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingTop: 2, paddingBottom: 24, gap: 12 },
  brandHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandLogo: { flex: 1 },
  titleRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  screenTitle: { fontSize: 21, fontWeight: '800', letterSpacing: -0.45 },
  did: { marginTop: 3, fontSize: 14, fontWeight: '500' },
  notification: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3D47',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  walletCard: {
    height: 170,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  walletGlowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
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
  walletTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  walletIssuer: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '500', marginTop: 5 },
  walletVerified: {
    alignSelf: 'flex-start',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(62,215,165,0.82)',
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 29,
  },
  walletVerifiedText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  walletDate: { color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: '500', marginTop: 13 },
  walletShield: { position: 'absolute', right: 23, top: 55 },
  quickMenu: { paddingHorizontal: 5, paddingVertical: 10 },
  subtleCardShadow: Platform.select({
    ios: {
      shadowColor: '#27375F',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.035,
      shadowRadius: 9,
    },
    android: { elevation: 1 },
    default: {},
  }),
  quickMenuInner: { minHeight: 76, flexDirection: 'row', alignItems: 'stretch' },
  quickSlot: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  quickButton: { flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 7 },
  quickIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#F0F2FF', alignItems: 'center', justifyContent: 'center' },
  quickText: { fontSize: 11, lineHeight: 14, fontWeight: '500', textAlign: 'center' },
  quickDivider: { width: 1, height: 62 },
  sectionHeading: { minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: '600' },
  credentialList: { paddingHorizontal: 14, paddingVertical: 0, overflow: 'hidden' },
  credentialRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  credentialText: { flex: 1, gap: 3 },
  credentialTitle: { fontSize: 14, fontWeight: '800' },
  credentialIssuer: { fontSize: 12, fontWeight: '500' },
  walletEmpty: { alignItems: 'center', gap: 8 },
  walletEmptyTitle: { fontSize: 16, fontWeight: '800' },
  walletEmptyText: { textAlign: 'center', fontSize: 13, lineHeight: 19 },
  walletEmptyButton: { minHeight: 44, marginTop: 7, backgroundColor: '#5B6CFF', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  walletEmptyButtonText: { color: '#FFFFFF', fontWeight: '800' },
  banner: {
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
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
    backgroundColor: '#5B6CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: { color: '#17203B', fontSize: 12, fontWeight: '800' },
  bannerDescription: { color: '#596684', fontSize: 10, lineHeight: 15, marginTop: 3 },
  bannerButton: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#5B6CFF',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerButtonText: { color: '#355CFF', fontSize: 11, fontWeight: '600' },
});
