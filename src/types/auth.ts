export enum UserRole {
  ETUDIANT = 'ETUDIANT',
  PROFESSEUR = 'PROFESSEUR', // Make sure this matches "PROFESSEUR" exactly
  MANAGER = 'MANAGER',
  ADMINISTRATEUR = 'ADMINISTRATEUR'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  id: number;
}

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  userId: number | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
} 