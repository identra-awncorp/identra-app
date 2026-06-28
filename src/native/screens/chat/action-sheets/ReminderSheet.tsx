import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  ChevronRight,
  Clock3,
  FileCheck2,
  RotateCw,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { border, palette, radius, spacing, touchTarget, typography, type AppColors } from '../../../theme';

type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'multi-weekly' | 'monthly' | 'yearly';
type ReminderAudience = 'self' | 'both';

export function ReminderSheet({
  colors,
  onCancel,
  onCreate,
}: {
  colors: AppColors;
  onCancel: () => void;
  onCreate: (title: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [repeat, setRepeat] = useState<ReminderRepeat>('none');
  const [audience, setAudience] = useState<ReminderAudience>('self');

  const submitReminder = () => {
    if (!title.trim()) {
      Alert.alert('Chưa nhập tiêu đề', 'Vui lòng nhập tiêu đề cho nhắc hẹn.');
      return;
    }
    onCreate(title.trim());
  };

  return (
    <View
      nativeID="screen-create-reminder"
      testID="screen-create-reminder"
      style={[styles.screen, { paddingTop: Math.max(10, insets.top) }]}
    >
      <View style={styles.header}>
        <Pressable accessibilityLabel="Đóng tạo nhắc hẹn" accessibilityRole="button" onPress={onCancel} style={styles.headerButton}>
          <X color={colors.text} size={27} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Tạo nhắc hẹn</Text>
        <View style={[styles.headerButton, styles.headerShield]}>
          <ShieldCheck color={colors.primaryDark} size={25} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Tạo nhắc hẹn để không bỏ lỡ những việc quan trọng.
        </Text>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Tiêu đề nhắc hẹn</Text>
        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.leadingIcon, { backgroundColor: colors.surfaceMuted }]}><FileCheck2 color={colors.primaryDark} size={21} /></View>
          <TextInput
            maxLength={100}
            onChangeText={setTitle}
            placeholder="Nhập tiêu đề nhắc hẹn"
            placeholderTextColor={colors.textSecondary}
            style={[styles.inputText, { color: colors.text }]}
            value={title}
          />
          <Text style={[styles.counter, { color: colors.textSecondary }]}>{title.length}/100</Text>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Thời gian nhắc</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Thời gian nhắc', 'Tính năng chọn ngày giờ sẽ sử dụng bộ chọn hệ thống.')}
          style={[styles.dateTime, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.datePart}>
            <View style={[styles.leadingIcon, { backgroundColor: colors.surfaceMuted }]}><CalendarDays color={colors.primaryDark} size={22} /></View>
            <View>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>Ngày</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>22/06/2024</Text>
            </View>
          </View>
          <View style={[styles.timeDivider, { backgroundColor: colors.border }]} />
          <View style={styles.datePart}>
            <View style={[styles.leadingIcon, { backgroundColor: colors.surfaceMuted }]}><Clock3 color={colors.primaryDark} size={22} /></View>
            <View>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>Giờ</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>20:00</Text>
            </View>
          </View>
          <ChevronRight color={colors.textSecondary} size={20} />
        </Pressable>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Kiểu lặp lại</Text>
        <View style={[styles.optionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ReminderOption colors={colors} description="Nhắc hẹn một lần duy nhất" icon={CalendarX2} label="Không lặp lại" onPress={() => setRepeat('none')} selected={repeat === 'none'} />
          <ReminderOption colors={colors} description="Nhắc hẹn mỗi ngày" icon={RotateCw} label="Hàng ngày" onPress={() => setRepeat('daily')} selected={repeat === 'daily'} />
          <ReminderOption colors={colors} description="Nhắc hẹn vào một ngày cố định mỗi tuần" icon={CalendarClock} label="Hàng tuần" onPress={() => setRepeat('weekly')} selected={repeat === 'weekly'} />
          <ReminderOption colors={colors} description="Nhắc hẹn vào nhiều ngày mỗi tuần" icon={CalendarCheck2} label="Nhiều ngày hàng tuần" onPress={() => setRepeat('multi-weekly')} selected={repeat === 'multi-weekly'} />
          <ReminderOption colors={colors} description="Nhắc hẹn vào một ngày cố định mỗi tháng" icon={CalendarCheck2} label="Hàng tháng" onPress={() => setRepeat('monthly')} selected={repeat === 'monthly'} />
          <ReminderOption colors={colors} description="Nhắc hẹn vào một ngày cố định mỗi năm" icon={CalendarCheck2} label="Hàng năm" onPress={() => setRepeat('yearly')} selected={repeat === 'yearly'} last />
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Nhắc cho</Text>
        <View style={[styles.optionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ReminderOption colors={colors} description="Chỉ bạn sẽ nhận được nhắc nhở này" icon={User} label="Chỉ mình tôi" onPress={() => setAudience('self')} selected={audience === 'self'} />
          <ReminderOption colors={colors} description="Bạn và đối phương sẽ nhận được nhắc nhở" icon={Users} label="Cả hai" onPress={() => setAudience('both')} selected={audience === 'both'} last />
        </View>

        <Text style={[styles.fieldLabel, { color: colors.text }]}>Ghi chú (tùy chọn)</Text>
        <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.leadingIcon, { backgroundColor: colors.surfaceMuted }]}><FileCheck2 color={colors.primaryDark} size={21} /></View>
          <TextInput
            maxLength={200}
            onChangeText={setNote}
            placeholder="Thêm ghi chú cho nhắc hẹn..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.inputText, { color: colors.text }]}
            value={note}
          />
          <Text style={[styles.counter, { color: colors.textSecondary }]}>{note.length}/200</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(12, insets.bottom + 8) }]}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.cancelButton, { borderColor: colors.border }]}>
          <Text style={[styles.cancelText, { color: colors.text }]}>Hủy bỏ</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={submitReminder} style={[styles.createButton, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.createText}>Tạo nhắc hẹn</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReminderOption({
  colors,
  description,
  icon: Icon,
  label,
  last = false,
  onPress,
  selected,
}: {
  colors: AppColors;
  description: string;
  icon: typeof CalendarClock;
  label: string;
  last?: boolean;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[
        styles.option,
        !last && { borderBottomColor: colors.border, borderBottomWidth: border.thin },
        selected && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <View style={[styles.radioOuter, { borderColor: selected ? colors.primaryDark : colors.border }]}>
        {selected ? <View style={[styles.radioInner, { backgroundColor: colors.primaryDark }]} /> : null}
      </View>
      <View style={[styles.optionIcon, { backgroundColor: colors.surfaceMuted }]}><Icon color={colors.primaryDark} size={22} /></View>
      <View style={styles.grow}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, marginHorizontal: -12, marginTop: -14, marginBottom: Platform.OS === 'ios' ? -30 : -24 },
  header: { minHeight: 56, paddingHorizontal: spacing.sm + spacing.xs, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: touchTarget.minimum, height: touchTarget.minimum, alignItems: 'center', justifyContent: 'center' },
  headerShield: { marginLeft: 'auto' },
  title: { flex: 1, fontSize: typography.size.xl - 2, fontWeight: typography.weight.black, textAlign: 'center' },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  description: { marginTop: spacing.md - spacing.xxs, marginBottom: spacing.md + spacing.xxs, fontSize: typography.size.xs, lineHeight: 18, fontWeight: typography.weight.semibold, textAlign: 'center' },
  fieldLabel: { marginTop: spacing.md + spacing.xxs, marginBottom: spacing.sm, fontSize: typography.size.sm, fontWeight: typography.weight.black },
  input: { minHeight: 52, borderWidth: border.thin, borderRadius: radius.md, paddingHorizontal: spacing.sm + spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  leadingIcon: { width: 38, height: 38, borderRadius: radius.md - 1, alignItems: 'center', justifyContent: 'center' },
  inputText: { flex: 1, minHeight: 48, paddingVertical: 0, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  counter: { fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  dateTime: { minHeight: 66, borderWidth: border.thin, borderRadius: radius.md + 1, paddingHorizontal: spacing.sm + spacing.xxs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  datePart: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeDivider: { width: border.thin, height: 38 },
  meta: { fontSize: typography.size.xs - 2, fontWeight: typography.weight.semibold },
  dateValue: { marginTop: spacing.xxs, fontSize: typography.size.xs, fontWeight: typography.weight.extraBold },
  optionsCard: { borderWidth: border.thin, borderRadius: radius.md + 1, overflow: 'hidden' },
  option: { minHeight: 68, paddingHorizontal: spacing.sm + spacing.xs, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + spacing.xxs },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  optionIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.black },
  optionDescription: { marginTop: spacing.xxs + 1, fontSize: typography.size.xs - 2, lineHeight: 15, fontWeight: typography.weight.semibold },
  grow: { flex: 1, minWidth: 0 },
  footer: { borderTopWidth: border.thin, paddingHorizontal: spacing.sm + spacing.xs, paddingTop: spacing.sm + spacing.xxs, flexDirection: 'row', gap: spacing.sm + spacing.xxs },
  cancelButton: { flex: 1, minHeight: 52, borderWidth: border.thin, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  createButton: { flex: 1, minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  createText: { color: palette.white, fontSize: typography.size.sm, fontWeight: typography.weight.black },
});
