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
    // Executar migração de storage ANTES de qualquer inicialização
    migrateStorageV2();

    // Inicializar sistema de notificações
    NotificationService.getInstance();

    // Aguardar inicialização completa do Firebase Auth
    const authManager = AuthManager.getInstance();
    await waitForAuthState(authManager);

    const currentUser = authManager.getCurrentUser();

    if (!currentUser) {
      // Usuário não autenticado - mostrar tela de login
      showLoginScreen();
      return;
    }

    // Usuário autenticado - inicializar aplicação normalmente
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

// Função para aguardar o estado de autenticação ser determinado
function waitForAuthState(authManager: AuthManager): Promise<void> {
  const state = authManager.getState();

  // Se já temos um estado determinado (autenticado ou não), resolver imediatamente
  if (!state.isLoading) {
    return Promise.resolve();
  }

  // Aguardar mudança de estado com timeout
  return Promise.race([
    new Promise<void>((resolve) => {
      const unsubscribe = authManager.subscribe((newState) => {
        if (!newState.isLoading) {
          unsubscribe();
          resolve();
        }
      });
    }),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn("Timeout aguardando estado de autenticação");
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
  loginScreen.style.display = "flex";

  // Inicializar UI de login
  const loginUI = new LoginUI();
  loginUI.showLoginScreen();

  // Escutar evento de login bem-sucedido
  const authManager = AuthManager.getInstance();
  const unsubscribe = authManager.subscribe((state) => {
    if (state.isAuthenticated) {
      // Login bem-sucedido - esconder tela de login e inicializar aplicação
      loginScreen.style.display = "none";
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
