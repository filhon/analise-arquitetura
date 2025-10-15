// Ponto de entrada principal da aplicação

import { electionApp } from "@/app";
import { UIManager } from "@/ui/manager";
import { NotificationService } from "@/ui/notifications";
import { ErrorHandler } from "@/utils";

// Migração: Remover storage obsoleto de CANDIDATES
function migrateStorageV2() {
  try {
    const obsoleteKey = "ELECTION_APP_CANDIDATES";
    if (localStorage.getItem(obsoleteKey)) {
      console.log("[Migration] Removendo storage obsoleto:", obsoleteKey);
      localStorage.removeItem(obsoleteKey);
      console.log(
        "[Migration] ✓ Storage CANDIDATES removido - agora usa apenas MEMBERS",
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

    // Mostrar tela de loading
    const loadingScreen = document.getElementById("loading-screen");
    const appContainer = document.getElementById("app");

    if (!loadingScreen || !appContainer) {
      throw new Error("Elementos DOM essenciais não encontrados");
    }

    // Inicializar sistema de notificações
    NotificationService.getInstance();

    // Inicializar aplicação
    console.log("[Main] 1/4 - Inicializando sistema de eleição...");
    const initResult = await electionApp.initialize();
    console.log("[Main] ElectionApp inicializado:", initResult);

    if (!initResult.success) {
      throw new Error(initResult.error || "Erro desconhecido na inicialização");
    }

    // Inicializar interface do usuário
    console.log("[Main] 2/4 - Inicializando interface...");
    const uiManager = UIManager.getInstance();
    console.log("[Main] UIManager instanciado");

    console.log("[Main] 3/4 - Carregando dados iniciais da UI...");
    await uiManager.initialize();
    console.log("[Main] UIManager inicializado");

    // Esconder loading e mostrar aplicação
    console.log("[Main] 4/4 - Exibindo interface...");
    loadingScreen.style.display = "none";
    appContainer.style.display = "block";

    console.log("[Main] ✓ Sistema inicializado com sucesso!");

    // Mostrar notificação de sucesso
    NotificationService.show("Sistema inicializado com sucesso!", "success", {
      duration: 3000,
    });
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

// Tratamento de erros globais
window.addEventListener("error", (event) => {
  ErrorHandler.log(event.error, "window.error");
  NotificationService.show(
    "Ocorreu um erro inesperado. Verifique o console para mais detalhes.",
    "error",
  );
});

window.addEventListener("unhandledrejection", (event) => {
  ErrorHandler.log(new Error(event.reason), "window.unhandledrejection");
  NotificationService.show(
    "Erro em operação assíncrona. Verifique o console para mais detalhes.",
    "error",
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
