'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { reviewService } from '@/services/review.service';
import { Star } from 'lucide-react';

export default function ReviewForm({ tourId, onReviewAdded }: { tourId: string, onReviewAdded: () => void }) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.role !== 'user') return null; // Only users can review

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await reviewService.createReview(tourId, { rating, review });
      setReview('');
      setRating(5);
      onReviewAdded(); // Usually reloads or refetches
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-8 rounded-2xl max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center uppercase tracking-tight">Leave a Review</h3>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Your Rating</label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience</label>
          <textarea
            required
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us about your adventure..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-sm"
          ></textarea>
        </div>
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
