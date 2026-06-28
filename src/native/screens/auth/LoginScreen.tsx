import type { AppColors } from '../../theme';
import { useI18n } from '../../i18n';
import { PhoneAuthScreen } from './PhoneAuthScreen';

interface Props {
  colors: AppColors;
  onBack: () => void;
  onContinue: (phoneNumber: string) => void;
  onRegister: () => void;
}

export function LoginScreen({ colors, onBack, onContinue, onRegister }: Props) {
  const { t } = useI18n();

  return (
    <PhoneAuthScreen
      colors={colors}
      description={t('auth.login.description')}
      mode="login"
      onBack={onBack}
      onContinue={onContinue}
      onSwitch={onRegister}
      switchAction={t('auth.login.switchAction')}
      switchPrompt={t('auth.login.switchPrompt')}
      title={t('auth.login.title')}
    />
  );
}
