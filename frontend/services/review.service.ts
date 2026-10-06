import api from '@/lib/api/axios';

export const reviewService = {
  getReviews: async (params?: any) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },
  getTourReviews: async (tourId: string, params?: any) => {
    const response = await api.get(`/tours/${tourId}/reviews`, { params });
    return response.data;
  },
  createReview: async (tourId: string, data: { rating: number; review: string }) => {
    const response = await api.post(`/tours/${tourId}/reviews`, data);
    return response.data;
  },
  updateReview: async (id: string, data: { rating?: number; review?: string }) => {
    const response = await api.patch(`/reviews/${id}`, data);
    return response.data;
  },
  deleteReview: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};
