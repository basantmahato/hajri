import type { DrizzleDB } from '../config/database';
import { UserRepository } from '../repository/user.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { createAuthRoutes as setupAuthRoutes } from '../routes/auth.routes';

export const createAuthController = (db: DrizzleDB) => {
  const userRepository = new UserRepository(db);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);
  return authController;
};

export const createAuthRoutes = (db: DrizzleDB) => {
  const authController = createAuthController(db);
  return setupAuthRoutes(authController);
};
