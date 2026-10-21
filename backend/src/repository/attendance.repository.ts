import { eq, and, gte, lte } from 'drizzle-orm';
import { attendance } from '../models/index.js';
import type { DrizzleDB } from '../config/database.js';
import type { AttendanceSelect, AttendanceInsert } from '../models/index.js';

export class AttendanceRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: number): Promise<AttendanceSelect | null> {
    const [row] = await this.db
      .select()
      .from(attendance)
      .where(eq(attendance.id, id))
      .limit(1);
    return row ?? null;
  }

  async findByUserAndDate(userId: number, date: Date): Promise<AttendanceSelect | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [row] = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          gte(attendance.date, startOfDay),
          lte(attendance.date, endOfDay),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findByEmployeeAndDate(employeeId: number, date: Date): Promise<AttendanceSelect | null> {
    return this.findByUserAndDate(employeeId, date);
  }

  async findByOrganizationAndDate(organizationId: number, date: Date): Promise<AttendanceSelect[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.organizationId, organizationId),
          gte(attendance.date, startOfDay),
          lte(attendance.date, endOfDay),
        ),
      );
  }

  async findByOrganizationAndDateRange(
    organizationId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSelect[]> {
    return this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.organizationId, organizationId),
          gte(attendance.date, startDate),
          lte(attendance.date, endDate),
        ),
      );
  }

  async findByUserAndDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSelect[]> {
    return this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          gte(attendance.date, startDate),
          lte(attendance.date, endDate),
        ),
      );
  }

  async findByEmployeeAndDateRange(
    employeeId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceSelect[]> {
    return this.findByUserAndDateRange(employeeId, startDate, endDate);
  }

  async create(data: AttendanceInsert): Promise<AttendanceSelect> {
    const [row] = await this.db
      .insert(attendance)
      .values(data)
      .returning();
    return row;
  }

  async createMany(data: AttendanceInsert[]): Promise<AttendanceSelect[]> {
    return this.db
      .insert(attendance)
      .values(data)
      .returning();
  }

  async update(id: number, data: Partial<AttendanceInsert>): Promise<AttendanceSelect> {
    const [row] = await this.db
      .update(attendance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(attendance.id, id))
      .returning();
    return row;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(attendance).where(eq(attendance.id, id));
  }
}
