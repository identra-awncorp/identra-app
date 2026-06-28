import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PersistedAppState } from '../domain/app-store/appStoreStateService';

const APP_STATE_STORAGE_KEY = 'identra.native.state.v1';

export async function loadPersistedAppState(): Promise<PersistedAppState | null> {
  try {
    const saved = await AsyncStorage.getItem(APP_STATE_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as PersistedAppState) : null;
  } catch {
    return null;
  }
}

export async function savePersistedAppState(state: PersistedAppState): Promise<void> {
  await AsyncStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
}
