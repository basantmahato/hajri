import type { DrizzleDB } from '../config/database.js';
import { UserRepository } from '../repository/user.repository.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';
import { createUserRoutes as setupUserRoutes } from '../routes/user.routes.js';

export const createUserRoutes = (db: DrizzleDB) => {
  const repo = new UserRepository(db);
  const service = new UserService(repo);
  const controller = new UserController(service);
  return setupUserRoutes(controller);
};
