import type { AppColors } from '../theme';
import { PhoneAuthScreen } from './PhoneAuthScreen';

interface Props {
  colors: AppColors;
  onBack: () => void;
  onContinue: (phoneNumber: string) => void;
  onLogin: () => void;
}

export function RegisterScreen({ colors, onBack, onContinue, onLogin }: Props) {
  return (
    <PhoneAuthScreen
      colors={colors}
      description="Sử dụng số điện thoại để tạo ví định tính của bạn."
      mode="register"
      onBack={onBack}
      onContinue={onContinue}
      onSwitch={onLogin}
      switchAction="Đăng nhập ngay"
      switchPrompt="Bạn đã có tài khoản?"
      title="Đăng ký"
    />
  );
}
