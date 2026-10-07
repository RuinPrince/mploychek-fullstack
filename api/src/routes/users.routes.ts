import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// All user routes require ADMIN
router.use(auth, requireRole('ADMIN'));

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.remove);

export default router;
