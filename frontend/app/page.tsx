'use client';

import { useState, useEffect } from 'react';
import { tourService } from '@/services/tour.service';
import { Tour } from '@/types';
import Link from 'next/link';
import { Calendar, MapPin, TrendingUp, DollarSign, Star } from 'lucide-react';

function TourCard({ tour }: { tour: Tour }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-56">
        <img
          src={tour.imageCover ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/tours/${tour.imageCover}` : '/default-tour.jpg'}
          alt={tour.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm flex items-center">
          <Star className="w-4 h-4 text-yellow-500 mr-1" />
          {tour.ratingsAverage} ({tour.ratingsQuantity})
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight uppercase tracking-tight">{tour.name}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6 line-clamp-2">{tour.summary}</p>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-gray-700 mb-6 flex-grow">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
            <span className="truncate">{tour.startLocation?.description || 'Multiple Locations'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
            <span>{tour.startDates?.[0] ? new Date(tour.startDates[0]).toLocaleString('default', { month: 'short', year: 'numeric' }) : 'TBA'}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
            <span className="capitalize">{tour.difficulty}</span>
          </div>
          <div className="flex items-center font-semibold text-gray-900">
            <DollarSign className="w-4 h-4 text-green-500 mr-1 shrink-0" />
            <span>{tour.price}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link
            href={`/tours/${tour._id}`}
            className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('-ratingsAverage');
  const [maxPrice, setMaxPrice] = useState(5000);

  useEffect(() => {
    fetchTours();
  }, [difficulty, sort]); // refetch when these change directly

  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (difficulty) params.difficulty = difficulty;
      if (sort) params.sort = sort;
      if (maxPrice < 5000) params['price[lte]'] = maxPrice;
      
      const res = await tourService.getAllTours(params);
      setTours(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTours = search 
    ? tours.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : tours;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Section */}
      <div className="bg-emerald-900 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-6 uppercase tracking-wider">Discover Your Next Adventure</h1>
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search tours by name, location, or keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-400 shadow-xl text-gray-900 text-lg border-2 border-transparent transition-all"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider mb-4">Filters</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="w-full border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="-ratingsAverage">Top Rated</option>
                <option value="price">Price (Low to High)</option>
                <option value="-price">Price (High to Low)</option>
                <option value="duration">Duration (Short to Long)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price: ${maxPrice < 5000 ? maxPrice : 'Any'}
              </label>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100"
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                onMouseUp={fetchTours}
                onTouchEnd={fetchTours}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Tour Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl h-[450px] shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-56 bg-gray-200 rounded-t-2xl" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 w-3/4 mb-4 rounded" />
                    <div className="h-4 bg-gray-200 w-full mb-2 rounded" />
                    <div className="h-4 bg-gray-200 w-5/6 mb-6 rounded" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map(tour => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => {
                  setSearch(''); setDifficulty(''); setSort('-ratingsAverage'); setMaxPrice(5000); fetchTours();
                }}
                className="mt-6 text-emerald-600 font-medium hover:text-emerald-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
