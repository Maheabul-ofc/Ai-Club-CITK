import prisma from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/AppError.js';
import { ROLES, APPROVAL_STATUS } from '../../config/constants.js';
import axios from 'axios';
import { logger } from '../../utils/logger.js'; // Fallback if logger needed

class AuthService {
  async signupMember(data) {
    const { photos, ...userData } = data;
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: ROLES.MEMBER,
        approvalStatus: APPROVAL_STATUS.ACTIVE
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approvalStatus: true
      }
    });

    try {
      if (process.env.FACE_SERVICE_URL) {
        await axios.post(`${process.env.FACE_SERVICE_URL}/enroll`, {
          userId: user.id,
          images: photos
        });
      }
    } catch (error) {
      if (typeof logger !== 'undefined' && logger.error) {
        logger.error('Face enrollment failed:', error);
      } else {
        console.error('Face enrollment failed:', error.message);
      }
    }

    return user;
  }

  async signupCoordinator(data) {
    const { departmentId, photos, ...userData } = data;
    
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });
    
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: ROLES.COORDINATOR,
          approvalStatus: APPROVAL_STATUS.PENDING_DEPT_REVIEW,
          departmentId
        }
      });
      
      await tx.approvalRequest.create({
        data: {
          userId: newUser.id,
          departmentId,
          deptReviewStatus: 'PENDING',
          asstChiefReviewStatus: 'PENDING',
          finalStatus: APPROVAL_STATUS.PENDING_DEPT_REVIEW
        }
      });
      
      return newUser;
    });

    try {
      if (process.env.FACE_SERVICE_URL) {
        await axios.post(`${process.env.FACE_SERVICE_URL}/enroll`, {
          userId: user.id,
          images: photos
        });
      }
    } catch (error) {
      if (typeof logger !== 'undefined' && logger.error) {
        logger.error('Face enrollment failed:', error);
      } else {
        console.error('Face enrollment failed:', error.message);
      }
    }
    
    const { password: _, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.approvalStatus === APPROVAL_STATUS.REJECTED) {
      throw new AppError('Your application was rejected.', 403);
    }

    if (user.role === ROLES.COORDINATOR && (user.approvalStatus === APPROVAL_STATUS.PENDING_DEPT_REVIEW || user.approvalStatus === APPROVAL_STATUS.PENDING_ASST_CHIEF_REVIEW)) {
      throw new AppError('Your account is pending approval. Please wait for review.', 403);
    }

    if (user.approvalStatus !== APPROVAL_STATUS.ACTIVE) {
      throw new AppError('Account is not active', 403);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;

    return {
      user: userWithoutSensitiveData,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token) {
    if (!token) {
      throw new AppError('Refresh token required', 401);
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;
    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userWithoutSensitiveData };
  }

  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  async reEnrollFace(userId, photos) {
    try {
      if (!process.env.FACE_SERVICE_URL) {
        throw new AppError('Face service URL is not configured', 500);
      }
      
      await axios.post(`${process.env.FACE_SERVICE_URL}/enroll`, {
        userId,
        images: photos
      });
    } catch (error) {
      if (typeof logger !== 'undefined' && logger.error) {
        logger.error('Face re-enrollment failed:', error);
      } else {
        console.error('Face re-enrollment failed:', error.message);
      }
      throw new AppError('Failed to re-enroll face', 500);
    }
  }
}

export const authService = new AuthService();
