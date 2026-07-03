import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { paymentOfferText, paymentT } from '../paymentI18n';
import type { Offer } from '../paymentTypes';
import { PaymentSectionHeader } from './PaymentSectionHeader';
import { paymentHomeStyles as styles } from './paymentHomeStyles';
import { paymentSurfaces } from './paymentSurfaces';

export function OfferGrid({
  colors,
  offers,
  onAction,
  onMore,
  width,
}: {
  colors: AppColors;
  offers: Offer[];
  onAction: (offer: Offer) => void;
  onMore?: () => void;
  width: number;
}) {
  const { t } = useI18n();

  return (
    <>
      <PaymentSectionHeader
        title={paymentT(t, 'home.sections.offers')}
        action={onMore ? paymentT(t, 'home.sections.viewMore') : undefined}
        colors={colors}
        onAction={onMore}
      />
      <View style={styles.offerGrid}>
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            colors={colors}
            width={width}
            onPress={() => onAction(offer)}
          />
        ))}
      </View>
    </>
  );
}

function OfferCard({
  colors,
  offer,
  onPress,
  width,
}: {
  colors: AppColors;
  offer: Offer;
  onPress: () => void;
  width: number;
}) {
  const { t } = useI18n();
  const Icon = offer.icon;
  const title = paymentOfferText(t, offer, 'title');
  const description = paymentOfferText(t, offer, 'description');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.offerCard,
        paymentSurfaces.card,
        {
          width,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <LinearGradient colors={offer.gradient} style={styles.offerVisual}>
        <View style={styles.offerBubbleLarge} />
        <View style={styles.offerBubbleSmall} />
        <View style={styles.offerIconPlate}>
          <Icon color={colors.primaryDark} size={27} strokeWidth={1.9} />
        </View>
      </LinearGradient>
      <Text numberOfLines={2} style={[styles.offerTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text numberOfLines={2} style={[styles.offerDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </Pressable>
  );
}
