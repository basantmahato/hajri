import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { auth } from '../config/auth.js';
import { db } from '../config/database.js';
import { users } from '../models/users.schema.js';

export interface AuthRequest extends Request {
  userId?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Check Bearer token in header or cookie
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;

    if (bearerToken) {
      try {
        const decoded = jwt.verify(bearerToken, JWT_SECRET) as { userId: number };
        req.userId = decoded.userId;
        return next();
      } catch {
        // Fall through to check Better Auth session
      }
    }

    // 2. Check Better Auth session
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (session?.user) {
      // Find or create matching user in `users` table
      let [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);

      if (!existingUser) {
        [existingUser] = await db
          .insert(users)
          .values({
            email: session.user.email,
            name: session.user.name || 'User',
            password: 'oauth_user',
            avatar: session.user.image,
            phone: (session.user as any).phoneNumber || null,
          })
          .returning();
      }

      req.userId = existingUser.id;
      return next();
    }

    res.status(401).json({ error: 'Authentication required' });
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication' });
  }
};
