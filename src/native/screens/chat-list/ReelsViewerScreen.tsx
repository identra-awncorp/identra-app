import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Smile,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { demoAvatars } from '../../data/demo/chatDemoData';
import type { ChatPreview } from '../../data/demo/chatDemoData';
import { type ReelDemoItem } from '../../data/demo/chatListDemoData';
import { useI18n } from '../../i18n';
import { styles } from './ChatListStyles';

export function ReelsViewerScreen({
  activeIndex,
  bottomInset,
  contact,
  onClose,
  onNext,
  onPrevious,
  reels,
  topInset,
}: {
  activeIndex: number;
  bottomInset: number;
  contact: ChatPreview;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  reels: ReelDemoItem[];
  topInset: number;
}) {
  const { t } = useI18n();
  const activeReel = reels[activeIndex] ?? reels[0];
  const avatarSource = contact.avatarSource ?? demoAvatars.catMask;
  const { height, width } = useWindowDimensions();
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const commentsTranslateY = useRef(new Animated.Value(430)).current;
  const commentsOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0.35)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [heartVisible, setHeartVisible] = useState(false);

  useEffect(() => {
    screenTranslateY.setValue(0);
    commentsTranslateY.setValue(430);
    commentsOpacity.setValue(0);
    setCommentsOpen(false);
  }, [activeIndex, commentsOpacity, commentsTranslateY, screenTranslateY]);

  useEffect(
    () => () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    },
    [],
  );

  const resetDismissGesture = useCallback(() => {
    Animated.spring(screenTranslateY, {
      toValue: 0,
      damping: 22,
      stiffness: 220,
      mass: 0.85,
      useNativeDriver: true,
    }).start();
  }, [screenTranslateY]);

  const dismissViewer = useCallback(() => {
    Animated.timing(screenTranslateY, {
      toValue: height,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [height, onClose, screenTranslateY]);

  const openComments = useCallback(() => {
    setCommentsOpen(true);
    Animated.parallel([
      Animated.timing(commentsTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(commentsOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [commentsOpacity, commentsTranslateY]);

  const closeComments = useCallback(() => {
    Animated.parallel([
      Animated.timing(commentsTranslateY, {
        toValue: 430,
        duration: 230,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(commentsOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setCommentsOpen(false);
    });
  }, [commentsOpacity, commentsTranslateY]);

  const triggerHeart = () => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }
    setHeartVisible(true);
    heartScale.setValue(0.35);
    heartOpacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          damping: 8,
          stiffness: 190,
          mass: 0.55,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1.22,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setHeartVisible(false));
  };

  const handleScreenTap = (x: number) => {
    if (commentsOpen) return;
    const now = Date.now();
    if (now - lastTapRef.current < 270) {
      lastTapRef.current = 0;
      triggerHeart();
      return;
    }

    lastTapRef.current = now;
    tapTimerRef.current = setTimeout(() => {
      if (x < width / 2) {
        onPrevious();
      } else {
        onNext();
      }
      tapTimerRef.current = null;
    }, 270);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8,
        onPanResponderMove: (_, gestureState) => {
          if (!commentsOpen && gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
            screenTranslateY.setValue(Math.min(gestureState.dy, height));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);

          if (absDx > 56 && absDx > absDy * 1.15) {
            resetDismissGesture();
            if (gestureState.dx < 0) onNext();
            else onPrevious();
            return;
          }

          if (gestureState.dy < -72 && absDy > absDx) {
            resetDismissGesture();
            openComments();
            return;
          }

          if (gestureState.dy > 78 && absDy > absDx) {
            if (commentsOpen) {
              closeComments();
              resetDismissGesture();
            } else {
              dismissViewer();
            }
            return;
          }

          resetDismissGesture();
        },
        onPanResponderTerminate: resetDismissGesture,
      }),
    [
      closeComments,
      commentsOpen,
      dismissViewer,
      height,
      onNext,
      onPrevious,
      openComments,
      resetDismissGesture,
      screenTranslateY,
    ],
  );

  return (
    <Animated.View style={[styles.reelsAnimatedRoot, { transform: [{ translateY: screenTranslateY }] }]}>
      <ImageBackground
        source={activeReel.imageSource}
        resizeMode="cover"
        style={styles.reelsBackground}
      >
      <LinearGradient
        colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.82)']}
        locations={[0, 0.46, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.reelsTopOverlay, { paddingTop: Math.max(topInset, 10) + 6 }]}>
        <View style={styles.reelsProgressRow}>
          {reels.map((reel, index) => (
            <View key={reel.id} style={styles.reelsProgressTrack}>
              {index <= activeIndex ? (
                <View
                  style={[
                    styles.reelsProgressFill,
                    { width: index < activeIndex ? '100%' : '62%' },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.reelsHeaderRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chatListExtras.reels.back')}
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [styles.reelsIconButton, { opacity: pressed ? 0.62 : 1 }]}
          >
            <ChevronLeft color="#FFFFFF" size={30} strokeWidth={2.1} />
          </Pressable>

          <Image source={avatarSource} style={styles.reelsAvatar} />

          <View style={styles.reelsAuthorCopy}>
            <Text numberOfLines={1} style={styles.reelsAuthorName}>
              {contact.name}
            </Text>
            <Text numberOfLines={1} style={styles.reelsPostedAt}>
              {activeReel.postedAt}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chatListExtras.reels.options')}
            hitSlop={8}
            style={({ pressed }) => [styles.reelsMoreButton, { opacity: pressed ? 0.62 : 1 }]}
          >
            <MoreHorizontal color="#FFFFFF" size={26} strokeWidth={2.5} />
          </Pressable>
        </View>

        <View style={styles.reelsStoryPill}>
          <View style={styles.reelsStoryPlus}>
            <Plus color="#FFFFFF" size={16} strokeWidth={2.2} />
          </View>
          <Text style={styles.reelsStoryText}>{t('chatListExtras.reels.story')}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('chatListExtras.reels.controlArea')}
        onPress={(event) => handleScreenTap(event.nativeEvent.locationX)}
        style={styles.reelsGestureLayer}
        {...panResponder.panHandlers}
      />

      {heartVisible ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.reelsHeartBurst,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
        >
          <Heart color="#FFFFFF" fill="#FF3D47" size={104} strokeWidth={1.5} />
        </Animated.View>
      ) : null}

      <View style={styles.reelsCaptionWrap}>
        <Text style={styles.reelsCaption}>{activeReel.caption}</Text>
      </View>

      <View style={[styles.reelsBottomBar, { paddingBottom: Math.max(bottomInset, 14) + 8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chatListExtras.reels.messageTo', { name: contact.name })}
          style={({ pressed }) => [styles.reelsReplyInput, { opacity: pressed ? 0.76 : 1 }]}
        >
          <MessageCircle color="#FFFFFF" size={28} strokeWidth={1.9} />
          <Text numberOfLines={1} style={styles.reelsReplyText}>
            {t('chatListExtras.reels.messageTo', { name: contact.name })}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chatListExtras.reels.sendReaction')}
          style={({ pressed }) => [styles.reelsRoundAction, { opacity: pressed ? 0.76 : 1 }]}
        >
          <Smile color="#FFFFFF" size={30} strokeWidth={2.1} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chatListExtras.reels.sendReels')}
          style={({ pressed }) => [styles.reelsRoundAction, { opacity: pressed ? 0.76 : 1 }]}
        >
          <Send color="#FFFFFF" size={29} strokeWidth={2.1} />
        </Pressable>
      </View>
      {commentsOpen ? (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.reelsCommentsSheet,
            {
              paddingBottom: Math.max(bottomInset, 14) + 16,
              opacity: commentsOpacity,
              transform: [{ translateY: commentsTranslateY }],
            },
          ]}
        >
          <View style={styles.reelsCommentsGrabber} />
          <View style={styles.reelsCommentsHeader}>
            <Text style={styles.reelsCommentsTitle}>{t('chatListExtras.reels.comments')}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('chatListExtras.reels.closeComments')} onPress={closeComments} hitSlop={8}>
              <X color="#11172F" size={24} strokeWidth={2} />
            </Pressable>
          </View>
          <View style={styles.reelsCommentRow}>
            <Image source={avatarSource} style={styles.reelsCommentAvatar} />
            <View style={styles.reelsCommentBubble}>
              <Text style={styles.reelsCommentName}>{contact.name}</Text>
              <Text style={styles.reelsCommentText}>Cảnh này đẹp quá!</Text>
            </View>
          </View>
          <View style={styles.reelsCommentInput}>
            <MessageCircle color="#5E6885" size={22} strokeWidth={1.9} />
            <Text style={styles.reelsCommentPlaceholder}>{t('chatListExtras.reels.commentPlaceholder')}</Text>
          </View>
        </Animated.View>
      ) : null}
      </ImageBackground>
    </Animated.View>
  );
}
