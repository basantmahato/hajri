import { Router } from 'express';
import type { AttendanceController } from '../controllers/attendance.controller.js';

export const createAttendanceRoutes = (controller: AttendanceController): Router => {
  const router = Router();

  router.post('/', controller.mark);
  router.post('/bulk', controller.bulkMark);
  router.get('/org/:orgId', controller.getByDate);
  router.get('/org/:orgId/range', controller.getByDateRange);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
};
