# 🎨 Frontend Development Guide - SMS Microservices

Guide complet pour développer des applications frontend avec l'architecture microservices SMS.

**Date**: 25 janvier 2026  
**API Gateway**: `http://localhost:8080`  
**Version**: 1.0.0

---

## 📋 Table des matières

1. [Architecture & Configuration](#architecture--configuration)
2.  [Authentification JWT](#authentification-jwt)
3. [Configuration HTTP Client](#configuration-http-client)
4. [API par domaine fonctionnel](#api-par-domaine-fonctionnel)
5. [Exemples de code](#exemples-de-code)
6. [Gestion d'erreurs](#gestion-derreurs)
7. [Best practices](#best-practices)
8. [Workflows utilisateur](#workflows-utilisateur)

---

## Architecture & Configuration

### API Gateway - Point d'entrée unique

**Toutes les requêtes passent par l'API Gateway** sur le port `8080`.

```
Frontend (React/Vue/Angular)
    ↓
http://localhost:8080 (API Gateway)
    ↓
Routes vers microservices
    ├── /api/auth → Identity Service (8084)
    ├── /api/students → Student Service (8086)
    ├── /api/attendance → Attendance Service (8090)
    ├── /api/messages → Messaging Service (8091)
    └── ...
```

### Configuration de base

```typescript
// config/api.config.ts
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Endpoints par domaine
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VALIDATE: '/api/auth/validate'
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
    BY_USERNAME: (username: string) => `/api/users/username/${username}`,
    BY_ROLE: (role: string) => `/api/users/role/${role}`
  },
  STUDENTS: {
    BASE: '/api/students',
    BY_ID: (id: string) => `/api/students/${id}`,
    SEARCH: '/api/students/search',
    BY_STATUS: (status: string) => `/api/students/status/${status}`
  },
  ATTENDANCE: {
    BASE: '/api/attendance',
    BY_STUDENT: (id: string) => `/api/attendance/student/${id}`,
    STATISTICS: (id: string) => `/api/attendance/student/${id}/statistics`,
    PENDING: '/api/attendance/pending',
    JUSTIFY: (id: string) => `/api/attendance/${id}/justify`,
    VALIDATE: (id: string) => `/api/attendance/${id}/validate`
  },
  SESSIONS: {
    BASE: '/api/sessions',
    WEEK_SCHEDULE: (classGroupId: string) => 
      `/api/sessions/classgroup/${classGroupId}/week`,
    WEEK_GROUPED: (classGroupId: string) => 
      `/api/sessions/classgroup/${classGroupId}/week/grouped`
  },
  MESSAGES: {
    BASE: '/api/messages',
    RECEIVED: (userId: string) => `/api/messages/received/${userId}`,
    UNREAD: (userId: string) => `/api/messages/unread/${userId}`
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    USER: (userId: string) => `/api/notifications/user/${userId}`,
    UNREAD: (userId: string) => `/api/notifications/user/${userId}/unread`,
    READ_ALL: (userId: string) => `/api/notifications/user/${userId}/read-all`
  }
};
```

---

## Authentification JWT

### 1. Workflow d'authentification

```
1. Utilisateur soumet credentials
   POST /api/auth/login { username, password }
   ↓
2. Backend retourne JWT
   { token: "ey...", username, roles: [] }
   ↓
3. Frontend stocke token
   localStorage.setItem('token', data.token)
   ↓
4. Toutes les requêtes incluent token
   Authorization: Bearer {token}
```

### 2. Service d'authentification

```typescript
// services/auth.service.ts
import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../config/api.config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  roles: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

class AuthService {
  private readonly TOKEN_KEY = 'sms_auth_token';
  private readonly USER_KEY = 'sms_user_data';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_CONFIG.baseURL}${ENDPOINTS.AUTH.LOGIN}`,
        credentials
      );
      
      // Stocker le token
      this.setToken(response.data.token);
      this.setUser({username: response.data.username, roles: response.data.roles});
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<any> {
    const response = await axios.post(
      `${API_CONFIG.baseURL}${ENDPOINTS.AUTH.REGISTER}`,
      data
    );
    return response.data;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get<boolean>(
        `${API_CONFIG.baseURL}${ENDPOINTS.AUTH.VALIDATE}`,
        { params: { token } }
      );
      return response.data;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles?.includes(role) || false;
  }
}

export default new AuthService();
```

---

## Configuration HTTP Client

### Intercepteur Axios avec JWT

```typescript
// services/api.service.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api.config';
import authService from './auth.service';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Ajouter JWT token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Gérer les erreurs
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 401 Unauthorized - Token expiré ou invalide
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          authService.logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // 403 Forbidden - Pas les permissions
        if (error.response?.status === 403) {
          console.error('Access denied');
          // Rediriger vers page d'erreur ou afficher message
        }

        return Promise.reject(error);
      }
    );
  }

  // Méthodes HTTP
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}

export default new ApiService();
```

---

## API par domaine fonctionnel

### 1. Gestion des étudiants

```typescript
// services/student.service.ts
import api from './api.service';
import { ENDPOINTS } from '../config/api.config';

export interface Student {
  id: string;
  userId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
}

class StudentService {
  async getAllStudents(): Promise<Student[]> {
    return api.get(ENDPOINTS.STUDENTS.BASE);
  }

  async getStudentById(id: string): Promise<Student> {
    return api.get(ENDPOINTS.STUDENTS.BY_ID(id));
  }

  async searchStudents(query: string): Promise<Student[]> {
    return api.get(ENDPOINTS.STUDENTS.SEARCH, {
      params: { query }
    });
  }

  async getStudentsByStatus(status: string): Promise<Student[]> {
    return api.get(ENDPOINTS.STUDENTS.BY_STATUS(status));
  }

  async createStudent(data: Partial<Student>): Promise<Student> {
    return api.post(ENDPOINTS.STUDENTS.BASE, data);
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    return api.put(ENDPOINTS.STUDENTS.BY_ID(id), data);
  }

  async deleteStudent(id: string): Promise<void> {
    return api.delete(ENDPOINTS.STUDENTS.BY_ID(id));
  }
}

export default new StudentService();
```

### 2. Gestion des présences

```typescript
// services/attendance.service.ts
import api from './api.service';
import { ENDPOINTS } from '../config/api.config';

export interface Attendance {
  id: string;
  studentId: string;
  classGroupId: string;
  subjectId: string;
  sessionDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  validationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED';
  justification?: string;
}

export interface AttendanceStatistics {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  pendingValidations: number;
}

class AttendanceService {
  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    return api.get(ENDPOINTS.ATTENDANCE.BY_STUDENT(studentId));
  }

  async getStudentStatistics(studentId: string): Promise<AttendanceStatistics> {
    return api.get(ENDPOINTS.ATTENDANCE.STATISTICS(studentId));
  }

  async submitJustification(attendanceId: string, justification: string): Promise<Attendance> {
    return api.post(ENDPOINTS.ATTENDANCE.JUSTIFY(attendanceId), {
      justification
    });
  }

  async getPendingAttendances(classGroupId?: string): Promise<Attendance[]> {
    return api.get(ENDPOINTS.ATTENDANCE.PENDING, {
      params: { classGroupId }
    });
  }

  async validateAttendance(attendanceId: string, data: {
    validatedBy: string;
    decision: 'VALIDATED' | 'REJECTED';
    managerComment: string;
  }): Promise<any> {
    return api.put(ENDPOINTS.ATTENDANCE.VALIDATE(attendanceId), data);
  }
}

export default new AttendanceService();
```

### 3. Emploi du temps (Sessions)

```typescript
// services/session.service.ts
import api from './api.service';
import { ENDPOINTS } from '../config/api.config';

export interface SessionResponse {
  id: string;
  subjectOfferingId: string;
  subjectId: string;
  subjectName: string;
  instructorId: string;
  instructorName: string | null;
  date: string;
  room: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export type WeeklySchedule = Record<string, SessionResponse[]>;

class SessionService {
  async getWeeklySchedule(classGroupId: string, date?: string): Promise<SessionResponse[]> {
    return api.get(ENDPOINTS.SESSIONS.WEEK_SCHEDULE(classGroupId), {
      params: { date }
    });
  }

  async getWeeklyScheduleGrouped(classGroupId: string, date?: string): Promise<WeeklySchedule> {
    return api.get(ENDPOINTS.SESSIONS.WEEK_GROUPED(classGroupId), {
      params: { date }
    });
  }

  async createSession(data: {
    subjectOfferingId: string;
    date: string;
    room: string;
    status?: string;
  }): Promise<SessionResponse> {
    return api.post(ENDPOINTS.SESSIONS.BASE, data);
  }
}

export default new SessionService();
```

### 4. Messagerie

```typescript
// services/messaging.service.ts
import api from './api.service';
import { ENDPOINTS } from '../config/api.config';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

class MessagingService {
  async getReceivedMessages(userId: string): Promise<Message[]> {
    return api.get(ENDPOINTS.MESSAGES.RECEIVED(userId));
  }

  async getUnreadMessages(userId: string): Promise<Message[]> {
    return api.get(ENDPOINTS.MESSAGES.UNREAD(userId));
  }

  async sendMessage(data: Partial<Message>): Promise<Message> {
    return api.post(ENDPOINTS.MESSAGES.BASE, data);
  }

  async markAsRead(messageId: string): Promise<Message> {
    return api.patch(`${ENDPOINTS.MESSAGES.BASE}/${messageId}/read`);
  }

  async deleteMessage(messageId: string): Promise<void> {
    return api.delete(`${ENDPOINTS.MESSAGES.BASE}/${messageId}`);
  }
}

export default new MessagingService();
```

### 5. Not ifications

```typescript
// services/notification.service.ts
import api from './api.service';
import { ENDPOINTS } from '../config/api.config';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

class NotificationService {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return api.get(ENDPOINTS.NOTIFICATIONS.USER(userId));
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return api.get(ENDPOINTS.NOTIFICATIONS.UNREAD(userId));
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return api.patch(`${ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}/read`);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return api.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL(userId));
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return api.delete(`${ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`);
  }
}

export default new NotificationService();
```

---

## Exemples de code

### React - Hook personnalisé pour l'authentification

```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import authService, { LoginCredentials } from '../services/auth.service';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser({ username: response.username, roles: response.roles });
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (role: string) => {
    return authService.hasRole(role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### React - Composant de connexion

```tsx
// components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### React - Affichage emploi du temps

```tsx
// components/WeeklySchedule.tsx
import React, { useEffect, useState } from 'react';
import sessionService, { WeeklySchedule } from '../services/session.service';

interface Props {
  classGroupId: string;
}

export const WeeklySchedule: React.FC<Props> = ({ classGroupId }) => {
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await sessionService.getWeeklyScheduleGrouped(classGroupId);
        setSchedule(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [classGroupId]);

  if (loading) return <div>Loading schedule...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="weekly-schedule">
      {Object.entries(schedule).map(([date, sessions]) => (
        <div key={date} className="day-schedule">
          <h3>{new Date(date).toLocaleDateString()}</h3>
          {sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="time">{new Date(session.date).toLocaleTimeString()}</div>
              <div className="subject">{session.subjectName}</div>
              <div className="instructor">{session.instructorName || 'TBA'}</div>
              <div className="room">{session.room}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

### Vue.js - Composition API

```vue
<!-- views/AttendanceView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import attendanceService, { type Attendance, type AttendanceStatistics } from '@/services/attendance.service';

const studentId = ref('student-id-here');
const attendances = ref<Attendance[]>([]);
const statistics = ref<AttendanceStatistics | null>(null);
const loading = ref(false);

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [attendanceData, statsData] = await Promise.all([
      attendanceService.getStudentAttendance(studentId.value),
      attendanceService.getStudentStatistics(studentId.value)
    ]);
    attendances.value = attendanceData;
    statistics.value = statsData;
  } catch (error) {
    console.error('Failed to fetch attendance data:', error);
  } finally {
    loading.value = false;
  }
};

const attendanceRate = computed(() => {
  return statistics.value?.attendanceRate.toFixed(2) || '0.00';
});
</script>

<template>
  <div class="attendance-view">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <h2>Attendance Statistics</h2>
      <div class="stats" v-if="statistics">
        <p>Attendance Rate: {{ attendanceRate }}%</p>
        <p>Present: {{ statistics.presentCount }}</p>
        <p>Absent: {{ statistics.absentCount }}</p>
        <p>Late: {{ statistics.lateCount }}</p>
      </div>
      
      <h2>Attendance Records</h2>
      <div v-for="attendance in attendances" :key="attendance.id" class="attendance-card">
        <span>{{ attendance.sessionDate }}</span>
        <span :class="attendance.status.toLowerCase()">{{ attendance.status }}</span>
      </div>
    </div>
  </div>
</template>
```

---

## Gestion d'erreurs

### Gestionnaire d'erreurs centralisé

```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Erreur de réponse du serveur
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 400:
        return new ApiError(400, 'Invalid request: ' + message);
      case 401:
        return new ApiError(401, 'Authentication required');
      case 403:
        return new ApiError(403, 'Access denied');
      case 404:
        return new ApiError(404, 'Resource not found');
      case 409:
        return new ApiError(409, 'Conflict: ' + message);
      case 500:
        return new ApiError(500, 'Server error');
      default:
        return new ApiError(status, message);
    }
  } else if (error.request) {
    // Pas de réponse du serveur
    return new ApiError(0, 'No response from server');
  } else {
    // Erreur de configuration
    return new ApiError(0, error.message);
  }
};

// Hook React pour afficher les erreurs
export const useErrorHandler = () => {
  const [error, setError] = React.useState<string | null>(null);

  const handleError = (err: any) => {
    const apiError = handleApiError(err);
    setError(apiError.message);
    
    // Auto-clear après 5 secondes
    setTimeout(() => setError(null), 5000);
  };

  return { error, handleError, clearError: () => setError(null) };
};
```

---

## Best Practices

### 1. Sécurité

```typescript
// ✅ TOUJOURS inclure le token JWT
// Géré automatiquement par l'intercepteur axios

// ✅ Valider le token côté frontend avant actions sensibles
const isTokenValid = await authService.validateToken(token);

// ✅ Vérifier les rôles avant d'afficher des composants
{hasRole('ADMIN') && <AdminPanel />}

// ✅ Logout automatique si 401
// Géré par l'intercepteur axios

// ❌ NE JAMAIS stocker de données sensibles en localStorage
// Uniquement le token JWT et infos non-sensibles
```

### 2. Performance

```typescript
// ✅ Cache les données fréquemment utilisées
const [cachedStudents, setCachedStudents] = useState<Student[]>([]);

useEffect(() => {
  const cached = sessionStorage.getItem('students');
  if (cached) {
    setCachedStudents(JSON.parse(cached));
  } else {
    fetchStudents().then((data) => {
      setCachedStudents(data);
      sessionStorage.setItem('students', JSON.stringify(data));
    });
  }
}, []);

// ✅ Debounce pour recherche
import { useDebounce } from 'use-debounce';

const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery] = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    studentService.searchStudents(debouncedQuery);
  }
}, [debouncedQuery]);

// ✅ Pagination
const [page, setPage] = useState(0);
const [pageSize] = useState(20);

const fetchPaginatedData = async () => {
  // Le backend doit supporter la pagination
  const data = await api.get('/api/students', {
    params: { page, size: pageSize }
  });
  return data;
};
```

### 3. Gestion d'état

```typescript
// ✅ Utiliser Context API pour état global
// Voir AuthProvider ci-dessus

// ✅ Ou Redux Toolkit
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async () => {
    return await studentService.getAllStudents();
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  }
});

// ✅ Ou React Query
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['students'],
  queryFn: () => studentService.getAllStudents(),
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

---

## Workflows utilisateur

### Workflow 1: Étudiant consulte emploi du temps

```typescript
// 1. Login
await authService.login({ username: 'student1', password: 'pass' });

// 2. Récupérer l'emploi du temps
const schedule = await sessionService.getWeeklyScheduleGrouped('class-id');

// 3. Afficher dans le calendrier
<WeeklySchedule classGroupId="class-id" />
```

### Workflow 2: Étudiant justifie une absence

```typescript
// 1. Consulter présences
const attendances = await attendanceService.getStudentAttendance(studentId);

// 2. Filtrer absences non justifiées
const unjustified = attendances.filter(a => 
  a.status === 'ABSENT' && !a.justification
);

// 3. Soumettre justification
await attendanceService.submitJustification(
  attendanceId, 
  'Medical certificate attached'
);

// 4. Notification envoyée automatiquement au manager
```

### Workflow 3: Manager valide absences

```typescript
// 1. Récupérer absences en attente
const pending = await attendanceService.getPendingAttendances(classGroupId);

// 2. Valider ou rejeter
await attendanceService.validateAttendance(attendanceId, {
  validatedBy: managerId,
  decision: 'VALIDATED', // ou 'REJECTED'
  managerComment: 'Certificate verified'
});

// 3. Si rejeté, étudiant peut faire appel
```

---

## 🔧 Configuration avancée

### Variables d'environnement

```.env
# .env (Development)
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.sms.com
REACT_APP_ENV=production
```

### Retry logic

```typescript
// utils/retryRequest.ts
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
};

// Usage
const data = await retryRequest(() => studentService.getAllStudents());
```

---

##📝 Checklist d'intégration

- [ ] Configurer API_CONFIG avec l'URL correcte
- [ ] Implémenter AuthService
- [ ] Configurer intercepteur Axios avec JWT
- [ ] Créer services par domaine (Student, Attendance, etc.)
- [ ] Implémenter gestion d'erreurs centralisée
- [ ] Créer Provider d'authentification (Context/Redux)
- [ ] Protéger les routes selon les rôles
- [ ] Implémenter logout automatique sur 401
- [ ] Ajouter loading states
- [ ] Implémenter cache strategically
- [ ] Tester tous les workflows utilisateur

---

**Date**: 25 janvier 2026  
**API Gateway**: http://localhost:8080  
**Services**: 11 microservices
