'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { reviewService } from '@/services/review.service';
import { Review } from '@/types';
import { Trash2, Edit, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminReviews() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.push('/');
    } else if (user?.role === 'admin') {
      fetchReviews();
    }
  }, [user, authLoading, router]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await reviewService.getReviews();
      setReviews(res.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    
    setDeletingId(id);
    try {
      await reviewService.deleteReview(id);
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (r: Review) => {
    setEditingReview(r);
    setEditRating(r.rating);
    setEditComment(r.review);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    
    setIsSaving(true);
    try {
      await reviewService.updateReview(editingReview._id, { rating: editRating, review: editComment });
      setReviews(reviews.map(r => r._id === editingReview._id ? { ...r, rating: editRating, review: editComment } : r));
      setEditingReview(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update review');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;
  }

  if (user?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="mt-1 text-sm text-gray-500">Moderate all user reviews across the platform.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Comment</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-8 w-8">
                        <img 
                          className="h-8 w-8 rounded-full object-cover border border-gray-100" 
                          src={r.user?.photo && r.user.photo !== 'default.jpg' ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/users/${r.user.photo}` : `https://ui-avatars.com/api/?name=${r.user?.name || 'User'}`} 
                          alt="" 
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${r.user?.name || 'User'}`; }}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{r.user?.name || 'Deleted User'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof r.tour === 'object' ? r.tour.name : r.tour}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {r.review}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => openEditModal(r)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Edit Review"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        disabled={deletingId === r._id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No reviews found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Moderate Review</h3>
              <button onClick={() => setEditingReview(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setEditRating(star)} className="focus:outline-none">
                      <Star className={`w-6 h-6 ${star <= editRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 disabled:opacity-70 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
