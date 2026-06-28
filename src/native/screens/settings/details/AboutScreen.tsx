import { Text, View } from 'react-native';
import { AppBrandLogo } from '../../../components/AppLogo';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import type { AppColors } from '../../../theme';
import { settingsStyles as styles } from '../settingsStyles';

export function AboutScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  return (
    <ScreenScroll id="screen-settings-about" colors={colors}>
      <AppHeader colors={colors} title="Về Identra" onBack={onBack} />
      <View style={styles.helpHero}>
        <AppBrandLogo colors={colors} logoSize={86} wordmarkSize={28} vertical />
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>Ví danh tính số tự chủ, minh bạch và an toàn.</Text>
      </View>
      <Card colors={colors}>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Phiên bản</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Nền tảng</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>Expo / React Native</Text>
        </View>
        <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Hỗ trợ</Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>Android và iOS</Text>
        </View>
      </Card>
    </ScreenScroll>
  );
}
