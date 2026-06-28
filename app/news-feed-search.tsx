import { useRouter } from 'expo-router';

import { NewsFeedSearchScreen } from '@/screens/news-feed';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function NewsFeedSearchRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <NewsFeedSearchScreen colors={colors} onBack={() => router.replace('/news-feed')} />;
}
