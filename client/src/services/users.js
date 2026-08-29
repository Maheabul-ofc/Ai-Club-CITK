import axiosInstance from '../lib/axios.js';

export const usersService = {
  /**
   * Get all users based on filters
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  getUsers: async (filters = {}) => {
    const response = await axiosInstance.get('/users', { params: filters });
    return response.data;
  },

  /**
   * Add a new team member
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  addTeamMember: async (data) => {
    const response = await axiosInstance.post('/users/admin/team', data);
    return response.data;
  },

  /**
   * Update a team member
   */
  updateTeamMember: async (id, data) => {
    const response = await axiosInstance.put(`/users/admin/team/${id}`, data);
    return response.data;
  },

  /**
   * Delete a team member
   */
  deleteTeamMember: async (id) => {
    const response = await axiosInstance.delete(`/users/admin/team/${id}`);
    return response.data;
  },

  /**
   * Create an admin account
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  createAdmin: async (data) => {
    const response = await axiosInstance.post('/users/admin/accounts', data);
    return response.data;
  },

  /**
   * Delete an admin account
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  deleteAdmin: async (id) => {
    const response = await axiosInstance.delete(`/users/admin/accounts/${id}`);
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  }
};
