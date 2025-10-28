// Tipos para autenticação

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  role?: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}
