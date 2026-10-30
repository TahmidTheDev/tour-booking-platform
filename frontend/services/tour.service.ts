import api from '@/lib/api/axios';
import { Tour } from '@/types';

export const tourService = {
  getAllTours: async (params?: any) => {
    const response = await api.get('/tours', { params });
    return response.data;
  },
  getTourById: async (id: string) => {
    const response = await api.get(`/tours/${id}`);
    return response.data;
  },
  createTour: async (formData: FormData) => {
    const response = await api.post('/tours', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateTour: async (id: string, formData: FormData) => {
    const response = await api.patch(`/tours/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteTour: async (id: string) => {
    const response = await api.delete(`/tours/${id}`);
    return response.data;
  },
  getTourStats: async () => {
    const response = await api.get('/tours/tour-stats');
    return response.data;
  },
  getMonthlyPlan: async (year: number) => {
    const response = await api.get(`/tours/monthly-plan/${year}`);
    return response.data;
  },
};
