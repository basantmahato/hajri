import { Router } from 'express';
import type { MembershipController } from '../controllers/membership.controller.js';

export const createMembershipRoutes = (controller: MembershipController): Router => {
  const router = Router();

  router.post('/', controller.addMember);
  router.get('/org/:orgId', controller.listMembers);
  router.patch('/:id', controller.updateMember);
  router.delete('/:id', controller.removeMember);
  router.get('/org/:orgId/wages', controller.getWageReport);
  router.get('/org/:orgId/wage-report', controller.getWageReport);

  return router;
};
