import bcrypt from 'bcryptjs';
import prisma from '../../config/database.js';
import { createAuditLog } from '../../utils/auditLog.js';
import { APPROVAL_STATUS, ROLES } from '../../config/constants.js';

export const createTeamMember = async (data, actorId) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      approvalStatus: APPROVAL_STATUS.ACTIVE,
      addedBy: actorId
    }
  });

  await createAuditLog(actorId, 'ADD_TEAM_MEMBER', 'User', user.id, { role: data.role });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateTeamMember = async (userId, data, actorId) => {
  const updateData = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  } else {
    delete updateData.password;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  await createAuditLog(actorId, 'UPDATE_TEAM_MEMBER', 'User', userId, { role: updatedUser.role });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const deleteTeamMember = async (userId, actorId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    await createAuditLog(actorId, 'DELETE_TEAM_MEMBER', 'User', userId, { email: user.email });
  } catch (error) {
    if (error.code === 'P2003') { // Prisma foreign key constraint failed
      const err = new Error('Cannot delete member: User is associated with events, attendances, or approval requests.');
      err.status = 400;
      throw err;
    }
    throw error;
  }
};

export const createAdmin = async (data, actorId) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const admin = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: ROLES.ADMIN,
      approvalStatus: APPROVAL_STATUS.ACTIVE,
      addedBy: actorId
    }
  });

  await createAuditLog(actorId, 'CREATE_ADMIN', 'User', admin.id, { email: data.email });

  const { password, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

export const deleteAdmin = async (adminId, actorId) => {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== ROLES.ADMIN) {
    const error = new Error('Admin not found or invalid role');
    error.status = 404;
    throw error;
  }

  await prisma.user.delete({ where: { id: adminId } });
  await createAuditLog(actorId, 'DELETE_ADMIN', 'User', adminId, { email: admin.email });
};

export const updateProfile = async (userId, data) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data
  });
  
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const getAllUsers = async (filters = {}) => {
  const { role, departmentId } = filters;
  const where = {};
  if (role) where.role = role;
  if (departmentId) where.departmentId = departmentId;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      approvalStatus: true,
      contactNumber: true,
      branch: true,
      semester: true,
      module: true,
      createdAt: true
    }
  });
  
  return users;
};
