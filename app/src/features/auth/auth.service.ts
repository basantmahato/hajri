import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { apiClient } from '../../core/network/api-client';
import type { LoginDto, RegisterDto, AuthResponse, User } from './types';

WebBrowser.maybeCompleteAuthSession();

const getAuthServerUrl = (): string => {
  if (process.env.EXPO_PUBLIC_AUTH_URL) {
    return process.env.EXPO_PUBLIC_AUTH_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: data.email.trim(),
      password: data.password,
    });
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
    });
    return response.data;
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/otp/verify', {
      phone,
      otp,
    });
    return response.data;
  },

  async loginWithGoogle(): Promise<AuthResponse | null> {
    const serverUrl = getAuthServerUrl();
    const callbackUrl = Linking.createURL('/');
    const authUrl = `${serverUrl}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(callbackUrl)}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = authUrl;
      return null;
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, callbackUrl);

    if (result.type === 'success') {
      // Try fetching current session from backend
      try {
        const user = await this.getProfile();
        return {
          token: 'better-auth-session',
          user,
        };
      } catch {
        return null;
      }
    }

    return null;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },
};
