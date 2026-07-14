export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole | string;
  userId?: string;
  id?: number | string;
  mustChangePassword?: boolean;
}

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  userId: string | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
  clearMustChangePassword: () => void;
} 