import { Router } from 'express';
import type { DrizzleDB } from '../config/database';
import { createAuthRoutes } from '../factories';

export const createApiRouter = (db: DrizzleDB): Router => {
  const api = Router();
  const v1 = Router();
  const mobile = Router();
  const web = Router();

  v1.use('/auth', createAuthRoutes(db));
  v1.use('/mobile', mobile);
  v1.use('/web', web);

  api.use('/v1', v1);
  return api;
};
