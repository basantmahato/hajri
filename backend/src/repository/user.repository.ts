import { eq, or, ilike } from 'drizzle-orm';
import { users } from '../models/index.js';
import type { DrizzleDB } from '../config/database.js';
import type { User, CreateUserDto } from '../types/user.types.js';

export class UserRepository {
  constructor(private db: DrizzleDB) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    return result[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async search(query: string): Promise<User[]> {
    const pattern = `%${query}%`;
    return this.db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.name, pattern),
          ilike(users.email, pattern),
          ilike(users.phone, pattern),
        ),
      )
      .limit(20);
  }

  async create(data: CreateUserDto): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone ?? null,
        avatar: data.avatar ?? null,
        role: data.role || 'user',
      })
      .returning();

    return user;
  }

  async update(id: number, data: Partial<CreateUserDto>): Promise<User> {
    const [user] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
