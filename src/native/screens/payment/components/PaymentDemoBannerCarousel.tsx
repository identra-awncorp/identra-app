import { useRef, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { assetManifest } from '../../../assets/assetManifest';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { paymentT } from '../paymentI18n';
import { paymentHomeStyles as styles } from './paymentHomeStyles';

const demoBanners = assetManifest.payment.demoBanners;

export function PaymentDemoBannerCarousel({
  colors,
  height,
  width,
}: {
  colors: AppColors;
  height: number;
  width: number;
}) {
  const { t } = useI18n();
  const scrollRef = useRef<ScrollView | null>(null);
  const currentIndexRef = useRef(0);
  const gestureStartIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const clampIndex = (index: number) => Math.min(demoBanners.length - 1, Math.max(0, index));

  const setBannerIndex = (targetIndex: number) => {
    currentIndexRef.current = targetIndex;
    setActiveIndex(targetIndex);
    scrollRef.current?.scrollTo({ y: targetIndex * height, animated: true });
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const startIndex = gestureStartIndexRef.current;
    const distance = event.nativeEvent.contentOffset.y - startIndex * height;
    const velocityY = event.nativeEvent.velocity?.y ?? 0;
    const direction = Math.abs(velocityY) > 0.15 ? Math.sign(velocityY) : Math.abs(distance) > height * 0.25 ? Math.sign(distance) : 0;

    setBannerIndex(clampIndex(startIndex + direction));
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / height);
    const startIndex = gestureStartIndexRef.current;
    const targetIndex = Math.min(startIndex + 1, Math.max(startIndex - 1, rawIndex));

    setBannerIndex(clampIndex(targetIndex));
  };

  return (
    <View style={[styles.demoBannerFrame, { width, height, backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView
        ref={scrollRef}
        decelerationRate="fast"
        disableIntervalMomentum
        nestedScrollEnabled
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollBeginDrag={() => {
          gestureStartIndexRef.current = currentIndexRef.current;
        }}
        onScrollEndDrag={handleScrollEndDrag}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={height}
        style={styles.demoBannerScroll}
      >
        {demoBanners.map((source, index) => (
          <Image
            key={index}
            accessibilityLabel={paymentT(t, 'home.banner.accessibility', { index: index + 1 })}
            source={source}
            resizeMode="cover"
            style={[styles.demoBannerImage, { width, height }]}
          />
        ))}
      </ScrollView>

      <View pointerEvents="none" style={styles.demoBannerIndicator}>
        {demoBanners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.demoBannerIndicatorDot,
              {
                height: activeIndex === index ? 18 : 6,
                backgroundColor: activeIndex === index ? colors.primaryDark : 'rgba(255,255,255,0.72)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}
