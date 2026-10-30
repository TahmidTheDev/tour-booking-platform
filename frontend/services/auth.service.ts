import api from '@/lib/api/axios';
import { User } from '@/types';

export const authService = {
  signup: async (data: any) => {
    const response = await api.post('/users/signup', data);
    return response.data;
  },
  login: async (data: any) => {
    const response = await api.post('/users/login', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.get('/users/logout');
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/users/forgotPassword', { email });
    return response.data;
  },
  resetPassword: async (token: string, data: any) => {
    const response = await api.patch(`/users/resetPassword/${token}`, data);
    return response.data;
  },
  updateMyPassword: async (data: any) => {
    const response = await api.patch('/users/updateMyPassword', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};
