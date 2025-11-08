// Ponto de entrada principal da aplicação

import { electionApp } from "@/app";
import { UIManager } from "@/ui/manager";
import { NotificationService } from "@/ui/notifications";
import { ErrorHandler } from "@/utils";
import { AuthManager } from "@/modules/auth/manager";
import { LoginUI } from "@/modules/auth/ui";

// Migração: Remover storage obsoleto de CANDIDATES
function migrateStorageV2() {
  try {
    const obsoleteKey = "ELECTION_APP_CANDIDATES";
    if (localStorage.getItem(obsoleteKey)) {
      console.log("[Migration] Removendo storage obsoleto:", obsoleteKey);
      localStorage.removeItem(obsoleteKey);
      console.log(
        "[Migration] ✓ Storage CANDIDATES removido - agora usa apenas MEMBERS"
      );
    }
  } catch (error) {
    console.warn("[Migration] Erro ao remover storage obsoleto:", error);
  }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("[Main] 🚀 Inicializando aplicação...");

    // Executar migração de storage ANTES de qualquer inicialização
    migrateStorageV2();

    // Inicializar sistema de notificações
    NotificationService.getInstance();

    // Atualizar mensagem de loading
    updateLoadingMessage("Verificando autenticação...");

    // Inicializar AuthManager e aguardar estado de autenticação
    const authManager = AuthManager.getInstance();

    // Aguardar determinação do estado de autenticação
    console.log(
      "[Main] ⏳ Aguardando determinação do estado de autenticação..."
    );
    await waitForAuthState(authManager);

    const currentUser = authManager.getCurrentUser();
    console.log("[Main] 📋 Estado de autenticação determinado:", {
      hasUser: !!currentUser,
      email: currentUser?.email,
    });

    if (!currentUser) {
      // Usuário não autenticado - mostrar tela de login
      console.log("[Main] 🔐 Exibindo tela de login...");
      showLoginScreen();
      return;
    }

    // Usuário autenticado - inicializar aplicação diretamente
    // (loading-screen já está visível, não há "piscada" da tela de login)
    console.log("[Main] ✅ Usuário autenticado, carregando aplicação...");
    updateLoadingMessage("Carregando aplicação...");
    await initializeApplication();
  } catch (error) {
    console.error("Erro fatal na inicialização:", error);
    ErrorHandler.log(error as Error, "main.ts.initialize");

    // Mostrar erro na tela
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="error-container">
          <h2>Erro na Inicialização</h2>
          <p>${(error as Error).message}</p>
          <button onclick="location.reload()" class="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      `;
    }
  }
});

// Função para atualizar a mensagem da tela de loading
function updateLoadingMessage(message: string): void {
  const loadingText = document.querySelector(".loading-text");
  if (loadingText) {
    loadingText.textContent = message;
  }
}

// Função para aguardar o estado de autenticação ser determinado
function waitForAuthState(authManager: AuthManager): Promise<void> {
  const state = authManager.getState();

  console.log("[waitForAuthState] Estado inicial:", {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    hasUser: !!state.user,
  });

  // Se já temos um estado determinado (autenticado ou não), resolver imediatamente
  if (!state.isLoading) {
    console.log(
      "[waitForAuthState] ✅ Estado já determinado, resolvendo imediatamente"
    );
    return Promise.resolve();
  }

  console.log("[waitForAuthState] ⏳ Aguardando mudança de estado...");

  // Aguardar mudança de estado com timeout
  return Promise.race([
    new Promise<void>((resolve) => {
      const unsubscribe = authManager.subscribe((newState) => {
        console.log("[waitForAuthState] 📡 Novo estado recebido:", {
          isLoading: newState.isLoading,
          isAuthenticated: newState.isAuthenticated,
          hasUser: !!newState.user,
        });

        if (!newState.isLoading) {
          console.log("[waitForAuthState] ✅ Estado determinado via listener");
          unsubscribe();
          resolve();
        }
      });
    }),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn(
          "[waitForAuthState] ⚠️ Timeout aguardando estado de autenticação"
        );
        resolve();
      }, 10000);
    }),
  ]);
}

// Função para mostrar tela de login
async function showLoginScreen(): Promise<void> {
  const loadingScreen = document.getElementById("loading-screen");
  const appContainer = document.getElementById("app");
  const loginScreen = document.getElementById("login-screen");

  if (!loadingScreen || !appContainer || !loginScreen) {
    throw new Error("Elementos DOM essenciais não encontrados");
  }

  // Esconder loading e mostrar tela de login
  loadingScreen.style.display = "none";
  appContainer.style.display = "none";
  loginScreen.classList.add("active"); // Usar classe ao invés de style inline

  // Inicializar UI de login
  const loginUI = new LoginUI();
  loginUI.showLoginScreen();

  // Escutar evento de login bem-sucedido
  const authManager = AuthManager.getInstance();
  const unsubscribe = authManager.subscribe((state) => {
    if (state.isAuthenticated) {
      // Login bem-sucedido - esconder tela de login e inicializar aplicação
      loginScreen.classList.remove("active"); // Remover classe ao invés de style inline
      unsubscribe(); // Remover listener
      initializeApplication();
    }
  });
}

// Função para inicializar aplicação principal
async function initializeApplication(): Promise<void> {
  try {
    // Mostrar tela de loading
    const loadingScreen = document.getElementById("loading-screen");
    const appContainer = document.getElementById("app");

    if (!loadingScreen || !appContainer) {
      throw new Error("Elementos DOM essenciais não encontrados");
    }

    // Inicializar aplicação
    const initResult = await electionApp.initialize();

    if (!initResult.success) {
      throw new Error(initResult.error || "Erro desconhecido na inicialização");
    }

    // Inicializar interface do usuário
    const uiManager = UIManager.getInstance();
    await uiManager.initialize();

    // Esconder loading e mostrar aplicação
    loadingScreen.style.display = "none";
    appContainer.style.display = "block";

    // Mostrar notificação de sucesso
    NotificationService.show("Sistema inicializado com sucesso!", "success", {
      duration: 3000,
    });
  } catch (error) {
    console.error("Erro fatal na inicialização:", error);
    ErrorHandler.log(error as Error, "main.ts.initializeApplication");

    // Mostrar erro na tela
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="error-container">
          <h2>Erro na Inicialização</h2>
          <p>${(error as Error).message}</p>
          <button onclick="location.reload()" class="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      `;
    }
  }
}
window.addEventListener("error", (event) => {
  ErrorHandler.log(event.error, "window.error");
  NotificationService.show(
    "Ocorreu um erro inesperado. Verifique o console para mais detalhes.",
    "error"
  );
});

window.addEventListener("unhandledrejection", (event) => {
  ErrorHandler.log(new Error(event.reason), "window.unhandledrejection");
  NotificationService.show(
    "Erro em operação assíncrona. Verifique o console para mais detalhes.",
    "error"
  );
});

// Service Worker para PWA (apenas em produção)
// ✅ CORREÇÃO: Desabilitar em desenvolvimento para evitar erro MIME type
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registrado:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Falha ao registrar Service Worker:", error);
      });
  });
}

// Exportar para desenvolvimento/debug
try {
  (window as any).electionApp = electionApp;
  (window as any).ErrorHandler = ErrorHandler;
} catch (e) {
  // Silently ignore in production
}
