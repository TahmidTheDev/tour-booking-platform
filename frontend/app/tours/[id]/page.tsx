'use client';

import { useState, useEffect } from 'react';
import { tourService } from '@/services/tour.service';
import { Tour } from '@/types';
import { Calendar, Users, Star, TrendingUp, MapPin } from 'lucide-react';
import { use } from 'react';
import ReviewForm from '@/components/tours/ReviewForm';
import CheckoutModal from '@/components/tours/CheckoutModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function TourDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { user } = useAuthStore();
  const router = useRouter();

  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await tourService.getTourById(id);
        setTour(res.data.data); // Based on getOne format
      } catch (err: any) {
        setError('Tour not found or an error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 w-full" />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 w-1/3 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
          </div>
          <div className="h-4 bg-gray-200 w-full mb-2" />
          <div className="h-4 bg-gray-200 w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return <div className="p-12 text-center text-red-500">{error || 'Tour not found.'}</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/tours/${tour.imageCover}`}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-wider mb-4">
            {tour.name}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-white/90 font-medium">
            <span className="flex items-center"><TrendingUp className="w-5 h-5 mr-1" /> {tour.duration} DAYS</span>
            <span className="flex items-center"><MapPin className="w-5 h-5 mr-1" /> {tour.startLocation?.description || 'Multiple Locations'}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="flex flex-col items-center text-center">
            <Calendar className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">Next Date</span>
            <span className="font-medium text-gray-900">
              {tour.startDates?.[0] ? new Date(tour.startDates[0]).toLocaleString('en-us', { month: 'long', year: 'numeric' }) : 'TBA'}
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">Difficulty</span>
            <span className="font-medium text-gray-900 capitalize">{tour.difficulty}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">Group Size</span>
            <span className="font-medium text-gray-900">{tour.maxGroupSize} People</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Star className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">Rating</span>
            <span className="font-medium text-gray-900">{tour.ratingsAverage} / 5</span>
          </div>
        </div>

        {/* Details & Guides */}
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-tight">About {tour.name}</h2>
            <div className="prose prose-lg text-gray-600">
              {tour.description?.split('\n').map((p, i) => (
                <p key={i} className="mb-4">{p}</p>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Your Tour Guides</h2>
            <div className="space-y-6">
              {tour.guides?.map((guide, index) => (
                <div key={guide._id || index} className="flex items-center space-x-4">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/users/${guide.photo}`}
                    alt={guide.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${guide.name}`; }}
                  />
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{guide.role.replace('-', ' ')}</p>
                    <p className="font-medium text-gray-900">{guide.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery */}
        {tour.images && tour.images.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center uppercase tracking-tight">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tour.images.map((img, i) => (
                <div key={i} className={`overflow-hidden rounded-xl ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/tours/${img}`}
                    alt={`Tour ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center uppercase tracking-tight">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tour.reviews && tour.reviews.length > 0 ? (
              tour.reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={review.user?.photo && review.user.photo !== 'default.jpg' ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/users/${review.user.photo}` : `https://ui-avatars.com/api/?name=${review.user?.name || 'User'}`} 
                      alt={review.user?.name} 
                      className="w-12 h-12 rounded-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.user?.name || 'User'}`; }}
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{review.user?.name}</h4>
                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
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
              <p className="text-gray-500 col-span-full text-center">No reviews yet. Be the first to review this tour!</p>
            )}
          </div>

          {/* Add Review Form for Users */}
          <ReviewForm tourId={tour._id} onReviewAdded={() => window.location.reload()} />
        </div>

        {/* CTA */}
        <div className="bg-indigo-50 rounded-2xl p-12 text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What are you waiting for?</h2>
          <p className="text-lg text-gray-600 mb-8">{tour.duration} days. 1 adventure. Infinite memories. Make it yours today!</p>
          <button 
            onClick={() => user ? (user.role === 'user' ? setIsCheckoutOpen(true) : alert('Only normal users can book tours.')) : router.push('/login')}
            className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {user ? `Book tour now! - $${tour.price}` : 'Log in to book tour'}
          </button>
        </div>
      </div>

      {isCheckoutOpen && tour && (
        <CheckoutModal tour={tour} onClose={() => setIsCheckoutOpen(false)} />
      )}
    </div>
  );
}
