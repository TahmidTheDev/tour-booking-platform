'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { tourService } from '@/services/tour.service';
import { useRouter } from 'next/navigation';
import { Tour } from '@/types';
import { Trash2, Edit, Plus, BarChart2 } from 'lucide-react';
import TourFormModal from '@/components/tours/TourFormModal';
import Link from 'next/link';

export default function AdminTours() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin' && user?.role !== 'lead-guide') {
      router.push('/');
    } else if (user?.role === 'admin' || user?.role === 'lead-guide') {
      fetchTours();
    }
  }, [user, authLoading, router]);

  const fetchTours = async () => {
    try {
      setIsLoading(true);
      const res = await tourService.getAllTours();
      setTours(res.data.data); // Based on getall response format
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tours');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this tour?')) return;
    
    setDeletingId(id);
    try {
      await tourService.deleteTour(id);
      setTours(tours.filter((t) => t._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete tour');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingTour(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tour: Tour) => {
    setEditingTour(tour);
    setIsModalOpen(true);
  };

  const closeModalAndRefresh = () => {
    setIsModalOpen(false);
    setEditingTour(null);
    fetchTours(); // Refresh list to get new/updated data
  };

  if (authLoading || isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading tours...</div>;
  }

  if (user?.role !== 'admin' && user?.role !== 'lead-guide') return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create, edit, and manage all tours.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/tours/stats" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <BarChart2 className="w-4 h-4 mr-2" /> Analytics
          </Link>
          <button onClick={openCreateModal} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Create Tour
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-md object-cover border border-gray-100" 
                          src={t.imageCover ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/tours/${t.imageCover}` : '/default-tour.jpg'} 
                          alt="" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{t.difficulty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {t.duration} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${t.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {t.ratingsAverage} ({t.ratingsQuantity})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <Link href={`/tours/${t._id}`} className="text-gray-500 hover:text-gray-900">
                        View
                      </Link>
                      <button onClick={() => openEditModal(t)} className="text-indigo-600 hover:text-indigo-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(t._id)} disabled={deletingId === t._id} className="text-red-500 hover:text-red-700 disabled:opacity-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <TourFormModal
          tour={editingTour}
          onClose={() => setIsModalOpen(false)}
          onSave={closeModalAndRefresh}
        />
      )}
    </div>
  );
}
