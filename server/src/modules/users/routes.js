import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../config/constants.js';
import * as controller from './controller.js';
import * as validators from './validators.js';

const router = Router();

// Get all users
router.get(
  '/',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEPT_CONVENOR, ROLES.DEPT_ASST_CONVENOR),
  controller.getAllUsers
);

// Add team member (Admin/Super Admin only)
router.post(
  '/admin/team',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(validators.createTeamMemberSchema),
  controller.createTeamMember
);

// Update team member (Admin/Super Admin only)
router.put(
  '/admin/team/:id',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(validators.updateTeamMemberSchema),
  controller.updateTeamMember
);

// Delete team member (Admin/Super Admin only)
router.delete(
  '/admin/team/:id',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  controller.deleteTeamMember
);

// Add admin account (Super Admin only)
router.post(
  '/admin/accounts',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN),
  validate(validators.createAdminSchema),
  controller.createAdmin
);

// Delete admin account (Super Admin only)
router.delete(
  '/admin/accounts/:id',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN),
  controller.deleteAdmin
);

// Update own profile
router.put(
  '/profile',
  authenticateToken,
  validate(validators.updateProfileSchema),
  controller.updateProfile
);

export default router;
