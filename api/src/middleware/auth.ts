import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';

/**
 * Extend the Express Request so downstream handlers can access `req.user`.
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Verifies the Bearer token, loads the user from DB (fresh), and rejects
 * inactive accounts. Attaches the full user document to `req.user`.
 */
export async function auth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'No token provided',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  const token = header.split(' ')[1];

  let decoded: { userId: string; role: string };

  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  // Load fresh user from DB (excluding passwordHash by default)
  const user = await User.findOne({ userId: decoded.userId });

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User no longer exists',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  if (user.status === 'INACTIVE') {
    res.status(403).json({
      success: false,
      message: 'Account is deactivated',
      code: 'FORBIDDEN',
    });
    return;
  }

  req.user = user;
  next();
}
