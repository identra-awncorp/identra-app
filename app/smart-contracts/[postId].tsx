import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { demoSmartContractPosts } from '@/data/demo/newsFeedDemoData';
import { SmartContractDetailScreen } from '@/screens/news-feed';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SmartContractDetailRoute() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId?: string | string[] }>();
  const { colors } = useAppRouterState();
  const requestedPostId = Array.isArray(postId) ? postId[0] : postId;
  const post = demoSmartContractPosts.find((item) => item.id === requestedPostId);

  if (!post) return <Redirect href="/news-feed" />;

  return <SmartContractDetailScreen colors={colors} post={post} onBack={() => router.replace('/news-feed')} />;
}
