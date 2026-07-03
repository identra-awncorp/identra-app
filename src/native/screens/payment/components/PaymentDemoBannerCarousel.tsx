import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, PanResponder, View } from 'react-native';

import { assetManifest } from '../../../assets/assetManifest';
import { useI18n } from '../../../i18n';
import type { AppColors } from '../../../theme';
import { paymentT } from '../paymentI18n';
import { paymentHomeStyles as styles } from './paymentHomeStyles';

const demoBanners = assetManifest.payment.demoBanners;
const trackBannerIndexes = [
  demoBanners.length - 1,
  ...demoBanners.map((_, index) => index),
  0,
];
const AUTO_SCROLL_INTERVAL_MS = 10000;
const AUTO_SCROLL_RESUME_DELAY_MS = 20000;
const AUTO_SCROLL_RETRY_MS = 600;
const SLIDE_ANIMATION_DURATION_MS = 380;

function wrapBannerIndex(index: number) {
  return (index + demoBanners.length) % demoBanners.length;
}

function getBannerTranslateY(index: number, height: number) {
  return -(index + 1) * height;
}

function clampDragOffset(value: number, height: number) {
  return Math.min(height, Math.max(-height, value));
}

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
  const currentIndexRef = useRef(0);
  const gestureStartIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const autoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleAutoScrollRef = useRef<(delayMs?: number) => void>(() => undefined);
  const bannerTranslateY = useRef(new Animated.Value(getBannerTranslateY(0, height))).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const clearAutoScroll = useCallback(() => {
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = null;
    }
  }, []);

  const settleBanner = useCallback((direction: -1 | 0 | 1) => {
    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;

    const startIndex = gestureStartIndexRef.current;
    const targetIndex = wrapBannerIndex(startIndex + direction);
    const targetTranslateY = getBannerTranslateY(startIndex, height) - direction * height;

    Animated.timing(bannerTranslateY, {
      toValue: targetTranslateY,
      duration: SLIDE_ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start(() => {
      if (direction !== 0) {
        currentIndexRef.current = targetIndex;
        setActiveIndex(targetIndex);
      }

      bannerTranslateY.setValue(getBannerTranslateY(targetIndex, height));
      isAnimatingRef.current = false;
    });
  }, [bannerTranslateY, height]);

  const scheduleAutoScroll = useCallback((delayMs = AUTO_SCROLL_INTERVAL_MS) => {
    clearAutoScroll();

    autoScrollTimeoutRef.current = setTimeout(() => {
      autoScrollTimeoutRef.current = null;

      if (isDraggingRef.current || isAnimatingRef.current) {
        scheduleAutoScrollRef.current(AUTO_SCROLL_RETRY_MS);
        return;
      }

      gestureStartIndexRef.current = currentIndexRef.current;
      settleBanner(1);
      scheduleAutoScrollRef.current(AUTO_SCROLL_INTERVAL_MS);
    }, delayMs);
  }, [clearAutoScroll, settleBanner]);

  useEffect(() => {
    bannerTranslateY.setValue(getBannerTranslateY(currentIndexRef.current, height));
  }, [bannerTranslateY, height]);

  useEffect(() => {
    scheduleAutoScrollRef.current = scheduleAutoScroll;
  }, [scheduleAutoScroll]);

  useEffect(() => {
    scheduleAutoScroll(AUTO_SCROLL_INTERVAL_MS);
    return () => {
      clearAutoScroll();
    };
  }, [clearAutoScroll, scheduleAutoScroll]);

  const bannerSlideAnimatedStyles = useMemo(
    () =>
      trackBannerIndexes.map((_, trackIndex) => {
        const centeredTranslateY = -trackIndex * height;
        const inputRange = [centeredTranslateY - height, centeredTranslateY, centeredTranslateY + height];

        return {
          opacity: bannerTranslateY.interpolate({
            inputRange,
            outputRange: [0.74, 1, 0.74],
            extrapolate: 'clamp',
          }),
          transform: [
            { perspective: 900 },
            {
              translateY: bannerTranslateY.interpolate({
                inputRange,
                outputRange: [-10, 0, 10],
                extrapolate: 'clamp',
              }),
            },
            {
              rotateX: bannerTranslateY.interpolate({
                inputRange,
                outputRange: ['8deg', '0deg', '-8deg'],
                extrapolate: 'clamp',
              }),
            },
            {
              scale: bannerTranslateY.interpolate({
                inputRange,
                outputRange: [0.96, 1, 0.96],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      }),
    [bannerTranslateY, height],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) => Math.abs(gestureState.dy) > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          clearAutoScroll();
          isDraggingRef.current = true;
          gestureStartIndexRef.current = currentIndexRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const startIndex = gestureStartIndexRef.current;
          const dragOffset = clampDragOffset(gestureState.dy, height);

          bannerTranslateY.setValue(getBannerTranslateY(startIndex, height) + dragOffset);
        },
        onPanResponderRelease: (_, gestureState) => {
          const velocityDirection = Math.abs(gestureState.vy) > 0.15 ? (gestureState.vy < 0 ? 1 : -1) : 0;
          const distanceDirection = Math.abs(gestureState.dy) > height * 0.22 ? (gestureState.dy < 0 ? 1 : -1) : 0;
          const direction = (velocityDirection || distanceDirection) as -1 | 0 | 1;

          isDraggingRef.current = false;
          settleBanner(direction);
          scheduleAutoScroll(AUTO_SCROLL_RESUME_DELAY_MS);
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
          settleBanner(0);
          scheduleAutoScroll(AUTO_SCROLL_RESUME_DELAY_MS);
        },
        onShouldBlockNativeResponder: () => true,
      }),
    [bannerTranslateY, clearAutoScroll, height, scheduleAutoScroll, settleBanner],
  );

  return (
    <View
      {...panResponder.panHandlers}
      style={[styles.demoBannerFrame, { width, height, backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Animated.View
        style={[styles.demoBannerTrack, { width, height: height * trackBannerIndexes.length, transform: [{ translateY: bannerTranslateY }] }]}
      >
        {trackBannerIndexes.map((bannerIndex, trackIndex) => (
          <Animated.View
            key={`${trackIndex}-${bannerIndex}`}
            style={[styles.demoBannerSlide, { width, height }, bannerSlideAnimatedStyles[trackIndex]]}
          >
            <Image
              accessibilityLabel={paymentT(t, 'home.banner.accessibility', { index: bannerIndex + 1 })}
              source={demoBanners[bannerIndex]}
              resizeMode="cover"
              style={[styles.demoBannerImage, { width, height }]}
            />
          </Animated.View>
        ))}
      </Animated.View>

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
