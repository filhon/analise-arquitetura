// Gerenciador de Autenticação com Firebase Authentication e Cloud Functions

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
  AuthError,
} from "firebase/auth";
import { auth, isConfigured } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
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

    console.log("🔄 Inicializando listener de autenticação...");

    // Escutar mudanças no estado de autenticação
    this.authStateUnsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log(
          "📡 onAuthStateChanged chamado:",
          firebaseUser ? "usuário logado" : "usuário não logado"
        );

        if (firebaseUser) {
          // Usuário logado
          console.log("👤 Usuário Firebase detectado:", firebaseUser.email);
          const user = await this.firebaseUserToUser(firebaseUser);
          console.log("🔄 Atualizando estado para autenticado:", user.email);

          this.setState({
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null,
          });

          console.log("✅ Estado atualizado - usuário autenticado");
        } else {
          // Usuário não logado
          console.log("🚪 Nenhum usuário logado detectado");
          this.setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });

          console.log("✅ Estado atualizado - usuário não autenticado");
        }
      }
    );
  }

  private async firebaseUserToUser(firebaseUser: FirebaseUser): Promise<User> {
    // Aguardar obtenção dos custom claims
    let role = UserRole.USER;
    const email = firebaseUser.email || "";

    // Lista de emails admin (fallback se não houver custom claims)
    const adminEmails = [
      "admin@igreja.com",
      "fcbfilipesantos@gmail.com", // Adicionado email do usuário
    ];

    try {
      const idTokenResult = await firebaseUser.getIdTokenResult();
      console.log("🔑 Custom Claims obtidos:", idTokenResult.claims);

      if (idTokenResult.claims.role) {
        role = idTokenResult.claims.role as UserRole;
        console.log("👑 Role definida por Custom Claims:", role);
      } else if (idTokenResult.claims.admin === true) {
        role = UserRole.ADMIN;
        console.log("👑 Role definida por claim 'admin':", role);
      } else {
        // Fallback para lista de emails admin
        if (adminEmails.includes(email)) {
          role = UserRole.ADMIN;
          console.log("👑 Role definida por lista de emails admin:", role);
        } else {
          console.log(
            "👤 Role padrão (USER) - nenhum critério admin encontrado"
          );
        }
      }
    } catch (error) {
      console.warn("⚠️ Erro ao obter custom claims, usando fallback:", error);

      // Fallback para lista de emails admin
      if (adminEmails.includes(email)) {
        role = UserRole.ADMIN;
        console.log(
          "👑 Role definida por lista de emails admin (fallback):",
          role
        );
      } else {
        console.log("👤 Role padrão (USER) - fallback sem critério admin");
      }
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
    console.log("🔐 Tentando login com:", credentials.email);

    if (!isConfigured || !auth) {
      console.error("❌ Firebase Auth não está configurado");
      return {
        success: false,
        error: "Firebase Auth não está configurado",
      };
    }

    console.log("✅ Firebase Auth configurado, iniciando login...");
    this.setState({ isLoading: true, error: null });

    try {
      console.log("📡 Fazendo chamada para signInWithEmailAndPassword...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      console.log(
        "✅ Login bem-sucedido no Firebase:",
        userCredential.user.email
      );
      const user = await this.firebaseUserToUser(userCredential.user);

      console.log("👤 Usuário mapeado:", {
        email: user.email,
        role: user.role,
      });

      // O estado será atualizado automaticamente pelo onAuthStateChanged
      // Mas vamos garantir que esteja consistente
      this.setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });

      console.log("🎉 Login completo - aguardando redirecionamento automático");
      return { success: true, user };
    } catch (error) {
      const authError = error as AuthError;
      console.error("❌ Erro no login:", authError.code, authError.message);

      let errorMessage = "Erro desconhecido no login";

      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage =
            "Este email não está cadastrado no sistema. Verifique se digitou corretamente ou entre em contato com o administrador.";
          break;
        case "auth/wrong-password":
          errorMessage =
            "A senha está incorreta. Tente novamente ou clique em 'Esqueci minha senha'.";
          break;
        case "auth/invalid-email":
          errorMessage =
            "O formato do email é inválido. Digite um email válido.";
          break;
        case "auth/user-disabled":
          errorMessage =
            "Esta conta foi desabilitada. Entre em contato com o administrador do sistema.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
          break;
        case "auth/project-not-found":
          errorMessage =
            "Configuração do sistema inválida. Entre em contato com o administrador.";
          break;
        case "auth/invalid-api-key":
          errorMessage =
            "Configuração do sistema inválida. Entre em contato com o administrador.";
          break;
        default:
          errorMessage =
            "Erro inesperado no login. Tente novamente em alguns instantes.";
      }

      console.error("📝 Mensagem de erro final:", errorMessage);
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

  // Método para criar novo usuário (usando Cloud Functions)
  async createUser(
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
    displayName?: string
  ): Promise<AuthResult> {
    if (!isConfigured || !functions) {
      return {
        success: false,
        error: "Firebase Functions não está configurado",
      };
    }

    try {
      const createUserFunction = httpsCallable(functions, "createUser");
      const result = await createUserFunction({
        email,
        password,
        role,
        displayName,
      });

      const data = result.data as any;
      if (data.success) {
        return {
          success: true,
          user: {
            uid: data.uid,
            email,
            displayName: displayName || email.split("@")[0],
            emailVerified: false,
            role,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          },
        };
      } else {
        return {
          success: false,
          error: data.message || "Erro ao criar usuário",
        };
      }
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      return {
        success: false,
        error: error.message || "Erro ao criar usuário",
      };
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
    return this.hasAnyRole([UserRole.ADMIN]);
  }

  // Método para obter usuário atual
  getCurrentUser(): User | null {
    return this.state.user;
  }

  // Método para obter todos os usuários (usando Cloud Functions)
  async getUsers(): Promise<User[]> {
    if (!isConfigured || !functions) {
      console.warn("Firebase Functions não está configurado");
      return [];
    }

    try {
      const getUsersFunction = httpsCallable(functions, "getUsers");
      const result = await getUsersFunction();

      const data = result.data as any;
      if (data.success && data.users) {
        return data.users.map((userData: any) => ({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          emailVerified: userData.emailVerified || false,
          role: userData.role as UserRole,
          createdAt: new Date(userData.createdAt),
          lastLoginAt: userData.lastLoginAt
            ? new Date(userData.lastLoginAt)
            : new Date(),
        }));
      } else {
        console.error("Erro ao obter usuários:", data.message);
        return [];
      }
    } catch (error: any) {
      console.error("Erro ao obter usuários:", error);
      return [];
    }
  }

  // Método para excluir usuário (usando Cloud Functions)
  async deleteUser(uid: string): Promise<{ success: boolean; error?: string }> {
    if (!isConfigured || !functions) {
      return {
        success: false,
        error: "Firebase Functions não está configurado",
      };
    }

    try {
      const deleteUserFunction = httpsCallable(functions, "deleteUser");
      const result = await deleteUserFunction({ uid });

      const data = result.data as any;
      if (data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || "Erro ao excluir usuário",
        };
      }
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      return {
        success: false,
        error: error.message || "Erro ao excluir usuário",
      };
    }
  }

  // Método para atualizar função do usuário (usando Cloud Functions)
  async updateUserRole(
    uid: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> {
    if (!isConfigured || !functions) {
      return {
        success: false,
        error: "Firebase Functions não está configurado",
      };
    }

    try {
      const updateUserRoleFunction = httpsCallable(functions, "updateUserRole");
      const result = await updateUserRoleFunction({ uid, role });

      const data = result.data as any;
      if (data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || "Erro ao atualizar função do usuário",
        };
      }
    } catch (error: any) {
      console.error("Erro ao atualizar função do usuário:", error);
      return {
        success: false,
        error: error.message || "Erro ao atualizar função do usuário",
      };
    }
  }

  async updateUserDisplayName(
    uid: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isConfigured || !functions) {
      return {
        success: false,
        error: "Firebase Functions não está configurado",
      };
    }

    try {
      const updateUserDisplayNameFunction = httpsCallable(
        functions,
        "updateUserDisplayName"
      );
      const result = await updateUserDisplayNameFunction({ uid, displayName });

      const data = result.data as any;
      if (data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || "Erro ao atualizar nome do usuário",
        };
      }
    } catch (error: any) {
      console.error("Erro ao atualizar nome do usuário:", error);
      return {
        success: false,
        error: error.message || "Erro ao atualizar nome do usuário",
      };
    }
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
