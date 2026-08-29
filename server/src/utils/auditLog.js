import prisma from '../config/database.js';

/**
 * Creates an audit log entry in the database.
 * 
 * @param {string} actorId - ID of the user performing the action.
 * @param {string} action - Action being performed (e.g., 'ADD_TEAM_MEMBER').
 * @param {string} targetType - Type of target entity (e.g., 'User', 'Department').
 * @param {string} targetId - ID of the target entity.
 * @param {Object} [details={}] - Additional details about the action in JSON format.
 * @returns {Promise<Object>} The created audit log record.
 */
export const createAuditLog = async (actorId, action, targetType, targetId, details = {}, tx = prisma) => {
  return await tx.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      details
    }
  });
};
