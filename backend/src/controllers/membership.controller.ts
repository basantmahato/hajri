import { z } from 'zod';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { MembershipService } from '../services/membership.service.js';

const addMemberSchema = z.object({
  userId: z.number().int().positive().optional(),
  name: z.string().min(1, 'Worker name is required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  age: z.coerce.number().optional(),
  organizationId: z.number().int().positive(),
  role: z.enum(['admin', 'manager', 'employee', 'member']).optional(),
  dailyWage: z.string().optional(),
}).refine((data) => (data.name && data.name.trim().length > 0) || data.userId !== undefined || (data.phone && data.phone.trim().length > 0) || (data.email && data.email.trim().length > 0), {
  message: 'Worker name is required',
});

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'manager', 'employee', 'member']).optional(),
  dailyWage: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

const wageReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  addMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = addMemberSchema.parse(req.body);
      const member = await this.membershipService.addMember(req.userId!, data);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  };

  updateMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = updateMemberSchema.parse(req.body);
      const member = await this.membershipService.updateMember(req.userId!, Number(id), data);
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.membershipService.removeMember(req.userId!, Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const members = await this.membershipService.listMembers(req.userId!, Number(orgId));
      res.status(200).json(members);
    } catch (error) {
      next(error);
    }
  };

  getWageReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const { month, year } = wageReportQuerySchema.parse(req.query);
      const report = await this.membershipService.getWageReport(req.userId!, Number(orgId), month, year);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };
}
