import { z } from 'zod';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { AttendanceService } from '../services/attendance.service.js';

const markAttendanceSchema = z.object({
  userId: z.number().int().positive().optional(),
  employeeId: z.number().int().positive().optional(),
  organizationId: z.number().int().positive(),
  date: z.string(),
  status: z.enum(['present', 'absent', 'half_day', 'leave']),
  notes: z.string().optional(),
}).refine((data) => data.userId !== undefined || data.employeeId !== undefined, {
  message: 'Either userId or employeeId must be provided',
});

const bulkMarkAttendanceSchema = z.object({
  organizationId: z.number().int().positive(),
  date: z.string(),
  entries: z.array(z.object({
    userId: z.number().int().positive().optional(),
    employeeId: z.number().int().positive().optional(),
    status: z.enum(['present', 'absent', 'half_day', 'leave']),
    notes: z.string().optional(),
  }).refine((entry) => entry.userId !== undefined || entry.employeeId !== undefined, {
    message: 'Each entry must provide userId or employeeId',
  })).min(1),
});

const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'half_day', 'leave']).optional(),
  notes: z.string().optional(),
});

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  mark = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = markAttendanceSchema.parse(req.body);
      const record = await this.attendanceService.markAttendance(req.userId!, data);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  bulkMark = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = bulkMarkAttendanceSchema.parse(req.body);
      const records = await this.attendanceService.bulkMarkAttendance(req.userId!, data);
      res.status(201).json(records);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = updateAttendanceSchema.parse(req.body);
      const record = await this.attendanceService.updateAttendance(req.userId!, Number(id), data);
      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  };

  getByDate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
        return;
      }
      const records = await this.attendanceService.getByDate(req.userId!, Number(orgId), date);
      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  };

  getByDateRange = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { orgId } = req.params;
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        res.status(400).json({ error: 'startDate and endDate query parameters are required (YYYY-MM-DD)' });
        return;
      }
      const records = await this.attendanceService.getByDateRange(req.userId!, Number(orgId), startDate, endDate);
      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.attendanceService.deleteAttendance(req.userId!, Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
