import prisma from '../../config/database.js';
import { ROLES, APPROVAL_STATUS, EVENT_STATUS } from '../../config/constants.js';

export class AnalyticsService {
  /**
   * Get overview statistics
   * @returns {Promise<Object>}
   */
  async getOverviewStats() {
    const [
      totalMembers,
      totalCoordinators,
      totalDepartments,
      totalEvents,
      pendingApprovals,
      upcomingEvents
    ] = await Promise.all([
      prisma.user.count({ where: { role: ROLES.MEMBER } }),
      prisma.user.count({ 
        where: { 
          role: ROLES.COORDINATOR, 
          approvalStatus: APPROVAL_STATUS.ACTIVE 
        } 
      }),
      prisma.department.count(),
      prisma.event.count(),
      prisma.approvalRequest.count({
        where: {
          finalStatus: {
            in: [APPROVAL_STATUS.PENDING_DEPT_REVIEW, APPROVAL_STATUS.PENDING_ASST_CHIEF_REVIEW]
          }
        }
      }),
      prisma.event.count({
        where: {
          status: EVENT_STATUS.SCHEDULED,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    return {
      totalMembers,
      totalCoordinators,
      totalDepartments,
      totalEvents,
      pendingApprovals,
      upcomingEvents
    };
  }

  /**
   * Get member growth over the last 6 months
   * @returns {Promise<Array>}
   */
  async getMemberGrowth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const members = await prisma.user.findMany({
      where: {
        role: ROLES.MEMBER,
        createdAt: { gte: sixMonthsAgo }
      },
      select: { createdAt: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthMap = {};
    const result = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = monthNames[d.getMonth()];
      growthMap[month] = 0;
      result.push({ month, count: 0 }); // Preserve order
    }

    members.forEach(member => {
      const month = monthNames[member.createdAt.getMonth()];
      if (growthMap[month] !== undefined) {
        growthMap[month]++;
      }
    });

    return result.map(item => ({
      month: item.month,
      count: growthMap[item.month]
    }));
  }

  /**
   * Get attendance statistics (top 5 events)
   * @returns {Promise<Array>}
   */
  async getAttendanceStats() {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: {
        attendances: {
          _count: 'desc'
        }
      },
      take: 5
    });

    return events.map(event => ({
      eventTitle: event.title,
      count: event._count.attendances
    }));
  }

  /**
   * Get department breakdown
   * @returns {Promise<Array>}
   */
  async getDepartmentBreakdown() {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    return departments.map(dept => ({
      departmentName: dept.name,
      count: dept._count.members
    }));
  }
}
