import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Copy, Eye, EyeOff, LockKeyhole, Settings, Wifi } from 'lucide-react-native';
import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';

import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { palette, spacing } from '../../../theme';
import { paymentCardText, paymentT } from '../paymentI18n';
import type { PaymentCard } from '../paymentTypes';
import { PaymentPaginationDots } from './PaymentPaginationDots';
import { paymentHomeStyles as styles } from './paymentHomeStyles';
import { paymentSurfaces } from './paymentSurfaces';

export function PaymentCardCarousel({
  balanceVisible,
  cardHeight,
  cardWidth,
  cards,
  colors,
  onCopyCardNumber,
  onOpenCardDetail,
  onManageCard,
  onBalanceVisibleChange,
  onRequestCvv,
  pageWidth,
}: {
  balanceVisible: boolean;
  cardHeight: number;
  cardWidth: number;
  cards: PaymentCard[];
  colors: AppColors;
  onBalanceVisibleChange: (visible: boolean) => void;
  onCopyCardNumber: (card: PaymentCard) => void;
  onOpenCardDetail: (card: PaymentCard) => void;
  onManageCard: (card: PaymentCard) => void;
  onRequestCvv: (card: PaymentCard) => void;
  pageWidth: number;
}) {
  const { t } = useI18n();
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const handleMomentum = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveCardIndex(Math.min(cards.length - 1, Math.max(0, index)));
  };

  return (
    <View>
      <ScrollView
        horizontal
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentum}
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth}
        snapToAlignment="start"
        contentContainerStyle={styles.heroScroller}
      >
        {cards.map((card) => (
          <View
            key={card.id}
            style={[
              styles.heroShadowFrame,
              paymentSurfaces.hero,
              {
                width: cardWidth,
                height: cardHeight,
                marginRight: spacing.md,
                borderColor: 'rgba(255, 255, 255, 0.14)',
              },
            ]}
          >
            <LinearGradient
              colors={card.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.cardAuraLarge} />
              <View style={styles.cardAuraSmall} />
              <View style={styles.cardSweep} />

              <View style={styles.cardTopRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={paymentT(t, 'home.card.manageCard')}
                  onPress={() => onManageCard(card)}
                  style={({ pressed }) => [styles.manageButton, { opacity: pressed ? 0.72 : 1 }]}
                >
                  <Settings color={palette.white} size={20} strokeWidth={2} />
                  <Text style={styles.manageButtonText}>{paymentT(t, 'home.card.manage')}</Text>
                </Pressable>
                <View style={styles.cardBrandStack}>
                  <Text style={styles.cardBrand}>{card.brand}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={paymentT(t, 'home.card.viewDetails')}
                    onPress={() => onOpenCardDetail(card)}
                    style={({ pressed }) => [styles.cardDetailButton, { opacity: pressed ? 0.72 : 1 }]}
                  >
                    <Text style={styles.cardDetailText}>{paymentT(t, 'home.card.detail')}</Text>
                    <ChevronRight color={palette.white} size={14} strokeWidth={2.4} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.cardMiddle}>
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <View style={styles.chipLineHorizontal} />
                    <View style={styles.chipLineVertical} />
                  </View>
                  <Wifi color={palette.white} size={26} strokeWidth={2.4} style={styles.contactlessIcon} />
                </View>
                <View style={styles.cardNumberRow}>
                  <Text adjustsFontSizeToFit numberOfLines={1} style={styles.cardNumber}>
                    {card.cardNumber}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={paymentT(t, 'home.card.copyCardNumber')}
                    onPress={() => onCopyCardNumber(card)}
                    hitSlop={8}
                  >
                    <Copy color="rgba(255,255,255,0.9)" size={18} strokeWidth={2} />
                  </Pressable>
                </View>
                <View style={styles.cardMetaRow}>
                  <View style={styles.expiryBlock}>
                    <Text style={styles.cardMetaLabel}>{paymentT(t, 'home.card.validThru')}</Text>
                    <Text style={styles.expiryText}>{card.expiry}</Text>
                  </View>
                  <View style={styles.holderBlock}>
                    <Text style={styles.cardMetaLabel}>{paymentT(t, 'home.card.cardHolder')}</Text>
                    <Text numberOfLines={1} style={styles.holderText}>
                      {card.holder}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardBottomRow}>
                <View style={styles.balanceBlock}>
                  <View style={styles.balanceLabelRow}>
                    <Text numberOfLines={1} style={styles.balanceLabel}>
                      {paymentCardText(t, card, 'balanceLabel')}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={balanceVisible ? paymentT(t, 'home.card.hideBalance') : paymentT(t, 'home.card.showBalance')}
                      onPress={() => onBalanceVisibleChange(!balanceVisible)}
                      hitSlop={8}
                    >
                      {balanceVisible ? (
                        <Eye color={palette.white} size={18} strokeWidth={2.2} />
                      ) : (
                        <EyeOff color={palette.white} size={18} strokeWidth={2.2} />
                      )}
                    </Pressable>
                  </View>
                  <View style={styles.balanceValueRow}>
                    <Text adjustsFontSizeToFit numberOfLines={1} style={styles.balanceValue}>
                      {balanceVisible ? card.balance : '*** *** ***'}
                    </Text>
                    <Text style={styles.balanceCurrency}>{card.currency}</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={paymentT(t, 'home.card.getCvvCode')}
                  onPress={() => onRequestCvv(card)}
                  style={({ pressed }) => [styles.cvvButton, { opacity: pressed ? 0.72 : 1 }]}
                >
                  <LockKeyhole color={palette.white} size={18} strokeWidth={2.2} />
                  <Text numberOfLines={1} style={styles.cvvButtonText}>
                    {paymentT(t, 'home.card.getCvvCode')}
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
      <PaymentPaginationDots count={cards.length} activeIndex={activeCardIndex} colors={colors} />
    </View>
  );
}
