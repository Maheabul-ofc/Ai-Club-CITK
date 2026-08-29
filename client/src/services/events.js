import axiosInstance from '../lib/axios.js';

export const eventsService = {
  /**
   * Get all events
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  getEvents: async (filters = {}) => {
    const response = await axiosInstance.get('/events', { params: filters });
    return response.data;
  },

  getEventById: async (eventId) => {
    const response = await axiosInstance.get(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Create a new event
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  createEvent: async (data) => {
    const response = await axiosInstance.post('/events', data);
    return response.data;
  },

  updateEvent: async (eventId, data) => {
    const response = await axiosInstance.patch(`/events/${eventId}`, data);
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await axiosInstance.delete(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Update event status
   * @param {string} eventId 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  updateEventStatus: async (eventId, status) => {
    const response = await axiosInstance.patch(`/events/${eventId}/status`, { status });
    return response.data;
  },

  /**
   * Get event attendance
   * @param {string} eventId 
   * @returns {Promise<Object>}
   */
  getAttendance: async (eventId) => {
    const response = await axiosInstance.get(`/events/${eventId}/attendance`);
    return response.data;
  },

  /**
   * Mark user attendance
   * @param {string} eventId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  markAttendance: async (eventId, userId) => {
    const response = await axiosInstance.post(`/events/${eventId}/attendance`, { userId });
    return response.data;
  },

  /**
   * Export event attendance
   * @param {string} eventId 
   * @returns {Promise<Blob>}
   */
  exportAttendance: async (eventId) => {
    const response = await axiosInstance.get(`/events/${eventId}/attendance/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get member's own attendance history
   * @returns {Promise<Object>}
   */
  getMyAttendance: async () => {
    const response = await axiosInstance.get('/events/my-attendance');
    return response.data;
  }
};
