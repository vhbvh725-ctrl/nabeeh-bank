import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('nabeeh_token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('nabeeh_token', token);
    } else {
      localStorage.removeItem('nabeeh_token');
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('nabeeh_token');
    set({ token: null });
  },
}));
