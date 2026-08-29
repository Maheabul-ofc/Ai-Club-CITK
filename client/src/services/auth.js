import axiosInstance from '../lib/axios.js';

export const authService = {
  signupMember: async (data) => {
    const response = await axiosInstance.post('/auth/signup/member', data);
    return response.data;
  },
  
  signupCoordinator: async (data) => {
    const response = await axiosInstance.post('/auth/signup/coordinator', data);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  },
  
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
