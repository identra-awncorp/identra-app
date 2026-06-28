import { useRouter } from 'expo-router';

import { ComposePostScreen } from '@/screens/news-feed';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ComposePostRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return (
    <ComposePostScreen
      authorName="Minh Khoa"
      colors={colors}
      onClose={() => router.replace('/news-feed')}
      onSubmit={() => router.replace('/news-feed')}
    />
  );
}
