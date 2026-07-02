import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Percent, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';

import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { palette } from '../../../theme';
import { paymentPromoText } from '../paymentI18n';
import type { PromoBanner } from '../paymentTypes';
import { PaymentPaginationDots } from './PaymentPaginationDots';
import { paymentHomeStyles as styles } from './paymentHomeStyles';
import { paymentSurfaces } from './paymentSurfaces';

export function PromoCarousel({
  banners,
  colors,
  onAction,
  pageWidth,
  width,
}: {
  banners: PromoBanner[];
  colors: AppColors;
  onAction: (banner: PromoBanner) => void;
  pageWidth: number;
  width: number;
}) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const handleMomentum = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveBannerIndex(Math.min(banners.length - 1, Math.max(0, index)));
  };

  return (
    <>
      <ScrollView
        horizontal
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentum}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={pageWidth}
        contentContainerStyle={styles.bannerScroller}
      >
        {banners.map((banner) => (
          <PromoCard
            key={banner.id}
            banner={banner}
            width={width}
            colors={colors}
            onPress={() => onAction(banner)}
          />
        ))}
      </ScrollView>
      <PaymentPaginationDots count={banners.length} activeIndex={activeBannerIndex} colors={colors} compact />
    </>
  );
}

function PromoCard({
  banner,
  colors,
  onPress,
  width,
}: {
  banner: PromoBanner;
  colors: AppColors;
  onPress: () => void;
  width: number;
}) {
  const { t } = useI18n();
  const Icon = banner.icon;
  const title = paymentPromoText(t, banner, 'title');
  const description = paymentPromoText(t, banner, 'description');
  const action = paymentPromoText(t, banner, 'action');

  return (
    <LinearGradient
      colors={banner.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.promoCard, paymentSurfaces.card, { width, borderColor: colors.border }]}
    >
      <View style={styles.promoCopy}>
        <Text numberOfLines={2} style={styles.promoTitle}>
          {title}
        </Text>
        <Text numberOfLines={3} style={styles.promoDescription}>
          {description}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onPress}
          style={({ pressed }) => [styles.promoButton, { opacity: pressed ? 0.72 : 1 }]}
        >
          <Text style={styles.promoButtonText}>{action}</Text>
          <ArrowRight color={palette.white} size={18} strokeWidth={2.4} />
        </Pressable>
      </View>
      <View style={styles.promoArt}>
        <View style={styles.promoCoin}>
          <Percent color="#F59E0B" size={22} strokeWidth={2.4} />
        </View>
        <View style={styles.promoPhone}>
          <View style={styles.promoPhoneSpeaker} />
          <View style={styles.promoPhoneScreen}>
            <Icon color={palette.white} size={32} strokeWidth={2} />
            <Text style={styles.promoPhoneText}>PAY</Text>
          </View>
        </View>
        <View style={styles.promoShield}>
          <ShieldCheck color="#3F58FF" size={28} strokeWidth={2.1} />
        </View>
      </View>
    </LinearGradient>
  );
}
