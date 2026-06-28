import type { AppColors } from '../../theme';
import { PhoneAuthScreen } from './PhoneAuthScreen';

interface Props {
  colors: AppColors;
  onBack: () => void;
  onContinue: (phoneNumber: string) => void;
  onRegister: () => void;
}

export function LoginScreen({ colors, onBack, onContinue, onRegister }: Props) {
  return (
    <PhoneAuthScreen
      colors={colors}
      description="Sử dụng số điện thoại để truy cập ví định tính của bạn."
      mode="login"
      onBack={onBack}
      onContinue={onContinue}
      onSwitch={onRegister}
      switchAction="Đăng ký ngay"
      switchPrompt="Bạn chưa có tài khoản?"
      title="Đăng nhập"
    />
  );
}
