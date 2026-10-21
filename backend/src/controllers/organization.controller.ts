import { z } from 'zod';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { OrganizationService } from '../services/organization.service.js';

const createOrgSchema = z.object({
  name: z.string().min(2),
  type: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  timezone: z.string().optional(),
  settings: z.string().optional(),
});

export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = createOrgSchema.parse(req.body);
      const org = await this.organizationService.create(req.userId!, data);
      res.status(201).json(org);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const org = await this.organizationService.getById(Number(id), req.userId!);
      res.status(200).json(org);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgs = await this.organizationService.listByUser(req.userId!);
      res.status(200).json(orgs);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = updateOrgSchema.parse(req.body);
      const org = await this.organizationService.update(Number(id), req.userId!, data);
      res.status(200).json(org);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.organizationService.delete(Number(id), req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
