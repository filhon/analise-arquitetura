// Gerenciador de Autenticação com Firebase Authentication

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, isConfigured } from "@/config/firebase";
import {
  User,
  AuthState,
  LoginCredentials,
  AuthResult,
  UserRole,
} from "@/types/auth";

export class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: ((state: AuthState) => void)[] = [];
  private authStateUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.state = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    };

    this.initializeAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private initializeAuth(): void {
    if (!isConfigured || !auth) {
      console.warn("Firebase Auth não está configurado");
      return;
    }

    // Escutar mudanças no estado de autenticação
    this.authStateUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Usuário logado
        const user = this.firebaseUserToUser(firebaseUser);
        this.setState({
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null,
        });
      } else {
        // Usuário não logado
        this.setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
      }
    });
  }

  private firebaseUserToUser(firebaseUser: FirebaseUser): User {
    // Mapear roles baseado em custom claims ou email
    // Por enquanto, usa lógica simples baseada no email
    let role = UserRole.USER;
    const email = firebaseUser.email || "";

    if (email.includes("admin")) {
      role = UserRole.ADMIN;
    } else if (email.includes("moderador") || email.includes("mod")) {
      role = UserRole.MODERATOR;
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName:
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "Usuário",
      emailVerified: firebaseUser.emailVerified,
      role,
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime)
        : new Date(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : new Date(),
    };
  }

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  private setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    if (!isConfigured || !auth) {
      return {
        success: false,
        error: "Firebase Auth não está configurado",
      };
    }

    this.setState({ isLoading: true, error: null });

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = this.firebaseUserToUser(userCredential.user);

      this.setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Erro desconhecido no login";

      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage = "Usuário não encontrado";
          break;
        case "auth/wrong-password":
          errorMessage = "Email ou senha incorretos";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        case "auth/user-disabled":
          errorMessage = "Conta desabilitada";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas. Tente novamente mais tarde";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }

      this.setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  async logout(): Promise<void> {
    if (!isConfigured || !auth) {
      console.warn("Firebase Auth não está configurado");
      return;
    }

    try {
      await signOut(auth);
      this.setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, limpar estado local
      this.setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }

  // Método para criar novo usuário (útil para admins)
  async createUser(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResult> {
    if (!isConfigured || !auth) {
      return {
        success: false,
        error: "Firebase Auth não está configurado",
      };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Atualizar display name se fornecido
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      const user = this.firebaseUserToUser(userCredential.user);

      return { success: true, user };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Erro ao criar usuário";

      switch (authError.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este email já está em uso";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        case "auth/weak-password":
          errorMessage = "Senha muito fraca";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }

      return { success: false, error: errorMessage };
    }
  }

  // Método para reset de senha
  async resetPassword(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isConfigured || !auth) {
      return {
        success: false,
        error: "Firebase Auth não está configurado",
      };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Erro ao enviar email de reset";

      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage = "Usuário não encontrado";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }

      return { success: false, error: errorMessage };
    }
  }

  // Método para verificar se usuário tem permissão
  hasRole(role: UserRole): boolean {
    return this.state.user?.role === role;
  }

  // Método para verificar se usuário tem pelo menos uma das roles
  hasAnyRole(roles: UserRole[]): boolean {
    return this.state.user ? roles.includes(this.state.user.role!) : false;
  }

  // Método para verificar se usuário tem permissão de admin ou superior
  isAdmin(): boolean {
    return this.hasAnyRole([UserRole.ADMIN]);
  }

  // Método para verificar se usuário tem permissão de moderador ou superior
  isModerator(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.MODERATOR]);
  }

  // Método para obter usuário atual
  getCurrentUser(): User | null {
    return this.state.user;
  }

  // Método para verificar se Firebase Auth está configurado
  isFirebaseConfigured(): boolean {
    return isConfigured && !!auth;
  }

  // Cleanup
  destroy(): void {
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
      this.authStateUnsubscribe = null;
    }
    this.listeners = [];
  }
}
