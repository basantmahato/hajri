import type { UserRepository } from '../repository/user.repository.js';
import type { UserProfileResponseDto, UpdateUserProfileDto } from '../types/user.types.js';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getProfile(userId: number): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: number, data: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updated = await this.userRepository.update(userId, data);

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      avatar: updated.avatar,
      role: updated.role,
      isActive: updated.isActive,
      isEmailVerified: updated.isEmailVerified,
      lastLoginAt: updated.lastLoginAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async searchUsers(query: string): Promise<UserProfileResponseDto[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    const found = await this.userRepository.search(query.trim());
    return found.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      avatar: u.avatar,
      role: u.role,
      isActive: u.isActive,
      isEmailVerified: u.isEmailVerified,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }
}
