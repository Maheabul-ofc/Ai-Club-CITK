import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { ROLES } from '../../config/constants.js';
import { reviewSchema } from './validators.js';
import {
  getDeptQueue,
  getFinalQueue,
  deptReview,
  finalReview,
  getMyStatus
} from './controller.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Department Convenor and Assistant Convenor routes
router.get('/dept-queue', authorize(ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR), getDeptQueue);
router.post('/:id/dept-review', authorize(ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR), validate(reviewSchema), deptReview);

// Assistant Chief Convenor routes
router.get('/final-queue', authorize(ROLES.ASST_CHIEF_CONVENOR), getFinalQueue);
router.post('/:id/final-review', authorize(ROLES.ASST_CHIEF_CONVENOR), validate(reviewSchema), finalReview);

// Any authenticated user route
router.get('/my-status', getMyStatus);

export default router;
