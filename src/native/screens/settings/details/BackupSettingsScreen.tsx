import { useState } from 'react';
import { CloudUpload, Download, RefreshCw } from 'lucide-react-native';
import { Alert, Text, View } from 'react-native';
import { AppHeader, Card, ScreenScroll } from '../../../components/AppUiPrimitives';
import type { AppColors } from '../../../theme';
import { SettingToggle } from '../SettingToggle';
import { SettingsLink } from '../components/SettingsLink';
import { settingsStyles as styles } from '../settingsStyles';

export function BackupSettingsScreen({ colors, onBack }: { colors: AppColors; onBack: () => void }) {
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <ScreenScroll id="screen-settings-backup" colors={colors}>
      <AppHeader colors={colors} title="Backup" onBack={onBack} />
      <View style={styles.helpHero}>
        <View style={[styles.helpIcon, { backgroundColor: colors.surfaceMuted }]}>
          <CloudUpload color={colors.primaryDark} size={38} />
        </View>
        <Text style={[styles.helpTitle, { color: colors.text }]}>Dữ liệu ví đã an toàn</Text>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>Bản sao lưu gần nhất được tạo lúc 10:30, ngày 20/06/2024.</Text>
      </View>
      <Card colors={colors} style={styles.settingsList}>
        <SettingToggle colors={colors} icon={RefreshCw} title="Sao lưu tự động" description="Tự động sao lưu khi có thay đổi" value={autoBackup} onValueChange={setAutoBackup} />
        <SettingsLink colors={colors} icon={CloudUpload} title="Sao lưu ngay" description="Tạo một bản sao lưu mới" onPress={() => Alert.alert('Đã sao lưu', 'Dữ liệu ví đã được sao lưu thành công.')} divider />
        <SettingsLink colors={colors} icon={Download} title="Khôi phục dữ liệu" description="Khôi phục từ bản sao lưu gần nhất" onPress={() => Alert.alert('Khôi phục dữ liệu', 'Đây là luồng khôi phục dữ liệu mẫu.')} divider />
      </Card>
    </ScreenScroll>
  );
}
