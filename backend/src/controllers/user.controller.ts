import { z } from 'zod';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { UserService } from '../services/user.service.js';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  avatar: z.string().url().optional(),
});

export class UserController {
  constructor(private userService: UserService) {}

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.userService.getProfile(req.userId!);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateProfileSchema.parse(req.body);
      const profile = await this.userService.updateProfile(req.userId!, data);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  search = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q || req.query.query || '') as string;
      const results = await this.userService.searchUsers(query);
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };
}
