import { View } from 'react-native';
import type { AppColors } from '../../theme';

export function PaymentScreen({ colors }: { colors: AppColors }) {
  return (
    <View
      nativeID="screen-payment"
      testID="screen-payment"
      style={{ flex: 1, backgroundColor: colors.background }}
    />
  );
}
