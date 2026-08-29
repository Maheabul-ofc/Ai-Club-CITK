import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { ROLES } from '../../config/constants.js';
import * as controller from './controller.js';

const router = Router();

// Public route
router.get('/', controller.getAll);

// Protected routes
router.use(authenticateToken);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteLeadership);

export default router;
