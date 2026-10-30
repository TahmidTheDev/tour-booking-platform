'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { reviewService } from '@/services/review.service';
import { Review } from '@/types';
import { Star, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyReviews() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMyReviews();
    }
  }, [user, authLoading, router]);

  const fetchMyReviews = async () => {
    try {
      setIsLoading(true);
      // Backend getAll handles ?user=ID filtering
      const res = await reviewService.getReviews({ user: user?._id });
      setReviews(res.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(id);
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.review);
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

  if (authLoading || isLoading) return <div className="p-12 text-center text-gray-500">Loading your reviews...</div>;
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">My Reviews</h1>
        <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          &larr; Back to Profile
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">
                    {typeof review.tour === 'object' ? review.tour.name : 'Unknown Tour'}
                  </h4>
                  <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(review)} className="text-indigo-500 hover:text-indigo-700 transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(review._id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-gray-600 text-sm flex-grow">{review.review}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-6">You haven't written any reviews for your tours.</p>
            <Link href="/tours" className="text-indigo-600 font-medium hover:text-indigo-800">Browse Tours</Link>
          </div>
        )}
      </div>

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center uppercase tracking-tight">Edit Review</h3>
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Your Rating</label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setEditRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${star <= editRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                <textarea required rows={4} value={editComment} onChange={(e) => setEditComment(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-sm"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setEditingReview(null)} className="px-6 py-2 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
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
