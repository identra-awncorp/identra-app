import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Clock3,
  Download,
  FileCheck2,
  GraduationCap,
  Heart,
  History,
  IdCard,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Medal,
  MoreVertical,
  Phone,
  RefreshCw,
  ScanLine,
  Settings,
  Share2,
  ShieldCheck,
  Ticket,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useI18n, type I18nKey } from '../../../i18n';
import { assetManifest } from '../../../assets/assetManifest';
import type { AppColors } from '../../../theme';
import { border, componentSize, layout, palette, radius, spacing, touchTarget, typography } from '../../../theme';
import type { AppSettings, Credential, PersonalInfo, SmartContractFeedPost } from '../../../types';
import {
  notificationItems,
  type NotificationFilter,
  type NotificationItem,
} from '../../../data/demo/newsFeedNotificationDemoData';
import {
  AppHeader,
  Card,
  CredentialIcon,
  EmptyState,
  IconButton,
  ListChevron,
  PrimaryButton,
  SectionHeading,
  StatusPill,
} from '../../../components/AppUiPrimitives';
import { styles } from '../../shared/DetailScreenSharedStyles';

const verifiedBadgeIcon = assetManifest.badges.verified;
const notificationFilterTabs: Array<{ key: NotificationFilter; labelKey: I18nKey }> = [
  { key: 'all', labelKey: 'notifications.tabs.all' },
  { key: 'mentions', labelKey: 'notifications.tabs.mentions' },
  { key: 'follows', labelKey: 'notifications.tabs.follows' },
  { key: 'transactions', labelKey: 'notifications.tabs.transactions' },
  { key: 'system', labelKey: 'notifications.tabs.system' },
];

export function NotificationsScreen({
  colors,
  onBack,
  onSettings,
}: {
  colors: AppColors;
  onBack: () => void;
  onSettings: () => void;
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [readAll, setReadAll] = useState(false);
  const tabCounts = useMemo(
    () =>
      notificationFilterTabs.reduce<Record<NotificationFilter, number>>(
        (accumulator, tab) => {
          accumulator[tab.key] = tab.key === 'all' ? notificationItems.length : notificationItems.filter((item) => item.category === tab.key).length;
          return accumulator;
        },
        { all: 0, mentions: 0, follows: 0, transactions: 0, system: 0 },
      ),
    [],
  );
  const visible = useMemo(
    () => notificationItems.filter((item) => filter === 'all' || item.category === filter),
    [filter],
  );

  return (
    <View nativeID="screen-notifications" testID="screen-notifications" style={[localStyles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        contentContainerStyle={localStyles.notificationContent}
        data={visible}
        keyExtractor={(notification) => notification.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={localStyles.notificationHeaderBlock}>
            <View style={styles.notificationHeader}>
              <IconButton label={t('notifications.backToFeed')} colors={colors} onPress={onBack}>
                <ArrowLeft color={colors.text} size={26} strokeWidth={2.1} />
              </IconButton>
              <Text numberOfLines={1} style={[styles.notificationScreenTitle, { color: colors.text }]}>{t('notifications.title')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('notifications.markAllReadAccessibility')}
                onPress={() => setReadAll(true)}
                style={({ pressed }) => [styles.markReadButton, { opacity: pressed ? 0.62 : 1 }]}
              >
                <Text numberOfLines={1} style={[styles.markReadText, { color: colors.primaryDark }]}>{t('notifications.markAllRead')}</Text>
              </Pressable>
              <IconButton label={t('notifications.openSettings')} colors={colors} onPress={onSettings}>
                <Settings color={colors.textSecondary} size={28} strokeWidth={2.1} />
              </IconButton>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.notificationTabs, { borderBottomColor: colors.border }]}>
              {notificationFilterTabs.map((tab) => {
                const value = tab.key;
                const active = filter === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter(value)}
                    style={({ pressed }) => [
                      styles.notificationTab,
                      { backgroundColor: active ? colors.surfaceMuted : 'transparent', opacity: pressed ? 0.68 : 1 },
                    ]}
                  >
                    <Text style={[styles.notificationTabText, { color: active ? colors.primaryDark : colors.textSecondary }]}>{t(tab.labelKey)}</Text>
                    <View style={[styles.notificationTabCount, { backgroundColor: active ? colors.primaryDark : colors.surfaceMuted }]}>
                      <Text style={[styles.notificationTabCountText, { color: active ? palette.white : colors.text }]}>{tabCounts[value]}</Text>
                    </View>
                    {active ? <View style={[styles.notificationTabUnderline, { backgroundColor: colors.primaryDark }]} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={localStyles.notificationEmpty}>
            <EmptyState colors={colors} icon={Heart} title={t('notifications.emptyTitle')} description={t('notifications.emptyDescription')} />
          </View>
        }
        ListFooterComponent={
          visible.length ? (
            <View style={styles.notificationList}>
              <View style={styles.notificationEnd}>
                <View style={[styles.notificationEndLine, { backgroundColor: colors.border }]} />
                <View style={[styles.notificationEndIcon, { borderColor: colors.border }]}>
                  <CheckCircle2 color={colors.textSecondary} size={17} strokeWidth={2} />
                </View>
                <View style={[styles.notificationEndLine, { backgroundColor: colors.border }]} />
              </View>
              <Text style={[styles.notificationEndText, { color: colors.textSecondary }]}>{t('common.endOfContent')}</Text>
            </View>
          ) : null
        }
        renderItem={({ item: notification, index }) => (
          <NotificationRow
            colors={colors}
            last={index === visible.length - 1}
            notification={notification}
            unread={Boolean(notification.unread && !readAll)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function NotificationRow({
  colors,
  last,
  notification,
  unread,
}: {
  colors: AppColors;
  last: boolean;
  notification: NotificationItem;
  unread: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.strong}${notification.text}`}
      style={({ pressed }) => [
        styles.notificationRow,
        !last && { borderBottomColor: colors.border, borderBottomWidth: border.hairline },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <NotificationAvatarView notification={notification} />
      <View style={styles.notificationMain}>
        <Text style={[styles.notificationTitle, { color: colors.text }]}>
          <Text style={styles.notificationTitleStrong}>{notification.strong}</Text>
          {notification.text}
        </Text>
        <Text style={[styles.notificationBody, { color: colors.textSecondary }]}>{notification.body}</Text>
        {notification.chip ? (
          <View style={[styles.notificationChip, { backgroundColor: colors.surfaceMuted }]}>
            <FileCheck2 color={colors.textSecondary} size={14} strokeWidth={1.9} />
            <Text numberOfLines={1} style={[styles.notificationChipText, { color: colors.textSecondary }]}>{notification.chip}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.notificationTrailing}>
        <View style={styles.notificationTrailingTop}>
          <Text numberOfLines={1} style={[styles.notificationTime, { color: colors.textSecondary }]}>{notification.time}</Text>
          <MoreVertical color={colors.textSecondary} size={20} strokeWidth={2.1} />
        </View>
        {unread ? <View style={[styles.notificationUnreadDot, { backgroundColor: colors.primaryDark }]} /> : null}
      </View>
    </Pressable>
  );
}

function NotificationAvatarView({ notification }: { notification: NotificationItem }) {
  const { avatar, badge } = notification;
  const BadgeIcon = badge.icon;
  const AvatarIcon = avatar.type === 'icon' ? avatar.icon : null;

  return (
    <View style={styles.notificationAvatarWrap}>
      {avatar.type === 'image' ? (
        <Image source={avatar.source} style={styles.notificationAvatarImage} resizeMode="cover" />
      ) : avatar.type === 'text' ? (
        <View style={[styles.notificationAvatarTextBox, { backgroundColor: avatar.background }]}>
          <Text style={[styles.notificationAvatarText, { color: avatar.color }]}>{avatar.label}</Text>
        </View>
      ) : (
        <View style={[styles.notificationAvatarTextBox, { backgroundColor: avatar.background }]}>
          {AvatarIcon ? <AvatarIcon color={avatar.color} fill={avatar.fill ?? 'none'} size={34} strokeWidth={1.9} /> : null}
        </View>
      )}
      <View style={[styles.notificationBadgeIcon, { backgroundColor: badge.background }]}>
        <BadgeIcon color={badge.color} fill={badge.fill ?? 'none'} size={17} strokeWidth={2.2} />
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  screen: { flex: 1 },
  notificationContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: 36,
  },
  notificationHeaderBlock: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  notificationEmpty: {
    marginTop: spacing.md,
  },
});
