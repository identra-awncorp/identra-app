import { ChevronRight, MessageCircle, X } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { AppColors } from '../../theme';
import {
  createActions,
  createSuggestedContacts,
  type CreateActionConfig,
  type CreateSuggestedContact,
} from './ChatListData';
import { styles } from './ChatListStyles';

export function CreateNewScreen({
  bottomInset,
  colors,
  onClose,
  onOpenConversation,
}: {
  bottomInset: number;
  colors: AppColors;
  onClose: () => void;
  onOpenConversation: (conversationId: string) => void;
}) {
  const openSuggestedContact = (contact: CreateSuggestedContact) => {
    onClose();
    onOpenConversation(contact.id);
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.createScreen}
      contentContainerStyle={[styles.createContent, { paddingBottom: Math.max(bottomInset, 18) + 18 }]}
    >
      <View style={styles.createHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đóng tạo mới"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [styles.createCloseButton, { opacity: pressed ? 0.62 : 1 }]}
        >
          <X color={colors.text} size={29} strokeWidth={2} />
        </Pressable>
        <View style={styles.createHeaderCopy}>
          <Text style={[styles.createTitle, { color: colors.text }]}>Tạo mới</Text>
          <Text style={[styles.createSubtitle, { color: colors.textSecondary }]}>
            Bắt đầu cuộc trò chuyện hoặc tác vụ mới
          </Text>
        </View>
        <View style={styles.createHeaderSpacer} />
      </View>

      <View style={[styles.createActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {createActions.map((action, index) => (
          <CreateActionRow
            key={action.id}
            action={action}
            colors={colors}
            showDivider={index < createActions.length - 1}
          />
        ))}
      </View>

      <View style={styles.createSectionCopy}>
        <Text style={[styles.createSectionTitle, { color: colors.text }]}>Liên hệ gợi ý</Text>
        <Text style={[styles.createSectionDescription, { color: colors.textSecondary }]}>
          Gần đây và thường xuyên liên hệ
        </Text>
      </View>

      <View style={[styles.suggestedContactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {createSuggestedContacts.map((contact, index) => (
          <SuggestedContactRow
            key={contact.id}
            colors={colors}
            contact={contact}
            onPress={() => openSuggestedContact(contact)}
            showDivider={index < createSuggestedContacts.length - 1}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function CreateActionRow({
  action,
  colors,
  showDivider,
}: {
  action: CreateActionConfig;
  colors: AppColors;
  showDivider: boolean;
}) {
  const Icon = action.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.title}
      style={({ pressed }) => [styles.createActionRow, { opacity: pressed ? 0.68 : 1 }]}
    >
      <View style={[styles.createActionIconBox, { backgroundColor: action.iconBackground }]}>
        <Icon color={action.iconColor} size={31} strokeWidth={2.1} />
      </View>
      <View
        style={[
          styles.createActionMain,
          { borderBottomColor: showDivider ? colors.border : 'transparent' },
        ]}
      >
        <Text numberOfLines={1} style={[styles.createActionTitle, { color: colors.text }]}>
          {action.title}
        </Text>
        <Text numberOfLines={1} style={[styles.createActionDescription, { color: colors.textSecondary }]}>
          {action.description}
        </Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={23} strokeWidth={2.1} />
    </Pressable>
  );
}

function SuggestedContactRow({
  colors,
  contact,
  onPress,
  showDivider,
}: {
  colors: AppColors;
  contact: CreateSuggestedContact;
  onPress: () => void;
  showDivider: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mở trò chuyện với ${contact.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.suggestedContactRow, { opacity: pressed ? 0.68 : 1 }]}
    >
      <View style={styles.suggestedAvatarWrap}>
        <Image source={contact.avatarSource} style={styles.suggestedAvatar} />
        <View
          style={[
            styles.suggestedOnlineDot,
            { backgroundColor: contact.online ? '#22C55E' : '#B8C0D4', borderColor: colors.surface },
          ]}
        />
      </View>
      <View
        style={[
          styles.suggestedContactMain,
          { borderBottomColor: showDivider ? colors.border : 'transparent' },
        ]}
      >
        <View style={styles.suggestedContactCopy}>
          <Text numberOfLines={1} style={[styles.suggestedContactName, { color: colors.text }]}>
            {contact.name}
          </Text>
          <Text numberOfLines={1} style={[styles.suggestedContactMeta, { color: colors.textSecondary }]}>
            {contact.meta}
          </Text>
        </View>
        <View style={styles.suggestedChatButton}>
          <MessageCircle color={colors.primaryDark} size={24} strokeWidth={1.9} />
        </View>
      </View>
    </Pressable>
  );
}
