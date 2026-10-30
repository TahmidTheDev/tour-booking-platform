'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout, checkAuthStatus } = useAuthStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (!mounted) return null;

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <a href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 tracking-tight">TourApp</span>
            </a>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {(user?.role === 'admin' || user?.role === 'lead-guide') && (
                <>
                  <Link href="/admin/tours" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                    Manage Tours
                  </Link>
                  <Link href="/admin/bookings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                    Bookings
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin/reviews" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Reviews
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : isAuthenticated ? (
              <>
                <Link href="/profile" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  {user?.photo && user.photo !== 'default.jpg' ? (
                    <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/users/${user.photo}`} alt={user?.name || 'User'} className="h-8 w-8 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + (user?.name || 'User'); }} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  )}
                  <span>My Profile</span>
                </Link>

                <Link href="/profile/bookings" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ml-4">
                  My Bookings
                </Link>

                {user?.role === 'admin' && (
                  <Link href="/admin/users" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ml-4 border-l pl-4 border-gray-200">
                    User Management
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
                <Link href="/profile/change-password" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ml-4 border-l pl-4 border-gray-200">
                  Change Password
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
