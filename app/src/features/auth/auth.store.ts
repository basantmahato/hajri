import { create } from 'zustand';
import { TokenStorage } from '../../core/storage/token-storage';
import { authService } from './auth.service';
import type { AuthState, LoginDto, RegisterDto, User } from './types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  hasCompletedOnboarding: false,

  initialize: async () => {
    try {
      const [token, user, onboardingDone] = await Promise.all([
        TokenStorage.getToken(),
        TokenStorage.getUser<User>(),
        TokenStorage.isOnboardingDone(),
      ]);

      if (token && user) {
        set({
          token,
          user,
          isAuthenticated: true,
          hasCompletedOnboarding: onboardingDone,
          isLoading: false,
        });

        // Refresh profile in background
        authService
          .getProfile()
          .then(async (freshUser) => {
            await TokenStorage.setUser(freshUser);
            set({ user: freshUser });
          })
          .catch(() => {
            // Keep cached user
          });
      } else {
        // Also check if Better Auth session cookie exists on server
        authService
          .getProfile()
          .then(async (freshUser) => {
            const tempToken = 'better-auth-session';
            await Promise.all([
              TokenStorage.setToken(tempToken),
              TokenStorage.setUser(freshUser),
            ]);
            set({
              token: tempToken,
              user: freshUser,
              isAuthenticated: true,
              hasCompletedOnboarding: true,
              isLoading: false,
            });
          })
          .catch(() => {
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              hasCompletedOnboarding: onboardingDone,
              isLoading: false,
            });
          });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    await TokenStorage.setOnboardingDone(true);
    set({ hasCompletedOnboarding: true });
  },

  login: async (data: LoginDto) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(data);
      await Promise.all([
        TokenStorage.setToken(res.token),
        TokenStorage.setUser(res.user),
        TokenStorage.setOnboardingDone(true),
      ]);
      set({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        hasCompletedOnboarding: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterDto) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(data);
      await Promise.all([
        TokenStorage.setToken(res.token),
        TokenStorage.setUser(res.user),
        TokenStorage.setOnboardingDone(true),
      ]);
      set({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        hasCompletedOnboarding: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyOtp: async (phone: string, otp: string) => {
    set({ isLoading: true });
    try {
      const res = await authService.verifyOtp(phone, otp);
      await Promise.all([
        TokenStorage.setToken(res.token),
        TokenStorage.setUser(res.user),
        TokenStorage.setOnboardingDone(true),
      ]);
      set({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        hasCompletedOnboarding: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const res = await authService.loginWithGoogle();
      if (res) {
        await Promise.all([
          TokenStorage.setToken(res.token),
          TokenStorage.setUser(res.user),
          TokenStorage.setOnboardingDone(true),
        ]);
        set({
          token: res.token,
          user: res.user,
          isAuthenticated: true,
          hasCompletedOnboarding: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  bypassAuth: async (overrides?: Partial<User>) => {
    set({ isLoading: true });
    const devUser: User = {
      id: overrides?.id ?? 1,
      name: overrides?.name || 'Basant (Dev Admin)',
      email: overrides?.email || 'admin@hajri.app',
      phone: overrides?.phone || '+91 98765 43210',
      role: overrides?.role || 'owner',
    };
    const devToken = 'dev-bypass-token-' + Date.now();
    await Promise.all([
      TokenStorage.setToken(devToken),
      TokenStorage.setUser(devUser),
      TokenStorage.setOnboardingDone(true),
    ]);
    set({
      token: devToken,
      user: devUser,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await TokenStorage.clearAll();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
