import prisma from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Get all leadership profiles ordered by displayOrder
 */
export const getAllProfiles = async () => {
  return prisma.leadershipProfile.findMany({
    orderBy: { displayOrder: 'asc' },
  });
};

/**
 * Create a new leadership profile
 */
export const createProfile = async (data) => {
  const { name, role, photoUrl, displayOrder } = data;
  
  if (!name || !role) {
    throw new AppError('Name and role are required', 400);
  }

  return prisma.leadershipProfile.create({
    data: {
      name,
      role,
      photoUrl,
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
    },
  });
};

/**
 * Update an existing leadership profile
 */
export const updateProfile = async (id, data) => {
  const { name, role, photoUrl, displayOrder } = data;

  const existing = await prisma.leadershipProfile.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Profile not found', 404);
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (role) updateData.role = role;
  if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
  if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder, 10);

  return prisma.leadershipProfile.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete a leadership profile
 */
export const deleteProfile = async (id) => {
  const existing = await prisma.leadershipProfile.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Profile not found', 404);
  }

  return prisma.leadershipProfile.delete({ where: { id } });
};
