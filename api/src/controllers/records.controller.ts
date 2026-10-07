import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Record, RecordType, RecordStatus } from '../models/Record';

const VALID_TYPES: RecordType[] = ['EMPLOYMENT', 'EDUCATION', 'ADDRESS', 'IDENTITY', 'CRIMINAL'];
const VALID_STATUSES: RecordStatus[] = ['VERIFIED', 'PENDING', 'REJECTED'];

export const recordsController = {
  /**
   * GET /api/records
   * GENERAL_USER → own records only (ignores ?userId).
   * ADMIN        → all records, optionally filtered by ?userId.
   * Both roles   → optional ?status= and ?type= filters.
   */
  getAll: async (req: AuthRequest, res: Response): Promise<void> => {
    const user = req.user!;
    const filter: Record<string, unknown> = {};

    // ── Owner scoping ──
    if (user.role === 'GENERAL_USER') {
      filter.ownerUserId = user.userId;
    } else if (req.query.userId && typeof req.query.userId === 'string') {
      filter.ownerUserId = req.query.userId;
    }

    // ── Optional filters ──
    if (typeof req.query.status === 'string' && VALID_STATUSES.includes(req.query.status as RecordStatus)) {
      filter.status = req.query.status;
    }

    if (typeof req.query.type === 'string' && VALID_TYPES.includes(req.query.type as RecordType)) {
      filter.type = req.query.type;
    }

    const records = await Record.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      records,
    });
  },
};
