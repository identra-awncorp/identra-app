import { useRouter } from 'expo-router';

import { ChatListScreen } from '@/screens/chat-list';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ChatListRoute() {
  const router = useRouter();
  const { colors, openSideMenu, setSelectedChatId } = useAppRouterState();

  return (
    <ChatListScreen
      colors={colors}
      onOpenConversation={(conversationId) => {
        setSelectedChatId(conversationId);
        router.push('/chat');
      }}
      onOpenMenu={openSideMenu}
    />
  );
}
