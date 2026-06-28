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
import { useI18n } from '../../../i18n';
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

const verifiedBadgeIcon = assetManifest.badges.verified;
export function ProfileScreen({
  colors,
  profile,
  onBack,
  onSave,
}: {
  colors: AppColors;
  profile: PersonalInfo;
  onBack: () => void;
  onSave: (profile: PersonalInfo) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(profile);
  const fields: Array<{ key: keyof PersonalInfo; label: string; icon: typeof UserRound; keyboard?: 'email-address' | 'phone-pad' }> = [
    { key: 'fullName', label: t('identity.profile.fields.fullName'), icon: UserRound },
    { key: 'dob', label: t('identity.profile.fields.dob'), icon: UserRound },
    { key: 'nationalId', label: t('identity.profile.fields.nationalId'), icon: LockKeyhole },
    { key: 'email', label: t('identity.profile.fields.email'), icon: Mail, keyboard: 'email-address' },
    { key: 'phone', label: t('identity.profile.fields.phone'), icon: Phone, keyboard: 'phone-pad' },
    { key: 'address', label: t('identity.profile.fields.address'), icon: MapPin },
  ];

  return (
    <ScreenScroll id="screen-personal-profile" colors={colors}>
      <AppHeader colors={colors} title={t('identity.profile.title')} onBack={onBack} />
      <View style={styles.profileHero}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.primaryDark }]}>
          <UserRound color={palette.white} size={38} />
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{draft.fullName}</Text>
        <Text style={[styles.profileDid, { color: colors.textSecondary }]}>{draft.did}</Text>
      </View>
      <Card colors={colors} style={styles.formCard}>
        {fields.map(({ key, label, icon: Icon, keyboard }) => (
          <View key={key} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
              <Icon color={colors.textSecondary} size={18} />
              <TextInput
                value={draft[key]}
                onChangeText={(value) => setDraft((current) => ({ ...current, [key]: value }))}
                keyboardType={keyboard}
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>
        ))}
      </Card>
      <PrimaryButton colors={colors} title={t('identity.profile.save')} onPress={() => onSave(draft)} />
    </ScreenScroll>
  );
}
