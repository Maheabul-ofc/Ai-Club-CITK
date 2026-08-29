import axiosInstance from '../lib/axios.js';

export const analyticsService = {
  getOverviewStats: async () => {
    const response = await axiosInstance.get('/analytics/overview');
    return response.data;
  },

  getMemberGrowth: async () => {
    const response = await axiosInstance.get('/analytics/member-growth');
    return response.data;
  },

  getAttendanceStats: async () => {
    const response = await axiosInstance.get('/analytics/attendance-stats');
    return response.data;
  },

  getDepartmentBreakdown: async () => {
    const response = await axiosInstance.get('/analytics/department-breakdown');
    return response.data;
  },

  getAuditLogs: async (params) => {
    const response = await axiosInstance.get('/audit', { params });
    return response.data;
  }
};
