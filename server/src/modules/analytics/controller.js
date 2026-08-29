import { AnalyticsService } from './service.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  static async getOverviewStats(req, res, next) {
    try {
      const stats = await analyticsService.getOverviewStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getMemberGrowth(req, res, next) {
    try {
      const growth = await analyticsService.getMemberGrowth();
      res.status(200).json({ success: true, data: growth });
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceStats(req, res, next) {
    try {
      const stats = await analyticsService.getAttendanceStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getDepartmentBreakdown(req, res, next) {
    try {
      const breakdown = await analyticsService.getDepartmentBreakdown();
      res.status(200).json({ success: true, data: breakdown });
    } catch (error) {
      next(error);
    }
  }
}
