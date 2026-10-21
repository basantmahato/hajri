export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  organizationName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  bypassAuth: (overrides?: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  initialize: () => Promise<void>;
}
