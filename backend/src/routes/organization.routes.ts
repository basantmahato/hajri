import { Router } from 'express';
import type { OrganizationController } from '../controllers/organization.controller.js';

export const createOrganizationRoutes = (controller: OrganizationController): Router => {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
};
