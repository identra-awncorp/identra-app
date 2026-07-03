import { useCallback, useEffect, useState } from 'react';
import { Alert, useWindowDimensions, View } from 'react-native';

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
  const heroHeight = Math.max(286, Math.min(318, contentWidth * 0.82));
  const quickItemWidth = Math.max(70, (contentWidth - spacing.sm * 3) / 4);
  const quickColumnCount = Math.ceil(quickActions.length / 2);
  const quickTrackWidth = quickItemWidth * quickColumnCount + spacing.sm * Math.max(0, quickColumnCount - 1);
  const suggestionItemWidth = Math.max(78, (contentWidth - spacing.md * 3.5) / 4.5);
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
    <View nativeID="screen-payment" testID="screen-payment" style={[styles.screen, { backgroundColor: colors.background }]}>
      <PaymentHeader
        colors={colors}
        onOpenMenu={onOpenMenu}
        onOpenSearch={onOpenSearch}
        onOpenNotifications={onOpenNotifications}
      />

      <ScreenScroll id="screen-payment-content" colors={colors} contentStyle={styles.screenContent} includeTopInset={false}>
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
          onMore={() => onOpenSuggestion(suggestionActions[0])}
        />

        <OfferGrid
          offers={paymentOffers}
          colors={colors}
          width={offerCardWidth}
          onAction={onOpenOffer}
          onMore={() => onOpenOffer(paymentOffers[0])}
        />
      </ScreenScroll>
      <PaymentCvvSheet card={cvvCard} colors={colors} onClose={() => setCvvCard(null)} />
    </View>
  );
}
