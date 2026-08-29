import { AuditService } from './service.js';

const auditService = new AuditService();

export class AuditController {
  static async getAuditLogs(req, res, next) {
    try {
      const { page, limit, actorId, action, targetType } = req.query;
      const result = await auditService.getAuditLogs({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        actorId,
        action,
        targetType
      });
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
