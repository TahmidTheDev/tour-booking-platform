'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/user.service';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Trash2, Edit } from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && currentUser?.role !== 'admin') {
      router.push('/');
    } else if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser, authLoading, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getAllUsers();
      setUsers(res.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    
    setDeletingId(userId);
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditActive(u.active !== false); // Default to true if undefined
    setEditPhoto(null);
    setSaveError('');
    setSaveSuccess('');
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      // The backend PATCH /api/v1/users/:id does not have Multer middleware, 
      // so it cannot parse multipart/form-data. We must send JSON.
      // Photo uploads are not supported on this endpoint.
      const payload = {
        name: editName,
        email: editEmail,
        role: editRole,
        active: editActive,
      };

      await userService.updateUser(editingUser._id, payload);
      setSaveSuccess('User updated successfully!');
      
      // Refresh user list
      fetchUsers();
      
      // Close modal after short delay
      setTimeout(() => closeEditModal(), 1500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading users...</div>;
  }

  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all users, roles, and accounts in the system.</p>
        </div>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover border border-gray-100" 
                          src={u.photo && u.photo !== 'default.jpg' ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/users/${u.photo}` : `https://ui-avatars.com/api/?name=${u.name}&background=random`} 
                          alt="" 
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + u.name; }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => openEditModal(u)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={deletingId === u._id || u._id === currentUser?._id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {saveError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{saveError}</div>
              )}
              {saveSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{saveSuccess}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={editingUser._id === currentUser?._id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm capitalize"
                >
                  <option value="user">User</option>
                  <option value="guide">Guide</option>
                  <option value="lead-guide">Lead Guide</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editActive ? 'true' : 'false'}
                  onChange={(e) => setEditActive(e.target.value === 'true')}
                  disabled={editingUser._id === currentUser?._id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPhoto(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Note: Backend endpoint currently does not support multipart photo uploads via Admin. Sending JSON instead.
                </p>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
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
