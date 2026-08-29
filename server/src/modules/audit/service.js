import prisma from '../../config/database.js';

export class AuditService {
  /**
   * Get paginated audit logs
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getAuditLogs({ page = 1, limit = 20, actorId, action, targetType }) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    return {
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
