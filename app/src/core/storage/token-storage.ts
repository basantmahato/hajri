import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: '@hajri/auth_token',
  USER: '@hajri/auth_user',
  ONBOARDING_DONE: '@hajri/onboarding_done',
  ACTIVE_ORG: '@hajri/active_org',
} as const;

export const TokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (e) {
      console.warn('Failed to save token to storage', e);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (e) {
      console.warn('Failed to remove token', e);
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUser<T>(user: T): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user', e);
    }
  },

  async isOnboardingDone(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingDone(done: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, done ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to set onboarding state', e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ACTIVE_ORG,
      ]);
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  },
};
