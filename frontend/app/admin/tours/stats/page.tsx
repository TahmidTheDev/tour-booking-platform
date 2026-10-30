'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { tourService } from '@/services/tour.service';
import { useRouter } from 'next/navigation';

export default function AdminTourStats() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [stats, setStats] = useState<any[]>([]);
  const [monthlyPlan, setMonthlyPlan] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin' && user?.role !== 'lead-guide') {
      router.push('/');
    } else if (user?.role === 'admin' || user?.role === 'lead-guide') {
      fetchData();
    }
  }, [user, authLoading, router, year]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, planRes] = await Promise.all([
        tourService.getTourStats(),
        tourService.getMonthlyPlan(year)
      ]);
      setStats(statsRes.data.stats);
      setMonthlyPlan(planRes.data.plan);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  }

  if (user?.role !== 'admin' && user?.role !== 'lead-guide') return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tour Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of tour performance and monthly planning.</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="space-y-12">
        {/* Tour Stats by Difficulty */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tour Stats by Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">{stat._id || 'ALL'}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span className="font-medium">Total Tours:</span> <span>{stat.numTours}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Avg Rating:</span> <span>{stat.avgRating?.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Total Ratings:</span> <span>{stat.numRatings}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Avg Price:</span> <span>${stat.avgPrice?.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Min Price:</span> <span>${stat.minPrice}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Max Price:</span> <span>${stat.maxPrice}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Plan */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Monthly Plan</h2>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tours Starting</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour Names</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyPlan.map((plan, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(0, plan.month - 1).toLocaleString('default', { month: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">{plan.numTourStarts}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {plan.tours.join(', ')}
                    </td>
                  </tr>
                ))}
                {monthlyPlan.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">No tours scheduled for this year.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
