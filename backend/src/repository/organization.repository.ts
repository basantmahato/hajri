import { eq } from 'drizzle-orm';
import { organizations } from '../models/index.js';
import type { DrizzleDB } from '../config/database.js';
import type { OrganizationSelect, OrganizationInsert } from '../models/index.js';

export class OrganizationRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: number): Promise<OrganizationSelect | null> {
    const [row] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);
    return row ?? null;
  }

  async findBySlug(slug: string): Promise<OrganizationSelect | null> {
    const [row] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return row ?? null;
  }

  async findByOwner(ownerId: number): Promise<OrganizationSelect[]> {
    return this.db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, ownerId));
  }

  async create(data: OrganizationInsert): Promise<OrganizationSelect> {
    const [row] = await this.db
      .insert(organizations)
      .values(data)
      .returning();
    return row;
  }

  async update(id: number, data: Partial<OrganizationInsert>): Promise<OrganizationSelect> {
    const [row] = await this.db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return row;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(organizations).where(eq(organizations.id, id));
  }
}
