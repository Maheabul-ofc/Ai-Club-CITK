import axios from 'axios';
import axiosInstance from '../lib/axios.js';

const API_URL = '/api/v1';

/**
 * Get public leadership profiles
 * Uses standard axios without auth headers
 */
export const getPublicLeadership = async () => {
  const response = await axios.get(`${API_URL}/leadership`);
  return response.data;
};

/**
 * Get leadership profiles for management
 * Uses protected api instance
 */
export const getLeadership = async () => {
  const response = await axiosInstance.get('/leadership');
  return response.data;
};

/**
 * Create a new leadership profile
 */
export const createLeadership = async (data) => {
  const response = await axiosInstance.post('/leadership', data);
  return response.data;
};

/**
 * Update an existing leadership profile
 */
export const updateLeadership = async (id, data) => {
  const response = await axiosInstance.put(`/leadership/${id}`, data);
  return response.data;
};

/**
 * Delete a leadership profile
 */
export const deleteLeadership = async (id) => {
  const response = await axiosInstance.delete(`/leadership/${id}`);
  return response.data;
};
