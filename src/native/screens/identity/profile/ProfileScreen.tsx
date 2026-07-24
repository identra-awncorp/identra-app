import { useState } from 'react';
import {
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';
import type { AppColors } from '../../../theme';
import { palette } from '../../../theme';
import type { PersonalInfo } from '../../../types';
import { useI18n } from '../../../i18n';
import { formatDidForDisplay } from '../../../domain/credentials/credentialDisplay';


import {
  AppHeader,
  Card,
  PrimaryButton,
  ScreenScroll,
} from '../../../components/AppUiPrimitives';
import { styles } from '../../shared/DetailScreenSharedStyles';

export function ProfileScreen({
  colors,
  compactDid = false,
  profile,
  onBack,
  onSave,
}: {
  colors: AppColors;
  compactDid?: boolean;
  profile: PersonalInfo;
  onBack: () => void;
  onSave: (profile: PersonalInfo) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(profile);
  const fields: { key: keyof PersonalInfo; label: string; icon: typeof UserRound; keyboard?: 'email-address' | 'phone-pad' }[] = [
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
        <Text style={[styles.profileDid, { color: colors.textSecondary }]}>{formatDidForDisplay(draft.did, compactDid)}</Text>
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
