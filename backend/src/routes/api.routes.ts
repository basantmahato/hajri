import { Router } from 'express';
import { db } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  createAuthRoutes,
  createUserRoutes,
  createOrganizationRoutes,
  createMembershipRoutes,
  createAttendanceRoutes,
} from '../factories/index.js';

export const createApiRouter = (): Router => {
  const api = Router();
  const v1 = Router();
  const mobile = Router();
  const web = Router();

  // Public routes (no auth required)
  mobile.use('/auth', createAuthRoutes(db));
  web.use('/auth', createAuthRoutes(db));

  // Protected routes (auth required)
  mobile.use('/users', authMiddleware, createUserRoutes(db));
  mobile.use('/organizations', authMiddleware, createOrganizationRoutes(db));
  mobile.use('/memberships', authMiddleware, createMembershipRoutes(db));
  mobile.use('/attendance', authMiddleware, createAttendanceRoutes(db));

  web.use('/users', authMiddleware, createUserRoutes(db));
  web.use('/organizations', authMiddleware, createOrganizationRoutes(db));
  web.use('/memberships', authMiddleware, createMembershipRoutes(db));
  web.use('/attendance', authMiddleware, createAttendanceRoutes(db));

  v1.use('/mobile', mobile);
  v1.use('/web', web);

  api.use('/v1', v1);
  return api;
};
