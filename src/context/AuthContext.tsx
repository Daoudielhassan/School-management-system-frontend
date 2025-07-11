'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { API_ENDPOINTS } from '@/config/api';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { isTokenExpired } from '@/lib/utils';
import { toast } from 'react-toastify';

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

  // Function to handle token expiration
  const handleTokenExpiration = () => {
    // Show notification to user
    toast.warning('Your session has expired. Please log in again.');
    
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
    
    // Redirect to login page
    router.push('/login');
  };

  // Set up axios response interceptor for handling expired tokens
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          // Handle 401 (Unauthorized) and 403 (Forbidden) responses
          if (error.response?.status === 401 || error.response?.status === 403) {
            // Only handle token expiration if we have a token (user is authenticated)
            if (authState.token) {
              handleTokenExpiration();
            }
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [authState.token]);

  // Periodic token validation check
  useEffect(() => {
    if (!authState.token) return;

    const checkTokenExpiration = () => {
      if (authState.token && isTokenExpired(authState.token)) {
        handleTokenExpiration();
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Set up periodic check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [authState.token]);

  useEffect(() => {
    console.log("AuthContext: Initializing auth state from cookies...");
    const token = getCookie('token');
    const role = getCookie('role') as UserRole | null;
    const userId = Number(getCookie('userId')) || null;
    
    console.log("AuthContext: Cookies found - token:", token ? "present" : "missing", "role:", role, "userId:", userId);
    
    if (token && role && userId) {
      // Check if token is expired before setting auth state
      if (typeof token === 'string' && isTokenExpired(token)) {
        console.log("AuthContext: Token is expired, clearing cookies");
        // Clear expired cookies
        deleteCookie('token');
        deleteCookie('role');
        deleteCookie('userId');
        return;
      }
      
      console.log("AuthContext: Setting authenticated state");
      setAuthState({
        token: token.toString(),
        role,
        userId,
        isAuthenticated: true,
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.log("AuthContext: No valid auth cookies found, staying unauthenticated");
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.LOGIN,
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
        router.push(`${rolePathMap[role as UserRole]}/`);
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