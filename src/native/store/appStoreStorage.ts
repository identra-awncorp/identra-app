import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  APP_STATE_STORAGE_VERSION,
  createPersistedIdentityEnvelope,
  createPersistedSettingsEnvelope,
  migrateLegacyAppState,
  parsePersistedIdentityEnvelope,
  parsePersistedSettingsEnvelope,
} from '../domain/app-store/appStatePersistence';
import type { PersistedAppState } from '../domain/app-store/appStoreStateService';
import { initialAppStoreState } from './appStoreInitialState';

const LEGACY_APP_STATE_STORAGE_KEY = 'identra.native.state.v1';
const SETTINGS_STORAGE_KEY = 'identra.native.settings.v2';
const IDENTITY_MANIFEST_KEY = 'identra.native.identity.v2.manifest';
const IDENTITY_CHUNK_PREFIX = 'identra.native.identity.v2';
const IDENTITY_CHUNK_SIZE = 500;
const MAX_IDENTITY_CHUNKS = 100;
const IDENTITY_KEYCHAIN_SERVICE = 'identra.native.identity';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: IDENTITY_KEYCHAIN_SERVICE,
};

interface IdentityManifest {
  chunks: number;
  generation: string;
  version: typeof APP_STATE_STORAGE_VERSION;
}

function parseJson(value: string | null): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function parseIdentityManifest(value: unknown): IdentityManifest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const manifest = value as Record<string, unknown>;
  if (
    manifest.version !== APP_STATE_STORAGE_VERSION ||
    typeof manifest.generation !== 'string' ||
    !/^[a-z0-9-]{1,64}$/i.test(manifest.generation) ||
    !Number.isInteger(manifest.chunks) ||
    (manifest.chunks as number) < 1 ||
    (manifest.chunks as number) > MAX_IDENTITY_CHUNKS
  ) {
    return null;
  }

  return manifest as unknown as IdentityManifest;
}

function getIdentityChunkKey(generation: string, index: number): string {
  return `${IDENTITY_CHUNK_PREFIX}.${generation}.${index}`;
}

async function loadSecureIdentityEnvelope(): Promise<unknown> {
  if (!(await SecureStore.isAvailableAsync())) {
    return null;
  }

  const manifest = parseIdentityManifest(
    parseJson(await SecureStore.getItemAsync(IDENTITY_MANIFEST_KEY, secureStoreOptions)),
  );
  if (!manifest) return null;

  const chunks = await Promise.all(
    Array.from({ length: manifest.chunks }, (_, index) =>
      SecureStore.getItemAsync(
        getIdentityChunkKey(manifest.generation, index),
        secureStoreOptions,
      ),
    ),
  );

  if (chunks.some((chunk) => chunk === null)) {
    return null;
  }

  return parseJson(chunks.join(''));
}

async function removeIdentityGeneration(manifest: IdentityManifest | null): Promise<void> {
  if (!manifest) return;

  await Promise.all(
    Array.from({ length: manifest.chunks }, (_, index) =>
      SecureStore.deleteItemAsync(
        getIdentityChunkKey(manifest.generation, index),
        secureStoreOptions,
      ),
    ),
  );
}

async function saveSecureIdentityEnvelope(state: PersistedAppState): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) {
    return;
  }

  const previousManifest = parseIdentityManifest(
    parseJson(await SecureStore.getItemAsync(IDENTITY_MANIFEST_KEY, secureStoreOptions)),
  );
  const serialized = JSON.stringify(createPersistedIdentityEnvelope(state));
  const chunks = Array.from(
    { length: Math.ceil(serialized.length / IDENTITY_CHUNK_SIZE) },
    (_, index) =>
      serialized.slice(index * IDENTITY_CHUNK_SIZE, (index + 1) * IDENTITY_CHUNK_SIZE),
  );

  if (!chunks.length || chunks.length > MAX_IDENTITY_CHUNKS) {
    throw new Error('Encrypted identity state exceeds the supported local storage size.');
  }

  const generation = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await Promise.all(
    chunks.map((chunk, index) =>
      SecureStore.setItemAsync(
        getIdentityChunkKey(generation, index),
        chunk,
        secureStoreOptions,
      ),
    ),
  );

  const nextManifest: IdentityManifest = {
    version: APP_STATE_STORAGE_VERSION,
    chunks: chunks.length,
    generation,
  };
  await SecureStore.setItemAsync(
    IDENTITY_MANIFEST_KEY,
    JSON.stringify(nextManifest),
    secureStoreOptions,
  );
  await removeIdentityGeneration(previousManifest);
}

export async function loadPersistedAppState(): Promise<PersistedAppState | null> {
  try {
    const [settingsValue, identityValue, legacyValue] = await Promise.all([
      AsyncStorage.getItem(SETTINGS_STORAGE_KEY),
      loadSecureIdentityEnvelope(),
      AsyncStorage.getItem(LEGACY_APP_STATE_STORAGE_KEY),
    ]);
    const legacyState = migrateLegacyAppState(
      parseJson(legacyValue),
      initialAppStoreState,
    );
    const settings = parsePersistedSettingsEnvelope(parseJson(settingsValue));
    const identity = parsePersistedIdentityEnvelope(identityValue);
    const foundPersistedState = Boolean(legacyState || settings || identity);

    if (!foundPersistedState) {
      if (legacyValue) {
        await AsyncStorage.removeItem(LEGACY_APP_STATE_STORAGE_KEY);
      }
      return null;
    }

    const base = legacyState ?? initialAppStoreState;
    const state: PersistedAppState = {
      credentials: identity?.credentials ?? base.credentials,
      logs: identity?.logs ?? base.logs,
      profile: identity?.profile ?? base.profile,
      settings: settings ?? base.settings,
    };

    if (legacyValue) {
      await savePersistedAppState(state);
    }

    return state;
  } catch {
    return null;
  }
}

export async function savePersistedAppState(state: PersistedAppState): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(createPersistedSettingsEnvelope(state.settings)),
    ),
    saveSecureIdentityEnvelope(state),
  ]);
  await AsyncStorage.removeItem(LEGACY_APP_STATE_STORAGE_KEY);
}
