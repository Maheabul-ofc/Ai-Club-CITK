import prisma from '../../config/database.js';
import { createAuditLog } from '../../utils/auditLog.js';

export const getAllDepartments = async () => {
  return await prisma.department.findMany({
    include: {
      _count: {
        select: { members: true }
      }
    }
  });
};

export const getDepartmentById = async (id) => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });

  if (!department) {
    const error = new Error('Department not found');
    error.status = 404;
    throw error;
  }

  return department;
};

export const createDepartment = async (data, actorId) => {
  const department = await prisma.department.create({
    data
  });
  
  await createAuditLog(actorId, 'CREATE_DEPARTMENT', 'Department', department.id, { name: data.name });
  
  return department;
};

export const updateDepartment = async (id, data, actorId) => {
  const department = await prisma.department.update({
    where: { id },
    data
  });
  
  await createAuditLog(actorId, 'UPDATE_DEPARTMENT', 'Department', id, { name: data.name });
  
  return department;
};

export const deleteDepartment = async (id, actorId) => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } }
  });

  if (!department) {
    const error = new Error('Department not found');
    error.status = 404;
    throw error;
  }

  if (department._count.members > 0) {
    const error = new Error('Cannot delete department with active members');
    error.status = 400;
    throw error;
  }

  await prisma.department.delete({ where: { id } });
  
  await createAuditLog(actorId, 'DELETE_DEPARTMENT', 'Department', id, { name: department.name });
};
