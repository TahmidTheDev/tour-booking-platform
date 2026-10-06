import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuthStatus: async () => {
    try {
      const data = await authService.getMe();
      set({ user: data.data.data, isAuthenticated: true, isLoading: false }); // Based on backend getMe response format
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  login: async (data: any) => {
    const res = await authService.login(data);
    set({ user: res.data.user, isAuthenticated: true });
  },
  signup: async (data: any) => {
    const res = await authService.signup(data);
    set({ user: res.data.user, isAuthenticated: true });
  },
  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
