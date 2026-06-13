import { useState } from 'react';
import { Keyboard, View } from 'react-native';
import type { AppColors } from '../theme';
import { ChatActionSheet } from './chat/ChatActionSheet';
import { ChatConversation } from './chat/ChatConversation';

export function ChatScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const openActionSheet = () => {
    Keyboard.dismiss();
    requestAnimationFrame(() => setActionSheetOpen(true));
  };

  return (
    <View
      nativeID="screen-chat"
      testID="screen-chat"
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      <ChatConversation colors={colors} onBack={onBack} onOpenActionSheet={openActionSheet} />
      <ChatActionSheet colors={colors} onClose={() => setActionSheetOpen(false)} visible={actionSheetOpen} />
    </View>
  );
}
