import type { DrizzleDB } from '../config/database.js';
import { UserRepository } from '../repository/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import { createAuthRoutes as setupAuthRoutes } from '../routes/auth.routes.js';

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
