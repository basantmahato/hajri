import { eq } from 'drizzle-orm';
import { users } from '../models';
import type { DrizzleDB } from '../config/database';
import type { User, CreateUserDto } from '../types/user.types';

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

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        email: data.email,
        password: data.password,
        name: data.name,
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
