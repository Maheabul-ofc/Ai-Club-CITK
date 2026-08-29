import { approvalService } from './service.js';

export const getDeptQueue = async (req, res, next) => {
  try {
    const requests = await approvalService.getDeptQueue(req.user.id);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getFinalQueue = async (req, res, next) => {
  try {
    const requests = await approvalService.getFinalQueue();
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const deptReview = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const updatedRequest = await approvalService.deptReview(req.params.id, req.user.id, status, remarks);
    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const finalReview = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const updatedRequest = await approvalService.finalReview(req.params.id, req.user.id, status, remarks);
    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const getMyStatus = async (req, res, next) => {
  try {
    const status = await approvalService.getMyStatus(req.user.id);
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};
