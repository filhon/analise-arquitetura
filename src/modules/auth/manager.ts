// Gerenciador de Autenticação com Firebase Authentication e Cloud Functions

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
  AuthError,
} from "firebase/auth";
import { auth, isConfigured, firestore } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { doc, getDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
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
  private firestoreUnsubscribe: Unsubscribe | null = null;

  private constructor() {
    this.state = {
      isAuthenticated: false,
      user: null,
      isLoading: true, // ✅ CORREÇÃO: Iniciar como true até Firebase determinar estado
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
      this.setState({ isLoading: false }); // ✅ Parar loading se Firebase não configurado
      return;
    }

    console.log("[AuthManager] 🔐 Inicializando autenticação Firebase...");

    // Escutar mudanças no estado de autenticação
    this.authStateUnsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log("[AuthManager] 📡 onAuthStateChanged chamado:", {
          loggedIn: !!firebaseUser,
          email: firebaseUser?.email,
        });

        if (firebaseUser) {
          // Usuário logado
          const user = await this.firebaseUserToUser(firebaseUser);
          console.log("[AuthManager] ✅ Usuário autenticado:", user.email);

          this.setState({
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null,
          });

          // Escutar mudanças no Firestore para este usuário
          this.listenToFirestoreChanges(firebaseUser.uid);
        } else {
          // Usuário não logado
          console.log("[AuthManager] ❌ Nenhum usuário autenticado");

          // Parar de escutar mudanças no Firestore
          if (this.firestoreUnsubscribe) {
            this.firestoreUnsubscribe();
            this.firestoreUnsubscribe = null;
          }

          this.setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );
  }

  /**
   * Escuta mudanças em tempo real no documento Firestore do usuário
   * e atualiza o estado quando houver alterações
   */
  private listenToFirestoreChanges(uid: string): void {
    // Parar listener anterior se existir
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
    }

    if (!firestore) {
      console.warn("Firestore não está configurado");
      return;
    }

    try {
      const userDocRef = doc(firestore, "users", uid);

      this.firestoreUnsubscribe = onSnapshot(
        userDocRef,
        async (docSnap) => {
          if (docSnap.exists() && this.state.user) {
            const firestoreData = docSnap.data();

            // Atualizar apenas se houver mudanças relevantes
            let needsUpdate = false;
            const updatedUser = { ...this.state.user };

            if (
              firestoreData.displayName &&
              firestoreData.displayName !== this.state.user.displayName
            ) {
              updatedUser.displayName = firestoreData.displayName;
              needsUpdate = true;
            }

            if (
              firestoreData.role &&
              firestoreData.role !== this.state.user.role
            ) {
              updatedUser.role = firestoreData.role as UserRole;
              needsUpdate = true;
            }

            if (needsUpdate) {
              console.log("📡 Dados do usuário atualizados do Firestore");
              this.setState({
                user: updatedUser,
              });
            }
          }
        },
        (error) => {
          console.error("Erro ao escutar mudanças do Firestore:", error);
        }
      );
    } catch (error) {
      console.error("Erro ao configurar listener do Firestore:", error);
    }
  }

  private async firebaseUserToUser(firebaseUser: FirebaseUser): Promise<User> {
    // Obter role dos custom claims do Firebase
    let role = UserRole.USER;
    let displayName =
      firebaseUser.displayName ||
      firebaseUser.email?.split("@")[0] ||
      "Usuário";

    try {
      const idTokenResult = await firebaseUser.getIdTokenResult();

      // Verificar custom claim 'role' (padrão)
      if (idTokenResult.claims.role) {
        role = idTokenResult.claims.role as UserRole;
      }
      // Verificar custom claim 'admin' (compatibilidade)
      else if (idTokenResult.claims.admin === true) {
        role = UserRole.ADMIN;
      }
      // Caso contrário, usar role padrão (USER)
    } catch (error) {
      console.error("Erro ao obter custom claims:", error);
      // Em caso de erro, usar role padrão (USER)
    }

    // Buscar dados adicionais do Firestore
    if (firestore) {
      try {
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data();

          // Priorizar displayName do Firestore se disponível
          if (firestoreData.displayName) {
            displayName = firestoreData.displayName;
          }

          // Atualizar role do Firestore se disponível
          if (firestoreData.role) {
            role = firestoreData.role as UserRole;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
        // Continuar com dados do Auth se falhar
      }
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName,
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

  private validateFirebaseConfig(): boolean {
    return isConfigured && !!auth;
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    if (!this.validateFirebaseConfig()) {
      console.error("Firebase Auth não está configurado");
      return {
        success: false,
        error: "Firebase Auth não está configurado",
      };
    }

    this.setState({ isLoading: true, error: null });

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth!,
        credentials.email,
        credentials.password
      );

      const user = await this.firebaseUserToUser(userCredential.user);

      // O estado será atualizado automaticamente pelo onAuthStateChanged
      // Mas vamos garantir que esteja consistente
      this.setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Erro no login:", authError.code);

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
    if (!this.validateFirebaseConfig()) {
      console.warn("Firebase Auth não está configurado");
      return;
    }

    try {
      await signOut(auth!);
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
    if (!this.validateFirebaseConfig() || !functions) {
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
    if (!this.validateFirebaseConfig()) {
      return {
        success: false,
        error: "Firebase Auth não está configurado",
      };
    }

    try {
      await sendPasswordResetEmail(auth!, email);
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
    if (!this.validateFirebaseConfig() || !functions) {
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
    if (!this.validateFirebaseConfig() || !functions) {
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
    if (!this.validateFirebaseConfig() || !functions) {
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
    if (!this.validateFirebaseConfig() || !functions) {
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
    return this.validateFirebaseConfig();
  }

  // Cleanup
  destroy(): void {
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
      this.authStateUnsubscribe = null;
    }
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
    this.listeners = [];
  }
}
