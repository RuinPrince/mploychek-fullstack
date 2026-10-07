import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const VALID_ROLES: UserRole[] = ['GENERAL_USER', 'ADMIN'];

export const authController = {
  /**
   * POST /api/auth/login
   * Body: { userId, password, role }
   */
  login: async (req: Request, res: Response): Promise<void> => {
    const { userId, password, role } = req.body;

    // ── Validate required fields ──
    if (!userId || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'userId, password, and role are required',
        code: 'BAD_REQUEST',
      });
      return;
    }

    if (!VALID_ROLES.includes(role)) {
      res.status(400).json({
        success: false,
        message: `role must be one of: ${VALID_ROLES.join(', ')}`,
        code: 'BAD_REQUEST',
      });
      return;
    }

    // ── Find user (include passwordHash for comparison) ──
    const user = await User.findOne({ userId }).select('+passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    // ── Compare password ──
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    // ── Role mismatch ──
    if (user.role !== role) {
      res.status(403).json({
        success: false,
        message: 'Selected role does not match this account',
        code: 'FORBIDDEN',
      });
      return;
    }

    // ── Inactive check ──
    if (user.status === 'INACTIVE') {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
        code: 'FORBIDDEN',
      });
      return;
    }

    // ── Issue JWT ──
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  },

  /**
   * GET /api/auth/me
   * Protected — returns the current user from the token (fresh from DB).
   */
  me: async (req: AuthRequest, res: Response): Promise<void> => {
    const user = req.user!;

    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  },
};
