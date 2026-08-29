import { Router } from 'express';
import { AnalyticsController } from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(
  authenticateToken, 
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR)
);

router.get('/overview', AnalyticsController.getOverviewStats);
router.get('/member-growth', AnalyticsController.getMemberGrowth);
router.get('/attendance-stats', AnalyticsController.getAttendanceStats);
router.get('/department-breakdown', AnalyticsController.getDepartmentBreakdown);

export default router;
