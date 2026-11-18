// A fake of the expo-secure-store functions the wallet adapters call, modelled on
// node_modules/expo-secure-store 56.0.4 (SecureStore.d.ts, ios/SecureStoreModule.swift,
// android/.../SecureStoreModule.kt):
// - items are namespaced by keychainService (iOS kSecAttrService, Android key alias);
// - keys must match [A-Za-z0-9._-]+ (native InvalidKeyException otherwise);
// - getItemAsync resolves null when the item is absent AND when its biometric-bound key was
//   invalidated (Android catches KeyPermanentlyInvalidatedException and returns null; iOS
//   biometryCurrentSet items become errSecItemNotFound);
// - a cancelled biometric prompt and a locked device reject with the native messages.
const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 6;

function createFakeSecureStore() {
  const items = new Map();
  const state = {
    calls: [],
    locked: false,
    cancelNextPrompt: false,
    failNextWrite: null,
    // Simulates a biometric change: every requireAuthentication item becomes unreadable.
    invalidateBiometricKeys() {
      for (const item of items.values()) if (item.requireAuthentication) item.invalidated = true;
    },
    items,
  };
  const id = (key, options = {}) => `${options.keychainService ?? 'default'}::${key}`;
  const checkKey = (key) => {
    if (typeof key !== 'string' || !/^[\w.-]+$/.test(key)) throw new Error('Invalid key');
  };
  const prompt = (options) => {
    if (options?.requireAuthentication && state.cancelNextPrompt) {
      state.cancelNextPrompt = false;
      throw new Error('Could not Authenticate the user: User canceled the authentication');
    }
  };
  const lockCheck = (options) => {
    if (state.locked && options?.keychainAccessible === WHEN_UNLOCKED_THIS_DEVICE_ONLY) {
      throw new Error('User interaction is not allowed.');
    }
  };

  return {
    state,
    WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    async getItemAsync(key, options) {
      await Promise.resolve();
      state.calls.push(['get', key, options]);
      checkKey(key);
      lockCheck(options);
      const item = items.get(id(key, options));
      if (!item) return null;
      prompt(item);
      return item.invalidated ? null : item.value;
    },
    async setItemAsync(key, value, options) {
      await Promise.resolve();
      state.calls.push(['set', key, options]);
      checkKey(key);
      lockCheck(options);
      if (state.failNextWrite) {
        const message = state.failNextWrite;
        state.failNextWrite = null;
        throw new Error(message);
      }
      prompt(options);
      items.set(id(key, options), { value, requireAuthentication: Boolean(options?.requireAuthentication), invalidated: false });
    },
    async deleteItemAsync(key, options) {
      await Promise.resolve();
      state.calls.push(['delete', key, options]);
      checkKey(key);
      items.delete(id(key, options));
    },
  };
}

module.exports = { createFakeSecureStore, WHEN_UNLOCKED_THIS_DEVICE_ONLY };
