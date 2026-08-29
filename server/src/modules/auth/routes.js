import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { signupMemberSchema, loginSchema, signupCoordinatorSchema } from './validators.js';
import { signupMember, signupCoordinator, login, refreshToken, logout, getMe, reEnrollFace } from './controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

router.post('/signup/member', validate(signupMemberSchema), signupMember);
router.post('/signup/coordinator', validate(signupCoordinatorSchema), signupCoordinator);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.post('/face/re-enroll', authenticateToken, reEnrollFace);

export default router;
