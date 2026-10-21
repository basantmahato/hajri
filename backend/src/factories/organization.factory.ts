import type { DrizzleDB } from '../config/database.js';
import { OrganizationRepository } from '../repository/organization.repository.js';
import { MembershipRepository } from '../repository/membership.repository.js';
import { OrganizationService } from '../services/organization.service.js';
import { OrganizationController } from '../controllers/organization.controller.js';
import { createOrganizationRoutes as setupOrganizationRoutes } from '../routes/organization.routes.js';

export const createOrganizationRoutes = (db: DrizzleDB) => {
  const orgRepo = new OrganizationRepository(db);
  const membershipRepo = new MembershipRepository(db);
  const service = new OrganizationService(orgRepo, membershipRepo);
  const controller = new OrganizationController(service);
  return setupOrganizationRoutes(controller);
};
