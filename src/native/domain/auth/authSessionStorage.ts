import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_SESSION_STORAGE_KEY = 'identra.native.auth.session.v1';
const AUTH_DEVICE_ID_STORAGE_KEY = 'identra.native.auth.deviceId.v1';
const AUTH_KEYCHAIN_SERVICE = 'identra.native.auth';
const AUTH_LEGACY_SESSION_STORAGE_KEY = AUTH_SESSION_STORAGE_KEY;
const AUTH_LEGACY_DEVICE_ID_STORAGE_KEY = AUTH_DEVICE_ID_STORAGE_KEY;

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: AUTH_KEYCHAIN_SERVICE,
};

export interface StoredAuthSession {
  accessToken: string;
  accessTokenExpiresAt: string;
  deviceId: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  sessionId: string;
  tokenType: string;
  userId: string;
}

export async function loadStoredAuthSession(): Promise<StoredAuthSession | null> {
  try {
    const saved = await getSecureItem(AUTH_SESSION_STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved) as StoredAuthSession;
    }

    const legacySession = await loadLegacyAuthSession();

    if (legacySession) {
      await saveStoredAuthSession(legacySession);
      await AsyncStorage.removeItem(AUTH_LEGACY_SESSION_STORAGE_KEY);
      return legacySession;
    }

    return null;
  } catch {
    return null;
  }
}

async function loadLegacyAuthSession(): Promise<StoredAuthSession | null> {
  try {
    const saved = await AsyncStorage.getItem(AUTH_LEGACY_SESSION_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as StoredAuthSession) : null;
  } catch {
    return null;
  }
}

export async function saveStoredAuthSession(session: StoredAuthSession): Promise<void> {
  await setSecureItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredAuthSession(): Promise<void> {
  await deleteSecureItem(AUTH_SESSION_STORAGE_KEY);
  await AsyncStorage.removeItem(AUTH_LEGACY_SESSION_STORAGE_KEY);
}

export async function loadStoredDeviceId(): Promise<string | null> {
  const deviceId = await getSecureItem(AUTH_DEVICE_ID_STORAGE_KEY);

  if (deviceId) {
    return deviceId;
  }

  const legacyDeviceId = await AsyncStorage.getItem(AUTH_LEGACY_DEVICE_ID_STORAGE_KEY);

  if (legacyDeviceId) {
    await saveStoredDeviceId(legacyDeviceId);
    await AsyncStorage.removeItem(AUTH_LEGACY_DEVICE_ID_STORAGE_KEY);
  }

  return legacyDeviceId;
}

export async function saveStoredDeviceId(deviceId: string): Promise<void> {
  await setSecureItem(AUTH_DEVICE_ID_STORAGE_KEY, deviceId);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (!(await SecureStore.isAvailableAsync())) {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key, secureStoreOptions);
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, secureStoreOptions);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key, secureStoreOptions);
}
