import { useRouter } from 'expo-router';

import { ChatScreen } from '@/screens/chat';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ChatRoute() {
  const router = useRouter();
  const { colors, selectedChatId } = useAppRouterState();

  return <ChatScreen colors={colors} conversationId={selectedChatId} onBack={() => router.replace('/chat-list')} />;
}
