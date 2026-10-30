'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { bookingService } from '@/services/booking.service';
import { Booking } from '@/types';
import Link from 'next/link';
import { Calendar, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyBookings() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMyBookings();
    }
  }, [user, authLoading, router]);

  const fetchMyBookings = async () => {
    try {
      setIsLoading(true);
      const res = await bookingService.getMyBookings();
      setBookings(res.data.data); // Factory getAll format
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your bookings');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <div className="p-12 text-center text-gray-500">Loading your bookings...</div>;
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">My Bookings</h1>
        <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          &larr; Back to Profile
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="relative h-48">
                <img 
                  src={booking.tour?.imageCover ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/tours/${booking.tour.imageCover}` : '/default-tour.jpg'}
                  alt={booking.tour?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {booking.paid ? 'PAID' : 'PENDING'}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-tight">{booking.tour?.name || 'Deleted Tour'}</h3>
                
                <div className="space-y-3 text-sm text-gray-600 mb-6 flex-grow">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                    <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center font-semibold text-gray-900">
                    <DollarSign className="w-4 h-4 text-green-500 mr-1 shrink-0" />
                    <span>${booking.price}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <Link
                    href={`/tours/${booking.tour?._id}`}
                    className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    View Tour Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">You haven't booked any adventures yet. Time to explore!</p>
            <Link href="/tours" className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors">
              Discover Tours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
