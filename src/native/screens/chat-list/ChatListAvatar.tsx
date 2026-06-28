import { LinearGradient } from 'expo-linear-gradient';
import { UserRound } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';
import { AppLogo } from '../../components/AppLogo';
import { demoAvatars } from '../../data/demo/chatDemoData';
import type { ChatPreview } from '../../data/demo/chatDemoData';
import type { AppColors } from '../../theme';
import { verifiedBadgeIcon } from './ChatListData';
import { styles } from './ChatListStyles';

export function VerifiedBadgeIcon({ size = 20 }: { size?: number }) {
  return <Image source={verifiedBadgeIcon} style={{ width: size, height: size }} resizeMode="contain" />;
}

export function ChatAvatar({ colors, item, size }: { colors: AppColors; item: ChatPreview; size: number }) {
  if (item.avatarSource) {
    return <Image source={item.avatarSource} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  if (item.avatar === 'photo') {
    return <Image source={demoAvatars.catFlower} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  if (item.avatar === 'identra') {
    return (
      <View
        style={[
          styles.identraAvatar,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceMuted },
        ]}
      >
        <AppLogo size={Math.floor(size * 0.62)} />
      </View>
    );
  }

  if (item.avatar === 'group') {
    return (
      <LinearGradient
        colors={['#1F2937', item.accent ?? '#355CFF']}
        style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={[styles.groupInitials, { fontSize: size * 0.31 }]}>{item.initials}</Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.initialAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: item.accent ?? colors.surfaceMuted,
        },
      ]}
    >
      <UserRound color={colors.primaryDark} size={size * 0.42} strokeWidth={1.8} />
      <Text style={[styles.initials, { color: colors.text, fontSize: size * 0.24 }]}>{item.initials}</Text>
    </View>
  );
}
