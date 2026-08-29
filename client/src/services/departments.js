import axiosInstance from '../lib/axios.js';

export const departmentsService = {
  /**
   * Get all departments
   * @returns {Promise<Object>}
   */
  getDepartments: async () => {
    const response = await axiosInstance.get('/departments');
    return response.data;
  },

  getDepartmentById: async (id) => {
    const response = await axiosInstance.get(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create a new department
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  createDepartment: async (data) => {
    const response = await axiosInstance.post('/departments', data);
    return response.data;
  },

  /**
   * Update a department
   * @param {string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  updateDepartment: async (id, data) => {
    const response = await axiosInstance.patch(`/departments/${id}`, data);
    return response.data;
  },

  /**
   * Delete a department
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  deleteDepartment: async (id) => {
    const response = await axiosInstance.delete(`/departments/${id}`);
    return response.data;
  }
};
