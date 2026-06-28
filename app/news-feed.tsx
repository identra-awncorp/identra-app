import { useRouter } from 'expo-router';

import { NewsFeedScreen } from '@/screens/news-feed';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function NewsFeedRoute() {
  const router = useRouter();
  const {
    colors,
    newsFeedChromeProgress,
    newsFeedScrollY,
    openSideMenu,
    setReturnScreen,
  } = useAppRouterState();

  return (
    <NewsFeedScreen
      colors={colors}
      overlayProgress={newsFeedChromeProgress}
      scrollY={newsFeedScrollY}
      onOpenCompose={() => router.push('/compose-post')}
      onOpenLiveStream={() => router.push('/live-stream')}
      onOpenMenu={openSideMenu}
      onOpenNotifications={() => {
        setReturnScreen('news-feed');
        router.push('/notifications');
      }}
      onOpenSearch={() => router.push('/news-feed-search')}
      onOpenSmartContractDetail={(post) => {
        router.push({ pathname: '/smart-contracts/[postId]', params: { postId: post.id } });
      }}
    />
  );
}
