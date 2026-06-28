import { BookOpen, ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import type { AppColors } from '../../../theme';
import { settingsStyles as styles } from '../settingsStyles';

export function HelpScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  return (
    <ScreenScroll id="screen-settings-help" colors={colors}>
      <AppHeader colors={colors} title="Trung tâm trợ giúp" onBack={onBack} />
      <View style={styles.helpHero}>
        <View style={[styles.helpIcon, { backgroundColor: colors.surfaceMuted }]}>
          <BookOpen color={colors.primaryDark} size={36} />
        </View>
        <Text style={[styles.helpTitle, { color: colors.text }]}>Bạn cần hỗ trợ?</Text>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>Tìm câu trả lời về thực chứng, chia sẻ dữ liệu và bảo mật ví.</Text>
      </View>
      <Card colors={colors} style={styles.settingsList}>
        {['Cách nhận một thực chứng mới', 'Cách chia sẻ dữ liệu an toàn', 'Khôi phục quyền truy cập ví', 'Báo cáo yêu cầu dữ liệu đáng ngờ'].map((title, index) => (
          <View key={title} style={[styles.helpRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.settingsTitle, { color: colors.text, flex: 1 }]}>{title}</Text>
            <ChevronRight color={colors.textSecondary} size={20} />
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}
