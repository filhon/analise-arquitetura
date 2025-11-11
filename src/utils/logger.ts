/**
 * Sistema de logging condicional para produção
 * Logs são desabilitados automaticamente em produção
 */

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEV = import.meta.env.DEV;

export class Logger {
  /**
   * Log informativo - desabilitado em produção
   */
  static log(...args: any[]): void {
    if (IS_DEV) {
      console.log(...args);
    }
  }

  /**
   * Log de aviso - sempre ativo (importante para debug)
   */
  static warn(...args: any[]): void {
    console.warn(...args);
  }

  /**
   * Log de erro - sempre ativo (crítico)
   */
  static error(...args: any[]): void {
    console.error(...args);
  }

  /**
   * Log de debug - apenas em desenvolvimento
   */
  static debug(...args: any[]): void {
    if (IS_DEV) {
      console.debug(...args);
    }
  }

  /**
   * Verificar se está em produção
   */
  static isProd(): boolean {
    return IS_PRODUCTION;
  }

  /**
   * Verificar se está em desenvolvimento
   */
  static isDev(): boolean {
    return IS_DEV;
  }
}
