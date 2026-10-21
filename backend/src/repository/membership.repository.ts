import { eq, and } from 'drizzle-orm';
import { memberships, users } from '../models/index.js';
import type { DrizzleDB } from '../config/database.js';
import type { MembershipSelect, MembershipInsert } from '../models/index.js';

export class MembershipRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: number): Promise<MembershipSelect | null> {
    const [row] = await this.db
      .select()
      .from(memberships)
      .where(eq(memberships.id, id))
      .limit(1);
    return row ?? null;
  }

  async findByUserAndOrg(userId: number, organizationId: number): Promise<MembershipSelect | null> {
    const [row] = await this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.organizationId, organizationId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findByOrganization(organizationId: number): Promise<(MembershipSelect & { userName: string; userEmail: string; userPhone: string | null; userAvatar: string | null })[]> {
    const rows = await this.db
      .select({
        id: memberships.id,
        userId: memberships.userId,
        organizationId: memberships.organizationId,
        role: memberships.role,
        dailyWage: memberships.dailyWage,
        status: memberships.status,
        permissions: memberships.permissions,
        joinedAt: memberships.joinedAt,
        invitedBy: memberships.invitedBy,
        isDefault: memberships.isDefault,
        createdAt: memberships.createdAt,
        updatedAt: memberships.updatedAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        userAvatar: users.avatar,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.organizationId, organizationId));
    return rows;
  }

  async findByUser(userId: number): Promise<MembershipSelect[]> {
    return this.db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId));
  }

  async create(data: MembershipInsert): Promise<MembershipSelect> {
    const [row] = await this.db
      .insert(memberships)
      .values(data)
      .returning();
    return row;
  }

  async update(id: number, data: Partial<MembershipInsert>): Promise<MembershipSelect> {
    const [row] = await this.db
      .update(memberships)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(memberships.id, id))
      .returning();
    return row;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(memberships).where(eq(memberships.id, id));
  }
}
