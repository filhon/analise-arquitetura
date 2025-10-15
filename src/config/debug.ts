/**
 * Configurações de Debug do Sistema
 *
 * Para ativar logs detalhados durante desenvolvimento, defina DEBUG = true
 * Para produção, sempre mantenha DEBUG = false
 */

// Flag global de debug
export const DEBUG = false;

// Categorias específicas de debug (podem ser ativadas individualmente)
export const DEBUG_CONFIG = {
  // Logs de importação CSV
  CSV_IMPORT: DEBUG && false,

  // Logs de sincronização Firebase
  FIREBASE_SYNC: DEBUG && false,

  // Logs de eventos do sistema
  EVENTS: DEBUG && false,

  // Logs de validação de dados
  VALIDATION: DEBUG && false,

  // Logs de UI/UX
  UI: DEBUG && false,

  // Logs de cache
  CACHE: DEBUG && false,
};

/**
 * Logger condicional - só loga se DEBUG estiver ativo
 */
export const DebugLogger = {
  log: (category: keyof typeof DEBUG_CONFIG | "GENERAL", ...args: any[]) => {
    if (!DEBUG) return;

    if (category === "GENERAL" || DEBUG_CONFIG[category]) {
      console.log(...args);
    }
  },

  warn: (category: keyof typeof DEBUG_CONFIG | "GENERAL", ...args: any[]) => {
    if (!DEBUG) return;

    if (category === "GENERAL" || DEBUG_CONFIG[category]) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Erros sempre devem ser logados, mesmo em produção
    console.error(...args);
  },

  trace: (category: keyof typeof DEBUG_CONFIG | "GENERAL", ...args: any[]) => {
    if (!DEBUG) return;

    if (category === "GENERAL" || DEBUG_CONFIG[category]) {
      console.trace(...args);
    }
  },
};
