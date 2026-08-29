import prisma from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { createAuditLog } from '../../utils/auditLog.js';
import { APPROVAL_STATUS, REVIEW_STATUS } from '../../config/constants.js';

class ApprovalService {
  async getDeptQueue(convenorUserId) {
    const convenor = await prisma.user.findUnique({
      where: { id: convenorUserId },
      select: { departmentId: true }
    });

    if (!convenor || !convenor.departmentId) {
      throw new AppError('Department Convenor does not have an assigned department', 400);
    }

    return prisma.approvalRequest.findMany({
      where: {
        deptReviewStatus: REVIEW_STATUS.PENDING,
        finalStatus: APPROVAL_STATUS.PENDING_DEPT_REVIEW,
        departmentId: convenor.departmentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            branch: true,
            semester: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async getFinalQueue() {
    return prisma.approvalRequest.findMany({
      where: {
        deptReviewStatus: REVIEW_STATUS.APPROVED,
        asstChiefReviewStatus: REVIEW_STATUS.PENDING,
        finalStatus: APPROVAL_STATUS.PENDING_ASST_CHIEF_REVIEW
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            branch: true,
            semester: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async deptReview(requestId, convenorUserId, status, remarks) {
    const request = await prisma.approvalRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new AppError('Approval request not found', 404);
    }

    if (request.finalStatus !== APPROVAL_STATUS.PENDING_DEPT_REVIEW) {
      throw new AppError('Request is not pending department review', 400);
    }

    const convenor = await prisma.user.findUnique({
      where: { id: convenorUserId },
      select: { departmentId: true }
    });

    if (convenor.departmentId !== request.departmentId) {
      throw new AppError('You are not authorized to review this request', 403);
    }

    return prisma.$transaction(async (tx) => {
      const finalStatus = status === REVIEW_STATUS.APPROVED 
        ? APPROVAL_STATUS.PENDING_ASST_CHIEF_REVIEW 
        : APPROVAL_STATUS.REJECTED;

      const updatedRequest = await tx.approvalRequest.update({
        where: { id: requestId },
        data: {
          deptReviewStatus: status,
          finalStatus,
          deptReviewedBy: convenorUserId,
          deptReviewedAt: new Date(),
          deptRemarks: remarks || null
        }
      });

      await tx.user.update({
        where: { id: request.userId },
        data: { approvalStatus: finalStatus }
      });

      await createAuditLog(
        convenorUserId,
        status === REVIEW_STATUS.APPROVED ? 'DEPT_REVIEW_APPROVED' : 'DEPT_REVIEW_REJECTED',
        'ApprovalRequest',
        requestId,
        { status, remarks },
        tx
      );

      return updatedRequest;
    });
  }

  async finalReview(requestId, chiefUserId, status, remarks) {
    const request = await prisma.approvalRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new AppError('Approval request not found', 404);
    }

    if (request.finalStatus !== APPROVAL_STATUS.PENDING_ASST_CHIEF_REVIEW) {
      throw new AppError('Request is not pending final review', 400);
    }

    return prisma.$transaction(async (tx) => {
      const finalStatus = status === REVIEW_STATUS.APPROVED 
        ? APPROVAL_STATUS.ACTIVE 
        : APPROVAL_STATUS.REJECTED;

      const updatedRequest = await tx.approvalRequest.update({
        where: { id: requestId },
        data: {
          asstChiefReviewStatus: status,
          finalStatus,
          asstChiefReviewedBy: chiefUserId,
          asstChiefReviewedAt: new Date(),
          asstChiefRemarks: remarks || null
        }
      });

      await tx.user.update({
        where: { id: request.userId },
        data: { approvalStatus: finalStatus }
      });

      await createAuditLog(
        chiefUserId,
        status === REVIEW_STATUS.APPROVED ? 'CHIEF_REVIEW_APPROVED' : 'CHIEF_REVIEW_REJECTED',
        'ApprovalRequest',
        requestId,
        { status, remarks },
        tx
      );

      return updatedRequest;
    });
  }

  async getMyStatus(userId) {
    return prisma.approvalRequest.findFirst({
      where: { userId },
      include: {
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const approvalService = new ApprovalService();
