import { LinearGradient } from 'expo-linear-gradient';
import {
  Banknote,
  BarChart3,
  Check,
  Fingerprint,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
  UserRound,
  WalletCards,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppColors } from '../../theme';
import { border, palette, radius, shadows, spacing, typography } from '../../theme';
import { AppBrandLogo } from '../../components/AppLogo';
import { useI18n } from '../../i18n';

interface Props {
  colors: AppColors;
  initialSlide?: 'first' | 'last';
  onRegister: () => void;
  onLogin: () => void;
}

interface SlideData {
  id: string;
  accent: string;
  title: string;
  description: string;
  illustration: 'control' | 'finance' | 'connection' | 'identity';
}

export function OnboardingScreen({ colors, initialSlide = 'first', onRegister, onLogin }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const viewportWidth = Math.min(width, 430);
  const actionWidth = Math.max(viewportWidth - 48, 0);
  const compact = height < 720;
  const initialIndex = initialSlide === 'last' ? 3 : 0;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const carouselRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slides: SlideData[] = [
    {
      id: 'control',
      accent: t('onboarding.slides.control.accent'),
      title: t('onboarding.slides.control.title'),
      description: t('onboarding.slides.control.description'),
      illustration: 'control',
    },
    {
      id: 'finance',
      accent: t('onboarding.slides.finance.accent'),
      title: t('onboarding.slides.finance.title'),
      description: t('onboarding.slides.finance.description'),
      illustration: 'finance',
    },
    {
      id: 'connection',
      accent: t('onboarding.slides.connection.accent'),
      title: t('onboarding.slides.connection.title'),
      description: t('onboarding.slides.connection.description'),
      illustration: 'connection',
    },
    {
      id: 'identity',
      accent: t('onboarding.slides.identity.accent'),
      title: t('onboarding.slides.identity.title'),
      description: t('onboarding.slides.identity.description'),
      illustration: 'identity',
    },
  ];
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: true,
    listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / viewportWidth);
      setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
    },
  });
  const actionTranslateX = scrollX.interpolate({
    inputRange: [viewportWidth * 2, viewportWidth * 3],
    outputRange: [0, -actionWidth],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    scrollX.setValue(initialIndex * viewportWidth);
    requestAnimationFrame(() => {
      carouselRef.current?.scrollTo({ x: initialIndex * viewportWidth, animated: false });
    });
  }, [initialIndex, scrollX, viewportWidth]);

  return (
    <View
      nativeID="screen-onboarding"
      testID="screen-onboarding"
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <BackgroundGlow colors={colors} />
      <Brand colors={colors} compact={compact} topInset={insets.top} />
      <Animated.ScrollView
        ref={carouselRef}
        style={styles.carousel}
        contentOffset={{ x: initialIndex * viewportWidth, y: 0 }}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: viewportWidth }]}>
            <View style={[styles.illustrationArea, compact && styles.illustrationAreaCompact]}>
              <Illustration kind={slide.illustration} colors={colors} compact={compact} />
            </View>
            <View style={[styles.copy, compact && styles.copyCompact]}>
              <Text
                accessibilityRole="header"
                style={[styles.title, compact && styles.titleCompact, { color: colors.text }]}
              >
                <Text style={{ color: colors.primaryDark }}>{slide.accent}</Text>
                {slide.title}
              </Text>
              <Text
                style={[
                  styles.description,
                  compact && styles.descriptionCompact,
                  { color: colors.textSecondary },
                ]}
              >
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
      <View
        style={[
          styles.footer,
          compact && styles.footerCompact,
          {
            minHeight: (compact ? 126 : 148) + insets.bottom,
            paddingBottom: insets.bottom + (compact ? 6 : spacing.md),
          },
        ]}
      >
        <View accessibilityLabel={t('onboarding.pageIndicator', { current: activeIndex + 1, total: slides.length })} style={styles.indicators}>
          {slides.map((item, indicatorIndex) => {
            const inputRange = [
              (indicatorIndex - 1) * viewportWidth,
              indicatorIndex * viewportWidth,
              (indicatorIndex + 1) * viewportWidth,
            ];
            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: colors.primaryDark,
                    opacity: scrollX.interpolate({
                      inputRange,
                      outputRange: [0.16, 1, 0.16],
                      extrapolate: 'clamp',
                    }),
                    transform: [
                      {
                        scale: scrollX.interpolate({
                          inputRange,
                          outputRange: [0.82, 1.08, 0.82],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={[styles.actionsViewport, { width: actionWidth }]}>
          <Animated.View
            style={[
              styles.actionsTrack,
              {
                width: actionWidth * 2,
                transform: [{ translateX: actionTranslateX }],
              },
            ]}
          >
            <View style={[styles.actionPanel, { width: actionWidth }]}>
              <Text style={[styles.swipeHint, { color: colors.textSecondary }]}>{t('onboarding.swipeHint')}</Text>
            </View>
            <View style={[styles.actionPanel, styles.ctaPanel, { width: actionWidth }]}>
              <OnboardingButton title={t('onboarding.login')} colors={colors} onPress={onLogin} />
              <OnboardingButton title={t('onboarding.register')} colors={colors} onPress={onRegister} secondary />
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

function BackgroundGlow({ colors }: { colors: AppColors }) {
  return (
    <>
      <View style={[styles.glow, styles.glowTop, { backgroundColor: colors.primary }]} />
      <View style={[styles.glow, styles.glowBottom, { backgroundColor: colors.primaryDark }]} />
    </>
  );
}

function Brand({ colors, compact, topInset }: { colors: AppColors; compact: boolean; topInset: number }) {
  return (
    <View
      style={[
        styles.brand,
        compact && styles.brandCompact,
        { height: (compact ? 66 : 86) + topInset, paddingTop: topInset },
      ]}
    >
      <AppBrandLogo colors={colors} logoSize={48} wordmarkSize={29} />
    </View>
  );
}

function Illustration({
  kind,
  colors,
  compact,
}: {
  kind: SlideData['illustration'];
  colors: AppColors;
  compact: boolean;
}) {
  if (kind === 'finance') return <FinanceIllustration colors={colors} compact={compact} />;
  if (kind === 'connection') return <ConnectionIllustration colors={colors} compact={compact} />;
  if (kind === 'identity') return <IdentityIllustration colors={colors} compact={compact} />;
  return <ControlIllustration colors={colors} compact={compact} />;
}

function ControlIllustration({ colors, compact }: { colors: AppColors; compact: boolean }) {
  const { t } = useI18n();
  return (
    <View style={[styles.orbit, compact && styles.orbitCompact, { borderColor: `${colors.primaryDark}2C` }]}>
      <FeatureCard colors={colors} style={styles.featureTopLeft} icon={Landmark} label={t('onboarding.features.bank')} />
      <FeatureCard colors={colors} style={styles.featureTopRight} icon={WalletCards} label={t('onboarding.features.eWallet')} />
      <FeatureCard colors={colors} style={styles.featureBottomLeft} icon={ShieldCheck} label={t('onboarding.features.insurance')} />
      <FeatureCard colors={colors} style={styles.featureBottomRight} icon={TrendingUp} label={t('onboarding.features.investment')} />
      <View style={[styles.heroShieldHalo, { backgroundColor: `${colors.primaryDark}0D` }]}>
        <LinearGradient colors={['#8BA5FF', colors.primaryDark]} style={styles.heroShield}>
          <ShieldCheck color="#FFFFFF" size={compact ? 82 : 98} strokeWidth={1.6} />
          <View style={styles.heroLock}>
            <LockKeyhole color="#FFFFFF" size={compact ? 34 : 42} strokeWidth={2.5} />
          </View>
        </LinearGradient>
      </View>
      <Platform colors={colors} />
    </View>
  );
}

function FinanceIllustration({ colors, compact }: { colors: AppColors; compact: boolean }) {
  const { t } = useI18n();
  return (
    <View style={[styles.orbit, compact && styles.orbitCompact, { borderColor: `${colors.primaryDark}2C` }]}>
      <FloatingIcon colors={colors} style={styles.floatLeft} icon={ShieldCheck} />
      <FloatingIcon colors={colors} style={styles.floatRight} icon={BarChart3} />
      <FloatingIcon colors={colors} style={styles.floatBottomRight} icon={LockKeyhole} />
      <Phone colors={colors} compact={compact}>
        <Text style={[styles.phoneTitle, { color: colors.text }]}>{t('onboarding.finance.walletTitle')}</Text>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('onboarding.finance.balanceLabel')}</Text>
          <Text style={styles.balanceValue}>2.560.000 đ</Text>
        </LinearGradient>
        <View style={styles.phoneActions}>
          {[Banknote, WalletCards, TrendingUp].map((Icon, index) => (
            <View key={index} style={[styles.phoneAction, { backgroundColor: colors.surfaceMuted }]}>
              <Icon color={colors.primaryDark} size={14} />
            </View>
          ))}
        </View>
        <Text style={[styles.phoneSection, { color: colors.text }]}>{t('onboarding.finance.recentTransactions')}</Text>
        {[t('onboarding.finance.transferTo'), t('onboarding.finance.receiveFrom'), t('onboarding.finance.servicePayment')].map((label, index) => (
          <View key={label} style={styles.transaction}>
            <View style={[styles.transactionDot, { backgroundColor: index === 1 ? colors.success : colors.primary }]} />
            <View style={styles.transactionCopy}>
              <View style={[styles.transactionLine, { backgroundColor: colors.text, opacity: 0.68 }]} />
              <Text numberOfLines={1} style={[styles.transactionLabel, { color: colors.textSecondary }]}>
                {label}
              </Text>
            </View>
          </View>
        ))}
      </Phone>
      <Platform colors={colors} />
    </View>
  );
}

function ConnectionIllustration({ colors, compact }: { colors: AppColors; compact: boolean }) {
  const { t } = useI18n();
  return (
    <View style={[styles.orbit, compact && styles.orbitCompact, { borderColor: `${colors.primaryDark}34` }]}>
      <FeatureCard colors={colors} style={styles.featureTopLeft} icon={ShieldCheck} label={t('onboarding.features.secureConnection')} />
      <FeatureCard colors={colors} style={styles.featureTopRight} icon={LockKeyhole} label={t('onboarding.features.endToEndEncryption')} />
      <FeatureCard colors={colors} style={styles.featureBottomRight} icon={MessageSquareText} label={t('onboarding.features.privateExchange')} />
      <Phone colors={colors} compact={compact}>
        <Text style={[styles.connectionPill, { color: colors.primaryDark, backgroundColor: colors.surfaceMuted }]}>
          {t('onboarding.connection.secureConnection')}
        </Text>
        <Text style={[styles.phoneTitle, { color: colors.text }]}>{t('onboarding.connection.connectWithMe')}</Text>
        <View style={[styles.qrCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <QrPattern colors={colors} />
          <Text style={[styles.qrCaption, { color: colors.text }]}>{t('onboarding.connection.scanToConnect')}</Text>
        </View>
        <View style={[styles.encryptionCard, { backgroundColor: colors.surfaceMuted }]}>
          <ShieldCheck color={colors.primaryDark} size={20} />
          <View>
            <Text style={[styles.encryptionTitle, { color: colors.text }]}>{t('onboarding.connection.endToEndEncryption')}</Text>
            <Text style={[styles.encryptionText, { color: colors.textSecondary }]}>{t('onboarding.connection.onlyParticipantsCanView')}</Text>
          </View>
          <Check color={colors.success} size={18} />
        </View>
      </Phone>
      <Platform colors={colors} />
    </View>
  );
}

function IdentityIllustration({ colors, compact }: { colors: AppColors; compact: boolean }) {
  const { t } = useI18n();
  return (
    <View style={[styles.orbit, compact && styles.orbitCompact, { borderColor: `${colors.primaryDark}2C` }]}>
      <FloatingIcon colors={colors} style={styles.floatLeft} icon={UserRound} />
      <FloatingIcon colors={colors} style={styles.floatRight} icon={Fingerprint} />
      <FloatingIcon colors={colors} style={styles.floatBottomRight} icon={Check} />
      <Phone colors={colors} compact={compact}>
        <View style={styles.phoneBrand}>
          <AppBrandLogo colors={colors} logoSize={26} wordmarkSize={15} />
        </View>
        {[
          { icon: ShieldCheck, title: t('onboarding.features.absoluteSecurity') },
          { icon: UserRound, title: t('onboarding.features.fullControl') },
          { icon: Check, title: t('onboarding.features.trustedVerification') },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.title} style={[styles.securityRow, { backgroundColor: colors.surfaceMuted }]}>
              <View style={[styles.securityIcon, { backgroundColor: `${colors.primaryDark}16` }]}>
                <Icon color={colors.primaryDark} size={17} />
              </View>
              <View style={styles.transactionCopy}>
                <Text style={[styles.securityTitle, { color: colors.text }]}>{item.title}</Text>
                <View style={[styles.securityLine, { backgroundColor: colors.textSecondary }]} />
              </View>
            </View>
          );
        })}
        <View style={[styles.identityLock, { borderColor: `${colors.primaryDark}42` }]}>
          <LockKeyhole color={colors.primaryDark} size={26} />
        </View>
      </Phone>
      <Platform colors={colors} />
    </View>
  );
}

function Phone({
  colors,
  compact,
  children,
}: {
  colors: AppColors;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.phone,
        compact && styles.phoneCompact,
        shadows.floating,
        { backgroundColor: colors.surface, borderColor: `${colors.primaryDark}24` },
      ]}
    >
      <View style={[styles.phoneSpeaker, { backgroundColor: colors.border }]} />
      <View style={styles.phoneContent}>{children}</View>
    </View>
  );
}

function FeatureCard({
  colors,
  style,
  icon: Icon,
  label,
}: {
  colors: AppColors;
  style: object;
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <View style={[styles.featureCard, shadows.card, style, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon color={colors.primaryDark} size={24} strokeWidth={2} />
      <Text numberOfLines={2} style={[styles.featureLabel, { color: colors.text }]}>
        {label}
      </Text>
      <View style={[styles.featureLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function FloatingIcon({
  colors,
  style,
  icon: Icon,
}: {
  colors: AppColors;
  style: object;
  icon: typeof ShieldCheck;
}) {
  return (
    <View style={[styles.floatingIcon, shadows.card, style, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon color={colors.primaryDark} size={30} strokeWidth={1.8} />
    </View>
  );
}

function Platform({ colors }: { colors: AppColors }) {
  return (
    <View style={styles.platform}>
      <View style={[styles.platformTop, { backgroundColor: `${colors.primaryDark}1C` }]} />
      <View style={[styles.platformBottom, { borderColor: `${colors.primaryDark}26` }]} />
    </View>
  );
}

function QrPattern({ colors }: { colors: AppColors }) {
  const cells = [
    0, 1, 2, 4, 6, 7, 8, 9, 11, 13, 14, 16, 18, 20, 22, 23, 24, 26, 27, 29, 31, 33, 35, 36, 37, 39, 40, 42,
    44, 46, 48,
  ];
  return (
    <View style={styles.qrPattern}>
      {Array.from({ length: 49 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.qrCell,
            { backgroundColor: cells.includes(index) ? colors.primaryDark : 'transparent' },
          ]}
        />
      ))}
      <View style={[styles.qrCenter, { backgroundColor: colors.surface }]}>
        <ShieldCheck color={colors.primaryDark} size={24} />
      </View>
    </View>
  );
}

function OnboardingButton({
  colors,
  title,
  onPress,
  secondary = false,
}: {
  colors: AppColors;
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary
          ? { backgroundColor: colors.surface, borderColor: colors.primaryDark }
          : { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
        { opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <Text style={[styles.buttonText, { color: secondary ? colors.text : palette.white }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, opacity: 0.07 },
  glowTop: { top: -130, right: -100 },
  glowBottom: { bottom: -150, left: -110 },
  carousel: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: spacing.xl },
  brand: { height: 86, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm + spacing.xxs },
  brandCompact: { height: 66 },
  illustrationArea: { flex: 1, minHeight: 330, width: '100%', alignItems: 'center', justifyContent: 'center' },
  illustrationAreaCompact: { minHeight: 252 },
  orbit: {
    width: 330,
    height: 330,
    borderRadius: 165,
    borderWidth: border.thin,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitCompact: { width: 260, height: 260, borderRadius: 130, transform: [{ scale: 0.9 }] },
  featureCard: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 18,
    borderWidth: border.thin,
    padding: 12,
    gap: 4,
    zIndex: 4,
  },
  featureTopLeft: { top: 8, left: -4, transform: [{ rotate: '-6deg' }] },
  featureTopRight: { top: 16, right: -8, transform: [{ rotate: '6deg' }] },
  featureBottomLeft: { bottom: 22, left: -18, transform: [{ rotate: '-8deg' }] },
  featureBottomRight: { bottom: 15, right: -15, transform: [{ rotate: '8deg' }] },
  featureLabel: { fontSize: 11, lineHeight: 14, fontWeight: typography.weight.extraBold },
  featureLine: { height: 4, width: '72%', borderRadius: 3, opacity: 0.8 },
  heroShieldHalo: { width: 190, height: 215, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  heroShield: {
    width: 158,
    height: 184,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ perspective: 500 }, { rotateY: '-7deg' }],
  },
  heroLock: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  platform: { position: 'absolute', bottom: -18, alignItems: 'center' },
  platformTop: { width: 198, height: 25, borderRadius: 99 },
  platformBottom: { marginTop: -9, width: 238, height: 34, borderRadius: 119, borderWidth: 1 },
  floatingIcon: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: border.thin,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  floatLeft: { top: 70, left: -10, transform: [{ rotate: '-8deg' }] },
  floatRight: { top: 64, right: -8, transform: [{ rotate: '8deg' }] },
  floatBottomRight: { bottom: 46, right: -18, transform: [{ rotate: '7deg' }] },
  phone: {
    width: 184,
    height: 290,
    borderWidth: 6,
    borderRadius: 38,
    paddingTop: 10,
    transform: [{ perspective: 700 }, { rotateY: '-7deg' }, { rotateZ: '-2deg' }],
    zIndex: 3,
  },
  phoneCompact: { width: 166, height: 254, borderRadius: 34 },
  phoneSpeaker: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 8 },
  phoneContent: { flex: 1, padding: 10, overflow: 'hidden', gap: 7 },
  phoneTitle: { fontSize: 15, fontWeight: '900', letterSpacing: -0.3 },
  balanceCard: { borderRadius: 12, padding: 10 },
  balanceLabel: { color: 'rgba(255,255,255,0.84)', fontSize: 8, fontWeight: typography.weight.semibold },
  balanceValue: { color: palette.white, marginTop: 3, fontSize: 17, fontWeight: typography.weight.black },
  phoneActions: { flexDirection: 'row', gap: 5 },
  phoneAction: { flex: 1, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  phoneSection: { marginTop: 2, fontSize: 9, fontWeight: '800' },
  transaction: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  transactionDot: { width: 17, height: 17, borderRadius: 9 },
  transactionCopy: { flex: 1, gap: 3 },
  transactionLine: { width: '74%', height: 3, borderRadius: 2 },
  transactionLabel: { fontSize: 6, lineHeight: 8 },
  connectionPill: { alignSelf: 'flex-end', borderRadius: radius.round, paddingHorizontal: 7, paddingVertical: 3, fontSize: 5, fontWeight: typography.weight.extraBold },
  qrCard: { borderWidth: border.thin, borderRadius: radius.md + 2, alignItems: 'center', padding: spacing.sm, gap: 5 },
  qrPattern: { width: 92, height: 92, flexDirection: 'row', flexWrap: 'wrap', position: 'relative' },
  qrCell: { width: 12, height: 12, margin: 0.55 },
  qrCenter: { position: 'absolute', width: 36, height: 36, borderRadius: 18, top: 28, left: 28, alignItems: 'center', justifyContent: 'center' },
  qrCaption: { fontSize: 7, fontWeight: typography.weight.extraBold },
  encryptionCard: { minHeight: 43, borderRadius: 11, padding: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  encryptionTitle: { fontSize: 7, fontWeight: typography.weight.extraBold },
  encryptionText: { marginTop: 2, fontSize: 5 },
  phoneBrand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 },
  securityRow: { minHeight: 49, borderRadius: 11, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  securityIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  securityTitle: { fontSize: 7, fontWeight: '800' },
  securityLine: { width: '70%', height: 3, borderRadius: 2, opacity: 0.35 },
  identityLock: { marginTop: 'auto', alignSelf: 'center', width: 62, height: 62, borderRadius: 31, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  copy: { minHeight: 190, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 16 },
  copyCompact: { minHeight: 152, paddingTop: 4 },
  title: { textAlign: 'center', fontSize: 34, lineHeight: 41, fontWeight: typography.weight.black, letterSpacing: -1.25 },
  titleCompact: { fontSize: 28, lineHeight: 34 },
  description: { marginTop: spacing.lg, maxWidth: 350, textAlign: 'center', fontSize: 15, lineHeight: typography.lineHeight.md, fontWeight: typography.weight.medium },
  descriptionCompact: { marginTop: 10, fontSize: 13, lineHeight: 19 },
  footer: { minHeight: 148, width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  footerCompact: { minHeight: 126, paddingTop: 8, paddingBottom: 6 },
  indicators: { height: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13 },
  indicator: { width: 9, height: 9, borderRadius: 5 },
  actionsViewport: { minHeight: 112, overflow: 'hidden' },
  actionsTrack: { minHeight: 112, flexDirection: 'row' },
  actionPanel: { minHeight: 112, alignItems: 'center', justifyContent: 'flex-end' },
  ctaPanel: { gap: 10 },
  swipeHint: { paddingBottom: 25, fontSize: 13, lineHeight: 18, fontWeight: typography.weight.semibold },
  button: { width: '100%', minHeight: 50, borderRadius: radius.md + 2, borderWidth: border.thin, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: typography.size.md, fontWeight: typography.weight.extraBold },
});
