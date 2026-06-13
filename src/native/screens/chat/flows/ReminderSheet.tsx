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
import type { AppColors } from '../../../theme';

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
        !last && { borderBottomColor: colors.border, borderBottomWidth: 1 },
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
  header: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerShield: { marginLeft: 'auto' },
  title: { flex: 1, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  description: { marginTop: 14, marginBottom: 18, fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center' },
  fieldLabel: { marginTop: 18, marginBottom: 8, fontSize: 14, fontWeight: '900' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  leadingIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  inputText: { flex: 1, minHeight: 48, paddingVertical: 0, fontSize: 12, fontWeight: '600' },
  counter: { fontSize: 10, fontWeight: '600' },
  dateTime: { minHeight: 66, borderWidth: 1, borderRadius: 13, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  datePart: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeDivider: { width: 1, height: 38 },
  meta: { fontSize: 10, fontWeight: '600' },
  dateValue: { marginTop: 2, fontSize: 12, fontWeight: '800' },
  optionsCard: { borderWidth: 1, borderRadius: 13, overflow: 'hidden' },
  option: { minHeight: 68, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  optionIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontSize: 12, fontWeight: '900' },
  optionDescription: { marginTop: 3, fontSize: 10, lineHeight: 15, fontWeight: '600' },
  grow: { flex: 1, minWidth: 0 },
  footer: { borderTopWidth: 1, paddingHorizontal: 12, paddingTop: 10, flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, fontWeight: '900' },
  createButton: { flex: 1, minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  createText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
