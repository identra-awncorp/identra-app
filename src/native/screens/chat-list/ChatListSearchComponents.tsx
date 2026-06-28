import { ChevronRight, Plus } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { type SearchIcon, type SearchMiniApp, type SearchPerson } from '../../data/demo/chatListDemoData';
import { VerifiedBadgeIcon } from './ChatListAvatar';
import { styles } from './ChatListStyles';

export function SearchTab({
  active,
  colors,
  icon: Icon,
  label,
  onPress,
}: {
  active: boolean;
  colors: AppColors;
  icon: SearchIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.searchTab,
        {
          borderBottomColor: active ? colors.primaryDark : 'transparent',
          opacity: pressed ? 0.68 : 1,
        },
      ]}
    >
      <Icon
        color={active ? colors.primaryDark : colors.textSecondary}
        fill="none"
        size={20}
        strokeWidth={2}
      />
      <Text style={[styles.searchTabLabel, { color: active ? colors.primaryDark : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SearchSection({
  actionLabel,
  children,
  colors,
  empty,
  emptyText,
  title,
}: {
  actionLabel: string;
  children: ReactNode;
  colors: AppColors;
  empty: boolean;
  emptyText: string;
  title: string;
}) {
  return (
    <View style={styles.searchSection}>
      <View style={styles.searchSectionHeader}>
        <Text style={[styles.searchSectionTitle, { color: colors.text }]}>{title}</Text>
        <Pressable accessibilityRole="button" style={styles.searchSectionAction}>
          <Text style={[styles.searchSectionActionText, { color: colors.primaryDark }]}>{actionLabel}</Text>
          <ChevronRight color={colors.primaryDark} size={18} strokeWidth={2.3} />
        </Pressable>
      </View>
      {empty ? (
        <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.searchEmptyText, { color: colors.textSecondary }]}>{emptyText}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

export function ConnectedPersonRow({
  colors,
  person,
  showDivider,
}: {
  colors: AppColors;
  person: SearchPerson;
  showDivider: boolean;
}) {
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('chatList.accessibility.openConnection', { name: person.name })}
      style={({ pressed }) => [styles.connectedPersonRow, { opacity: pressed ? 0.68 : 1 }]}
    >
      <View style={styles.connectedPersonAvatarWrap}>
        <Image source={person.avatarSource} style={styles.connectedPersonAvatar} />
        {person.online ? <View style={[styles.connectedPersonOnline, { borderColor: colors.surface }]} /> : null}
      </View>
      <View
        style={[
          styles.connectedPersonMain,
          { borderBottomColor: showDivider ? colors.border : 'transparent' },
        ]}
      >
        <Text numberOfLines={1} style={[styles.connectedPersonName, { color: colors.text }]}>
          {person.name}
        </Text>
        <Text numberOfLines={1} style={[styles.connectedPersonHandle, { color: colors.textSecondary }]}>
          {person.handle}
        </Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={22} strokeWidth={2.1} />
    </Pressable>
  );
}

export function MiniAppRow({
  app,
  colors,
  showDivider,
}: {
  app: SearchMiniApp;
  colors: AppColors;
  showDivider: boolean;
}) {
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('chatList.accessibility.openMiniApp', { name: app.name })}
      style={({ pressed }) => [styles.miniAppRow, { opacity: pressed ? 0.68 : 1 }]}
    >
      <View style={[styles.miniAppLogo, { backgroundColor: app.backgroundColor }]}>
        {app.logoSource ? (
          <Image source={app.logoSource} style={styles.miniAppLogoImage} />
        ) : (
          <Text style={[styles.miniAppLogoText, { color: app.textColor }]}>{app.logoText}</Text>
        )}
      </View>
      <View
        style={[
          styles.miniAppMain,
          { borderBottomColor: showDivider ? colors.border : 'transparent' },
        ]}
      >
        <View style={styles.miniAppTitleRow}>
          <Text numberOfLines={1} style={[styles.miniAppName, { color: colors.text }]}>
            {app.name}
          </Text>
          <VerifiedBadgeIcon size={20} />
        </View>
        <Text numberOfLines={1} style={[styles.miniAppCategory, { color: colors.textSecondary }]}>
          {app.category}
        </Text>
        <Text numberOfLines={1} style={[styles.miniAppDescription, { color: colors.textSecondary }]}>
          {app.description}
        </Text>
      </View>
      <View style={[styles.miniAppAddButton, { borderColor: colors.border }]}>
        <Plus color={colors.primaryDark} size={24} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}
