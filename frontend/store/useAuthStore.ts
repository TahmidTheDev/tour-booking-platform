import { create } from "zustand";
import { User } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const saveToken = (token?: string) => {
  if (token) localStorage.setItem("token", token);
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuthStatus: async () => {
    // No saved token, so no point calling the API
    if (!localStorage.getItem("token")) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const data = await authService.getMe();
      set({ user: data.data.data, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      if (error.status === 401) {
        // Token is really invalid/expired
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        // Network error, Render cold start, 500: keep the session
        set({ isLoading: false });
      }
    }
  },

  login: async (data: any) => {
    const res = await authService.login(data);
    saveToken(res.token);
    set({ user: res.data.user, isAuthenticated: true, isLoading: false });
  },

  signup: async (data: any) => {
    const res = await authService.signup(data);
    saveToken(res.token);
    set({ user: res.data.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      // Always clear locally, even if the API call fails
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false });
    }
  },
}));
