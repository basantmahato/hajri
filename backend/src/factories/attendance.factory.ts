import type { DrizzleDB } from '../config/database.js';
import { AttendanceRepository } from '../repository/attendance.repository.js';
import { MembershipRepository } from '../repository/membership.repository.js';
import { AttendanceService } from '../services/attendance.service.js';
import { AttendanceController } from '../controllers/attendance.controller.js';
import { createAttendanceRoutes as setupAttendanceRoutes } from '../routes/attendance.routes.js';

export const createAttendanceRoutes = (db: DrizzleDB) => {
  const attendanceRepo = new AttendanceRepository(db);
  const membershipRepo = new MembershipRepository(db);
  const service = new AttendanceService(attendanceRepo, membershipRepo);
  const controller = new AttendanceController(service);
  return setupAttendanceRoutes(controller);
};
