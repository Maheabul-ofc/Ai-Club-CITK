import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../config/constants.js';
import * as controller from './controller.js';
import * as validators from './validators.js';

const router = Router();

// POST /
router.post(
  '/',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR),
  validate(validators.createEventSchema),
  controller.createEvent
);

// GET /public
router.get(
  '/public',
  controller.getPublicEvents
);

// GET /
router.get(
  '/',
  authenticateToken,
  controller.getEvents
);

// GET /:id
router.get(
  '/:id',
  authenticateToken,
  controller.getEventById
);

// PATCH /:id
router.patch(
  '/:id',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR),
  validate(validators.updateEventSchema),
  controller.updateEvent
);

// DELETE /:id
router.delete(
  '/:id',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR),
  controller.deleteEvent
);

// PATCH /:id/status
router.patch(
  '/:id/status',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR),
  validate(validators.updateEventStatusSchema),
  controller.updateEventStatus
);

// GET /my-attendance
router.get(
  '/my-attendance',
  authenticateToken,
  controller.getMyAttendance
);

// POST /:id/attendance
router.post(
  '/:id/attendance',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR, ROLES.COORDINATOR),
  validate(validators.markAttendanceSchema),
  controller.markAttendance
);

// GET /:id/attendance
router.get(
  '/:id/attendance',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR, ROLES.COORDINATOR),
  controller.getAttendance
);

// GET /:id/attendance/export
router.get(
  '/:id/attendance/export',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASST_CHIEF_CONVENOR, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR, ROLES.COORDINATOR),
  controller.exportAttendanceCSV
);

export default router;
