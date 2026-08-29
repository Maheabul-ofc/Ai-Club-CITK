import api from '../lib/axios.js';

export const getDeptQueue = () => api.get('/approvals/dept-queue').then(r => r.data.data);
export const getFinalQueue = () => api.get('/approvals/final-queue').then(r => r.data.data);
export const deptReview = (id, data) => api.post(`/approvals/${id}/dept-review`, data).then(r => r.data);
export const finalReview = (id, data) => api.post(`/approvals/${id}/final-review`, data).then(r => r.data);
export const getMyApprovalStatus = () => api.get('/approvals/my-status').then(r => r.data.data);
