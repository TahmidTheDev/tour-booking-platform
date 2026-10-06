import api from '@/lib/api/axios';

export const bookingService = {
  createBooking: async (data: { tour: string; user: string; price: number; paid: boolean }) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-tours');
    return response.data;
  },
  getAllBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  updateBooking: async (id: string, data: any) => {
    const response = await api.patch(`/bookings/${id}`, data);
    return response.data;
  },
  deleteBooking: async (id: string) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  }
};
