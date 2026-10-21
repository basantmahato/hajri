import { Router } from 'express';
import type { UserController } from '../controllers/user.controller.js';

export const createUserRoutes = (controller: UserController): Router => {
  const router = Router();

  router.get('/profile', controller.getProfile);
  router.get('/me', controller.getProfile);
  router.patch('/profile', controller.updateProfile);
  router.get('/search', controller.search);

  return router;
};
