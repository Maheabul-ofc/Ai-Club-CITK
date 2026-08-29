import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../config/constants.js';
import * as controller from './controller.js';
import * as validators from './validators.js';

const router = Router();

// Get all departments
router.get(
  '/',
  authenticateToken,
  controller.getAllDepartments
);

// Get single department
router.get(
  '/:id',
  authenticateToken,
  controller.getDepartmentById
);

// Create a new department
router.post(
  '/',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(validators.createDepartmentSchema),
  controller.createDepartment
);

// Update department name
router.patch(
  '/:id',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(validators.updateDepartmentSchema),
  controller.updateDepartment
);

// Delete department
router.delete(
  '/:id',
  authenticateToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  controller.deleteDepartment
);

export default router;
