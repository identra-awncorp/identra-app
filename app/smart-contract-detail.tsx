import { Redirect, useRouter } from 'expo-router';

import { SmartContractDetailScreen } from '@/screens/news-feed';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SmartContractDetailRoute() {
  const router = useRouter();
  const { colors, selectedSmartContractPost } = useAppRouterState();

  if (!selectedSmartContractPost) return <Redirect href="/news-feed" />;

  return (
    <SmartContractDetailScreen
      colors={colors}
      post={selectedSmartContractPost}
      onBack={() => router.replace('/news-feed')}
    />
  );
}
