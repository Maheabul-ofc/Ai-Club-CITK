import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../config/database.js';
import { APPROVAL_STATUS } from '../config/constants.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, departmentId: true, approvalStatus: true }
    });

    if (!user || user.approvalStatus !== APPROVAL_STATUS.ACTIVE) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    };

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};
