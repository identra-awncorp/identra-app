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
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { assetManifest } from '../../../assets/assetManifest';
import type { AppColors } from '../../../theme';
import { border, componentSize, palette, radius, spacing, touchTarget, typography } from '../../../theme';
import type { AppSettings, Credential, PersonalInfo, SmartContractFeedPost } from '../../../types';
import {
  notificationItems,
  notificationTabs,
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
  ScreenScroll,
  SectionHeading,
  StatusPill,
} from '../../../components/AppUiPrimitives';
import { styles } from '../../shared/DetailScreenSharedStyles';
import { SettingToggle } from '../../settings/SettingToggle';

const verifiedBadgeIcon = assetManifest.badges.verified;
export function SecurityScreen({
  colors,
  settings,
  onBack,
  onSettings,
}: {
  colors: AppColors;
  settings: AppSettings;
  onBack: () => void;
  onSettings: (settings: Partial<AppSettings>) => void;
}) {
  return (
    <ScreenScroll id="screen-security" colors={colors}>
      <AppHeader colors={colors} title="Bảo mật" onBack={onBack} />
      <Card colors={colors}>
        <View style={styles.securityScore}>
          <View style={styles.securityScoreIcon}>
            <ShieldCheck color={colors.success} size={34} />
          </View>
          <View style={styles.securityMain}>
            <Text style={[styles.securityTitle, { color: colors.text }]}>Ví đang được bảo vệ</Text>
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>Các khóa riêng tư được lưu an toàn trên thiết bị.</Text>
          </View>
        </View>
      </Card>
      <SectionHeading colors={colors} title="Quyền riêng tư" />
      <Card colors={colors} style={styles.settingsCard}>
        <SettingToggle
          colors={colors}
          icon={ShieldCheck}
          title="Ẩn dữ liệu nhạy cảm"
          description="Che thông tin quan trọng theo mặc định"
          value={settings.hideSensitiveData}
          onValueChange={(value: boolean) => onSettings({ hideSensitiveData: value })}
        />
      </Card>
    </ScreenScroll>
  );
}
