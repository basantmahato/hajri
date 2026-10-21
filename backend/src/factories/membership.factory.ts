import type { DrizzleDB } from '../config/database.js';
import { MembershipRepository } from '../repository/membership.repository.js';
import { UserRepository } from '../repository/user.repository.js';
import { AttendanceRepository } from '../repository/attendance.repository.js';
import { MembershipService } from '../services/membership.service.js';
import { MembershipController } from '../controllers/membership.controller.js';
import { createMembershipRoutes as setupMembershipRoutes } from '../routes/membership.routes.js';

export const createMembershipRoutes = (db: DrizzleDB) => {
  const membershipRepo = new MembershipRepository(db);
  const userRepo = new UserRepository(db);
  const attendanceRepo = new AttendanceRepository(db);
  const service = new MembershipService(membershipRepo, userRepo, attendanceRepo);
  const controller = new MembershipController(service);
  return setupMembershipRoutes(controller);
};
