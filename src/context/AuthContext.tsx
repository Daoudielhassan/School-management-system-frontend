'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { IdentityServiceClient } from '@/lib/api-clients/identity-client';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { isTokenExpired } from '@/lib/utils';
import { toast } from 'react-toastify';
import { createLogger } from '@/lib/logger';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authLogger = createLogger('AuthContext');

const normalizeUserRole = (rawRole: string | null | undefined): UserRole | null => {
  if (!rawRole) return null;

  const normalized = rawRole.toUpperCase();
  const roleMap: Record<string, UserRole> = {
    ADMIN: UserRole.ADMIN,
    ADMINISTRATEUR: UserRole.ADMIN,
    MANAGER: UserRole.MANAGER,
    INSTRUCTOR: UserRole.INSTRUCTOR,
    PROFESSEUR: UserRole.INSTRUCTOR,
    STUDENT: UserRole.STUDENT,
    ETUDIANT: UserRole.STUDENT,
  };

  return roleMap[normalized] || null;
};

axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    role: null,
    userId: null,
    isAuthenticated: false,
    mustChangePassword: false,
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
    deleteCookie('mustChangePassword');

    // Remove axios header
    delete axios.defaults.headers.common['Authorization'];

    // Reset auth state
    setAuthState({
      token: null,
      role: null,
      userId: null,
      isAuthenticated: false,
      mustChangePassword: false,
    });

    // Redirect to login page
    router.push('/login');
  };

  // Set up axios response interceptor for handling expired tokens
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        (config as any).metadata = { startTime: Date.now() };
        authLogger.logRequest(
          config.method?.toUpperCase() ?? 'GET',
          config.url ?? '',
          Boolean(config.headers?.Authorization) ? '[authenticated]' : config.params,
        );
        return config;
      },
      (error) => {
        authLogger.error('Axios request setup failed', error);
        return Promise.reject(error);
      }
    );

    const interceptor = axios.interceptors.response.use(
      (response) => {
        const startTime = (response.config as any)?.metadata?.startTime as number | undefined;
        authLogger.logResponse(
          response.config.method?.toUpperCase() ?? 'GET',
          response.config.url ?? '',
          response.status,
          startTime ? Date.now() - startTime : 0,
        );
        return response;
      },
      (error) => {
        const config = error?.config;
        const startTime = config?.metadata?.startTime as number | undefined;
        authLogger.logApiError(
          config?.method?.toUpperCase() ?? 'GET',
          config?.url ?? '',
          error,
          startTime ? Date.now() - startTime : undefined,
        );

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
      axios.interceptors.request.eject(requestInterceptor);
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
    authLogger.debug('Initializing auth state from cookies');
    const token = getCookie('token');
    const role = normalizeUserRole(getCookie('role')?.toString());
    const userId = getCookie('userId')?.toString() || null;
    const mustChangePassword = getCookie('mustChangePassword') === 'true';

    authLogger.debug('Cookies found', { hasToken: Boolean(token), role, hasUserId: Boolean(userId) });

    if (token && role && userId) {
      // Check if token is expired before setting auth state
      if (typeof token === 'string' && isTokenExpired(token)) {
        authLogger.warn('Stored token is expired — clearing cookies');
        deleteCookie('token');
        deleteCookie('role');
        deleteCookie('userId');
        deleteCookie('mustChangePassword');
        return;
      }

      authLogger.info('Restoring authenticated session', { role, userId });
      setAuthState({
        token: token.toString(),
        role,
        userId,
        isAuthenticated: true,
        mustChangePassword,
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      authLogger.debug('No valid auth cookies found — staying unauthenticated');
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Use IdentityServiceClient for microservices
      const response = await IdentityServiceClient.login(credentials);

      const { token, role: rawRole, userId, id, mustChangePassword = false } = response;
      const role = normalizeUserRole(rawRole);
      const resolvedUserId = userId || (id != null ? String(id) : null);

      if (!role) {
        throw new Error(`Unsupported role returned by login API: ${rawRole}`);
      }

      if (!resolvedUserId) {
        throw new Error('Login response did not include userId or id.');
      }

      // Set cookies
      setCookie('token', token);
      setCookie('role', role);
      setCookie('userId', resolvedUserId);
      setCookie('mustChangePassword', String(mustChangePassword));

      // Set auth state
      setAuthState({
        token,
        role,
        userId: resolvedUserId,
        isAuthenticated: true,
        mustChangePassword,
      });

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      authLogger.info('Login successful', { userId: resolvedUserId, role, mustChangePassword });

      // If first login, force password change before accessing dashboard
      if (mustChangePassword) {
        router.push('/change-password');
        return;
      }

      // Redirect based on role
      const rolePathMap: Record<UserRole, string> = {
        [UserRole.STUDENT]: '/student',
        [UserRole.INSTRUCTOR]: '/professor',
        [UserRole.MANAGER]: '/manager',
        [UserRole.ADMIN]: '/admin'
      };
      router.push(`${rolePathMap[role]}/`);
    } catch (error: any) {
      authLogger.error('Login failed', error, { email: credentials.email });

      // Enhanced error handling for microservices
      if (error.status) {
        switch (error.status) {
          case 401:
            throw new Error('Invalid email or password');
          case 403:
            throw new Error('Account is disabled');
          case 404:
            throw new Error('Login service not found');
          case 500:
          case 502:
          case 503:
          case 504:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(error.message || 'Login failed');
        }
      }

      // Handle network errors
      if (error.message.includes('fetch')) {
        throw new Error('No response from server. Please try again later.');
      }

      throw new Error(error.message || 'Network error. Please check your connection.');
    }
  };

  const clearMustChangePassword = () => {
    deleteCookie('mustChangePassword');
    setAuthState((prev) => ({ ...prev, mustChangePassword: false }));
  };

  const logout = () => {
    authLogger.info('User logged out', { userId: authState.userId, role: authState.role });
    deleteCookie('token');
    deleteCookie('role');
    deleteCookie('userId');
    deleteCookie('mustChangePassword');

    // Remove axios header
    delete axios.defaults.headers.common['Authorization'];

    // Reset auth state
    setAuthState({
      token: null,
      role: null,
      userId: null,
      isAuthenticated: false,
      mustChangePassword: false,
    });
    router.push('/login');
  };

  const checkAuth = () => {
    return authState.isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, checkAuth, clearMustChangePassword }}>
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