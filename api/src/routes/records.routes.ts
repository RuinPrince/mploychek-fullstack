import { Router } from 'express';
import { recordsController } from '../controllers/records.controller';
import { auth } from '../middleware/auth';

const router = Router();

// All record routes require authentication
router.use(auth);

router.get('/', recordsController.getAll);

export default router;
