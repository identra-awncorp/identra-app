import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_BALANCE_VISIBLE_KEY = 'identra.payment.balanceVisible.v1';

export async function loadPaymentBalanceVisible(): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem(PAYMENT_BALANCE_VISIBLE_KEY);
    return saved ? JSON.parse(saved) === true : true;
  } catch {
    return true;
  }
}

export async function savePaymentBalanceVisible(visible: boolean): Promise<void> {
  await AsyncStorage.setItem(PAYMENT_BALANCE_VISIBLE_KEY, JSON.stringify(visible));
}
