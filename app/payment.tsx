import { useRouter, type Href } from 'expo-router';

import { PaymentScreen } from '@/screens/payment';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useAppStore } from '@/store';

export default function PaymentRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, openSideMenu } = useAppRouterState();

  const openPaymentFlow = (flow: string) => {
    if (flow === 'transfer') {
      router.push('/payment-transfer-recipient' as Href);
      return;
    }

    if (flow === 'receive') {
      router.push('/payment-receive' as Href);
      return;
    }

    if (flow === 'phone') {
      router.push('/payment-phone' as Href);
      return;
    }

    if (flow === 'bill') {
      router.push('/payment-bill' as Href);
      return;
    }

    if (flow === 'history') {
      router.push('/payment-history' as Href);
      return;
    }

    if (flow === 'utilities') {
      router.push({ pathname: '/payment-bill', params: { category: 'electric' } } as unknown as Href);
      return;
    }

    router.push({ pathname: '/payment-flow', params: { flow } } as unknown as Href);
  };

  const openPaymentExplore = (section: 'suggestion' | 'offer', itemId: string) => {
    router.push({ pathname: '/payment-explore-detail', params: { section, itemId } } as unknown as Href);
  };

  return (
    <PaymentScreen
      colors={colors}
      onOpenMenu={openSideMenu}
      onOpenSearch={() => router.push('/payment-search' as Href)}
      onOpenNotifications={() => router.push('/payment-notifications' as Href)}
      onOpenCardDetail={(card) => router.push({ pathname: '/payment-account-detail', params: { cardId: card.id } } as unknown as Href)}
      onManageCard={(card) => router.push({ pathname: '/payment-card-manage', params: { cardId: card.id } } as unknown as Href)}
      onOpenQuickAction={(action) => openPaymentFlow(action.id)}
      onOpenSuggestion={(action) => openPaymentExplore('suggestion', action.id)}
      onOpenOffer={(offer) => openPaymentExplore('offer', offer.id)}
      paymentSettings={store.settings.flowSettings.payment}
    />
  );
}
