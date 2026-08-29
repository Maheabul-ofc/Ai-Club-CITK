import { Router } from 'express';
import { AuditController } from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticateToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.get('/', AuditController.getAuditLogs);

export default router;
