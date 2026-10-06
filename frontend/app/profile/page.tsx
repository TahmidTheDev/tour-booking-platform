'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/user.service';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, checkAuthStatus, logout } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (photo) {
        formData.append('photo', photo);
      }

      await userService.updateMe(formData);
      await checkAuthStatus(); // Refresh user data in store
      setUpdateSuccess('Profile updated successfully!');
      setPhoto(null);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivateError('');
    setIsDeactivating(true);
    try {
      await userService.deleteMe();
      await logout(); // Clear local state
      router.push('/login');
    } catch (err: any) {
      setDeactivateError(err.message || 'Failed to deactivate account');
      setIsDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Your Profile</h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {updateError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-sm text-red-700">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md text-sm text-green-700">
              {updateSuccess}
            </div>
          )}

          <div className="flex items-center space-x-6">
            <div className="shrink-0">
              <img
                className="h-24 w-24 object-cover rounded-full border border-gray-200"
                src={photoPreview || (user.photo !== 'default.jpg' ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/users/${user.photo}` : '/default-user.jpg')} // Fallback if no default in public
                alt="Profile photo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + user.name;
                }}
              />
            </div>
            <label className="block">
              <span className="sr-only">Choose profile photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm">
              Role: <span className="font-semibold px-2 py-1 bg-gray-100 rounded-md capitalize">{user.role}</span>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-red-50 p-8 rounded-xl border border-red-100">
        <h3 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">
          Once you deactivate your account, you will be logged out immediately. Your profile will no longer be visible.
        </p>
        
        {deactivateError && (
          <div className="mb-4 text-sm text-red-700 font-medium">
            {deactivateError}
          </div>
        )}

        {!showDeactivateConfirm ? (
          <button
            onClick={() => setShowDeactivateConfirm(true)}
            className="inline-flex justify-center py-2 px-4 border border-red-200 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Deactivate Account
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-red-800">Are you sure?</span>
            <button
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 transition-colors"
            >
              {isDeactivating ? 'Deactivating...' : 'Yes, Deactivate'}
            </button>
            <button
              onClick={() => setShowDeactivateConfirm(false)}
              disabled={isDeactivating}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => router.push('/profile/reviews')}
          className="inline-flex items-center space-x-2 py-3 px-6 bg-white border border-gray-200 rounded-xl text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <span>My Reviews</span>
        </button>
        <button
          onClick={() => router.push('/profile/bookings')}
          className="inline-flex items-center space-x-2 py-3 px-6 bg-white border border-gray-200 rounded-xl text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <span>My Bookings</span>
        </button>
      </div>
    </div>
  );
}
