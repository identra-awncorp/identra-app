import { useCallback, useEffect, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';

import {
  paymentCards,
  paymentOffers,
  promoBanners,
  quickActions,
  suggestionActions,
} from '../../data/demo/paymentHomeDemoData';
import { ScreenScroll } from '../../components/AppUiPrimitives';
import { useI18n } from '../../i18n';
import type { AppColors } from '../../theme';
import { layout, spacing } from '../../theme';
import { OfferGrid } from './components/OfferGrid';
import { PaymentCardCarousel } from './components/PaymentCardCarousel';
import { PaymentCvvSheet } from './components/PaymentCvvSheet';
import { PaymentHeader } from './components/PaymentHeader';
import { PromoCarousel } from './components/PromoCarousel';
import { QuickAccessGrid } from './components/QuickAccessGrid';
import { SuggestionRail } from './components/SuggestionRail';
import { paymentHomeStyles as styles } from './components/paymentHomeStyles';
import { paymentT } from './paymentI18n';
import { loadPaymentBalanceVisible, savePaymentBalanceVisible } from './paymentPreferences';
import type { Offer, PaymentAction, PaymentCard, PromoBanner } from './paymentTypes';

export function PaymentScreen({
  colors,
  onManageCard,
  onOpenCardDetail,
  onOpenMenu,
  onOpenNotifications,
  onOpenOffer,
  onOpenPromo,
  onOpenQuickAction,
  onOpenSearch,
  onOpenSuggestion,
}: {
  colors: AppColors;
  onManageCard: (card: PaymentCard) => void;
  onOpenCardDetail: (card: PaymentCard) => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenOffer: (offer: Offer) => void;
  onOpenPromo: (banner: PromoBanner) => void;
  onOpenQuickAction: (action: PaymentAction) => void;
  onOpenSearch: () => void;
  onOpenSuggestion: (action: PaymentAction) => void;
}) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const [cvvCard, setCvvCard] = useState<PaymentCard | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const screenWidth = Math.max(layout.minWidth, width);
  const contentWidth = screenWidth - layout.screenPadding * 2;
  const cardPageWidth = contentWidth + spacing.md;
  const heroHeight = Math.max(272, Math.min(306, contentWidth * 0.78));
  const quickItemWidth = Math.max(76, (contentWidth - spacing.md * 3) / 4);
  const quickTrackWidth = quickItemWidth * 5 + spacing.md * 4;
  const suggestionItemWidth = Math.max(76, (contentWidth - spacing.md * 3.5) / 4.5);
  const bannerPageWidth = contentWidth + spacing.md;
  const offerCardWidth = (contentWidth - spacing.md) / 2;

  const showCopiedCardNumber = (card: PaymentCard) => {
    Alert.alert(paymentT(t, 'home.cardCopied.title'), paymentT(t, 'home.cardCopied.description', { brand: card.brand, last4: card.cardNumber.slice(-4) }));
  };

  useEffect(() => {
    let mounted = true;

    loadPaymentBalanceVisible().then((visible) => {
      if (mounted) setBalanceVisible(visible);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const updateBalanceVisible = useCallback((visible: boolean) => {
    setBalanceVisible(visible);
    void savePaymentBalanceVisible(visible).catch(() => undefined);
  }, []);

  return (
    <>
      <ScreenScroll id="screen-payment" colors={colors} contentStyle={styles.screenContent}>
        <PaymentHeader
          colors={colors}
          onOpenMenu={onOpenMenu}
          onOpenSearch={onOpenSearch}
          onOpenNotifications={onOpenNotifications}
        />

        <PaymentCardCarousel
          balanceVisible={balanceVisible}
          cards={paymentCards}
          colors={colors}
          cardWidth={contentWidth}
          cardHeight={heroHeight}
          pageWidth={cardPageWidth}
          onBalanceVisibleChange={updateBalanceVisible}
          onCopyCardNumber={showCopiedCardNumber}
          onOpenCardDetail={onOpenCardDetail}
          onManageCard={onManageCard}
          onRequestCvv={setCvvCard}
        />

        <QuickAccessGrid
          actions={quickActions}
          colors={colors}
          itemWidth={quickItemWidth}
          trackWidth={quickTrackWidth}
          onAction={onOpenQuickAction}
          onEdit={() => Alert.alert(paymentT(t, 'home.editQuick.title'), paymentT(t, 'home.editQuick.description'))}
        />

        <PromoCarousel
          banners={promoBanners}
          colors={colors}
          width={contentWidth}
          pageWidth={bannerPageWidth}
          onAction={onOpenPromo}
        />

        <SuggestionRail
          actions={suggestionActions}
          colors={colors}
          itemWidth={suggestionItemWidth}
          onAction={onOpenSuggestion}
        />

        <OfferGrid
          offers={paymentOffers}
          colors={colors}
          width={offerCardWidth}
          onAction={onOpenOffer}
        />
      </ScreenScroll>
      <PaymentCvvSheet card={cvvCard} colors={colors} onClose={() => setCvvCard(null)} />
    </>
  );
}
