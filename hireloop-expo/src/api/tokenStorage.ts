import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';

const TOKEN_KEY = 'hireloop_candidate_token';

let memoryToken: string | null = null;

function getWebStorage(): Storage | null {
  if (typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  return globalThis.localStorage;
}

export const tokenStorage = {
  async get(): Promise<string | null> {
    if (memoryToken) {
      return memoryToken;
    }

    const storedToken = Platform.OS === 'web'
      ? getWebStorage()?.getItem(TOKEN_KEY) ?? null
      : await SecureStore.getItemAsync(TOKEN_KEY);

    memoryToken = storedToken;
    return storedToken;
  },

  async set(token: string, persistent = true): Promise<void> {
    memoryToken = token;

    if (Platform.OS === 'web') {
      const storage = getWebStorage();
      if (persistent) {
        storage?.setItem(TOKEN_KEY, token);
      } else {
        storage?.removeItem(TOKEN_KEY);
      }
      return;
    }

    if (persistent) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },

  async remove(): Promise<void> {
    memoryToken = null;

    if (Platform.OS === 'web') {
      getWebStorage()?.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
