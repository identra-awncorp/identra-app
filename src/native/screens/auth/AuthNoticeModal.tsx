import { CircleAlert, Info, TriangleAlert } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { border, palette, radius, spacing, typography, type AppColors } from '../../theme';

export type AuthNoticeTone = 'danger' | 'info' | 'warning';

export interface AuthNotice {
  description: string;
  title: string;
  tone: AuthNoticeTone;
}

interface Props {
  actionLabel: string;
  colors: AppColors;
  notice: AuthNotice | null;
  onClose: () => void;
}

export function AuthNoticeModal({ actionLabel, colors, notice, onClose }: Props) {
  if (!notice) return null;

  const tone = getTone(colors, notice.tone);
  const Icon = notice.tone === 'danger' ? CircleAlert : notice.tone === 'warning' ? TriangleAlert : Info;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible
    >
      <View
        accessibilityLabel={`${notice.title}. ${notice.description}`}
        accessibilityRole="alert"
        accessibilityViewIsModal
        nativeID="auth-notice-modal"
        testID="auth-notice-modal"
        style={[styles.root, { backgroundColor: colors.overlay }]}
      >
        <Pressable accessibilityLabel={actionLabel} onPress={onClose} style={styles.backdrop} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: tone.background, borderColor: tone.border }]}>
            <Icon color={tone.color} size={29} strokeWidth={2} />
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {notice.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{notice.description}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.primaryDark, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function getTone(colors: AppColors, tone: AuthNoticeTone) {
  const color = tone === 'danger' ? colors.danger : tone === 'warning' ? colors.warning : colors.primaryDark;
  return {
    color,
    background: `${color}14`,
    border: `${color}28`,
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  card: {
    width: '100%',
    maxWidth: 326,
    borderWidth: border.thin,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: '#07102A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 26,
    elevation: 12,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderWidth: border.thin,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.lg,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extraBold,
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.regular,
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
    minHeight: 50,
    marginTop: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: palette.white, fontSize: typography.size.md, fontWeight: typography.weight.bold },
});
