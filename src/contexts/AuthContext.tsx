'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { API_ENDPOINTS } from '@/config/api';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    role: null,
    userId: null,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    const role = getCookie('role') as UserRole | null;
    const userId = Number(getCookie('userId')) || null;
    
    if (token && role && userId) {
      setAuthState({
        token: token.toString(),
        role,
        userId,
        isAuthenticated: true,
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.LOGIN,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      if (response.status === 200) {
        const { token, role, id } = response.data;
        
        // Set cookies
        setCookie('token', token);
        setCookie('role', role);
        setCookie('userId', id);
        
        // Set auth state
        setAuthState({
          token,
          role,
          userId: id,
          isAuthenticated: true,
        });

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Redirect based on role
        const rolePathMap: Record<UserRole, string> = {
          [UserRole.ETUDIANT]: '/student',
          [UserRole.PROFESSEUR]: '/professor',
          [UserRole.MANAGER]: '/manager',
          [UserRole.ADMINISTRATEUR]: '/admin'
        };
        router.push(`${rolePathMap[role as UserRole]}/dashboard`);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              throw new Error('Invalid email or password');
            case 403:
              throw new Error('Account is disabled');
            case 404:
              throw new Error('Login service not found');
            case 500:
              throw new Error('Server error. Please try again later.');
            default:
              throw new Error(error.response.data?.message || 'Login failed');
          }
        } else if (error.request) {
          throw new Error('No response from server. Please try again later.');
        }
      }
      throw new Error('Network error. Please check your connection.');
    }
  };

  const logout = () => {
    // Remove cookies
    deleteCookie('token');
    deleteCookie('role');
    deleteCookie('userId');
    
    // Remove axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset auth state
    setAuthState({
      token: null,
      role: null,
      userId: null,
      isAuthenticated: false,
    });
    router.push('/login');
  };

  const checkAuth = () => {
    return authState.isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};