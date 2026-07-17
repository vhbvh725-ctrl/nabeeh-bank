import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  async function loadAuth() {
    try {
      const stored = await AsyncStorage.getItem('nabeeh_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, _password: string) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const mockUser: User = {
      id: '1',
      name: 'Ahmed Al-Rashidi',
      email,
      phone: '+966 55 123 4567',
    };
    await AsyncStorage.setItem('nabeeh_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
  }

  async function register(name: string, email: string, phone: string, _password: string) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
    };
    await AsyncStorage.setItem('nabeeh_user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
  }

  async function logout() {
    await AsyncStorage.removeItem('nabeeh_user');
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
