import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { User, UserRole, UserStatus } from '../models/User';

const VALID_ROLES: UserRole[] = ['GENERAL_USER', 'ADMIN'];
const VALID_STATUSES: UserStatus[] = ['ACTIVE', 'INACTIVE'];
const SALT_ROUNDS = 10;

/** Strips passwordHash and __v from a user document. */
function sanitize(doc: Record<string, unknown>) {
  const obj = typeof (doc as any).toObject === 'function' ? (doc as any).toObject() : { ...doc };
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
}

export const usersController = {
  /**
   * GET /api/users
   * Optional ?search= (matches name or userId, case-insensitive)
   * Optional ?status= (ACTIVE | INACTIVE)
   */
  getAll: async (req: AuthRequest, res: Response): Promise<void> => {
    const filter: Record<string, unknown> = {};

    // search by name or userId
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { userId: regex }];
    }

    // status filter
    if (typeof req.query.status === 'string' && VALID_STATUSES.includes(req.query.status as UserStatus)) {
      filter.status = req.query.status;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users: users.map((u) => sanitize(u as any)),
    });
  },

  /**
   * GET /api/users/:id
   * :id is the userId string, not Mongo _id
   */
  getById: async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findOne({ userId: req.params.id });

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User "${req.params.id}" not found`,
        code: 'NOT_FOUND',
      });
      return;
    }

    res.json({ success: true, user: sanitize(user as any) });
  },

  /**
   * POST /api/users
   * Body: { userId, name, email, password, role, status }
   */
  create: async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId, name, email, password, role, status } = req.body;
    const errors: Record<string, string> = {};

    if (!userId || typeof userId !== 'string') errors.userId = 'userId is required';
    if (!name || typeof name !== 'string') errors.name = 'name is required';
    if (!email || typeof email !== 'string') errors.email = 'email is required';
    if (!password || typeof password !== 'string') errors.password = 'password is required';
    if (!role || !VALID_ROLES.includes(role)) errors.role = `role must be one of: ${VALID_ROLES.join(', ')}`;
    if (status && !VALID_STATUSES.includes(status)) errors.status = `status must be one of: ${VALID_STATUSES.join(', ')}`;

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: 'Validation failed', code: 'BAD_REQUEST', errors });
      return;
    }

    // Check uniqueness
    const existing = await User.findOne({ $or: [{ userId }, { email: email.toLowerCase() }] });
    if (existing) {
      const field = existing.userId === userId ? 'userId' : 'email';
      res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists`,
        code: 'CONFLICT',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      userId,
      name,
      email,
      passwordHash,
      role,
      status: status || 'ACTIVE',
    });

    res.status(201).json({ success: true, user: sanitize(user as any) });
  },

  /**
   * PUT /api/users/:id
   * Updatable: name, email, role, status, and optionally password.
   */
  update: async (req: AuthRequest, res: Response): Promise<void> => {
    const targetUserId = req.params.id;
    const currentUser = req.user!;
    const { name, email, role, status, password } = req.body;
    const errors: Record<string, string> = {};

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) errors.name = 'name cannot be empty';
    if (email !== undefined && (typeof email !== 'string' || !email.trim())) errors.email = 'email cannot be empty';
    if (role !== undefined && !VALID_ROLES.includes(role)) errors.role = `role must be one of: ${VALID_ROLES.join(', ')}`;
    if (status !== undefined && !VALID_STATUSES.includes(status)) errors.status = `status must be one of: ${VALID_STATUSES.join(', ')}`;
    if (password !== undefined && (typeof password !== 'string' || !password)) errors.password = 'password cannot be empty';

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: 'Validation failed', code: 'BAD_REQUEST', errors });
      return;
    }

    // Self-protection: admin cannot deactivate or demote themselves
    if (currentUser.userId === targetUserId) {
      if (status === 'INACTIVE') {
        res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account',
          code: 'BAD_REQUEST',
        });
        return;
      }
      if (role && role !== 'ADMIN') {
        res.status(400).json({
          success: false,
          message: 'You cannot demote your own account',
          code: 'BAD_REQUEST',
        });
        return;
      }
    }

    const user = await User.findOne({ userId: targetUserId });

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User "${targetUserId}" not found`,
        code: 'NOT_FOUND',
      });
      return;
    }

    // Check email uniqueness if changing email
    if (email && email.toLowerCase() !== user.email) {
      const dup = await User.findOne({ email: email.toLowerCase() });
      if (dup) {
        res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
          code: 'CONFLICT',
        });
        return;
      }
    }

    // Apply updates
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (password) user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await user.save();

    res.json({ success: true, user: sanitize(user as any) });
  },

  /**
   * DELETE /api/users/:id
   * Soft delete: sets status to INACTIVE.
   */
  remove: async (req: AuthRequest, res: Response): Promise<void> => {
    const targetUserId = req.params.id;
    const currentUser = req.user!;

    // Self-protection
    if (currentUser.userId === targetUserId) {
      res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
        code: 'BAD_REQUEST',
      });
      return;
    }

    const user = await User.findOne({ userId: targetUserId });

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User "${targetUserId}" not found`,
        code: 'NOT_FOUND',
      });
      return;
    }

    user.status = 'INACTIVE';
    await user.save();

    res.json({ success: true, user: sanitize(user as any) });
  },
};
