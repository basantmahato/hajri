// Auth-related types (used by auth.controller / auth.service / user.repository)
export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role?: string;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Profile-related types
export interface UserProfileResponseDto {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

