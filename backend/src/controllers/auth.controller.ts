import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../services/auth.service.js';
import type { CreateUserDto, LoginDto } from '../types/user.types.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body) as CreateUserDto;
      const result = await this.authService.register(validatedData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body) as LoginDto;
      const result = await this.authService.login(validatedData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
