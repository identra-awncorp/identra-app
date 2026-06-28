import { useRouter } from 'expo-router';

import { LiveStreamScreen } from '@/screens/news-feed';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function LiveStreamRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <LiveStreamScreen colors={colors} onBack={() => router.replace('/news-feed')} />;
}
