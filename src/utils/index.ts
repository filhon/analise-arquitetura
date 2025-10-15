// Utilitários base do sistema

import type { ValidationResult, CacheEntry } from "@/types";

/**
 * Sistema de cache inteligente com TTL
 */
export class SmartCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) {
    // 5 minutos padrão
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl: ttl ?? this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp.getTime();

    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp.getTime();
      if (age > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Debouncing para performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: number;

  return (...args: Parameters<T>) => {
    // Uso de globalThis para funcionar em Node (tests) e navegador
    globalThis.clearTimeout(timeout as any);
    timeout = globalThis.setTimeout(() => func(...args), wait) as any;
  };
}

/**
 * Throttling para limitar execuções
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastFunc: number;
  let lastRan: number;

  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      globalThis.clearTimeout(lastFunc as any);
      lastFunc = globalThis.setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan),
      ) as any;
    }
  };
}

/**
 * Validador robusto
 */
export class Validator {
  static required(value: any): ValidationResult {
    const isValid = value !== null && value !== undefined && value !== "";
    return {
      isValid,
      errors: isValid ? [] : ["Campo obrigatório"],
    };
  }

  static email(value: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      errors: isValid ? [] : ["Email inválido"],
    };
  }

  static cpf(value: string): ValidationResult {
    // Remove caracteres não numéricos
    const cleanCpf = value.replace(/\D/g, "");

    if (cleanCpf.length !== 11) {
      return { isValid: false, errors: ["CPF deve ter 11 dígitos"] };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return { isValid: false, errors: ["CPF inválido"] };
    }

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }

    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) {
      return { isValid: false, errors: ["CPF inválido"] };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }

    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) {
      return { isValid: false, errors: ["CPF inválido"] };
    }

    return { isValid: true, errors: [] };
  }

  static combine(...results: ValidationResult[]): ValidationResult {
    const errors = results.flatMap((r) => r.errors);
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static isValidCPF(value?: string): boolean {
    if (!value) return true; // CPF é opcional
    return this.cpf(value).isValid;
  }

  static isValidEmail(value?: string): boolean {
    if (!value) return true; // Email é opcional
    return this.email(value).isValid;
  }
}

/**
 * Formatadores
 */
export class Formatter {
  static cpf(value: string): string {
    const clean = value.replace(/\D/g, "");
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  static rg(value: string): string {
    const clean = value.replace(/\D/g, "");
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
  }

  static phone(value: string): string {
    const clean = value.replace(/\D/g, "");
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  static date(date: Date): string {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
}

/**
 * Gerador de IDs únicos
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Utilities para arrays
 */
export class ArrayUtils {
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static groupBy<T, K extends keyof T>(
    array: T[],
    key: K,
  ): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      },
      {} as Record<string, T[]>,
    );
  }
}

/**
 * Error handling robusto
 */
export class ErrorHandler {
  private static errors: Array<{
    error: Error;
    timestamp: Date;
    context?: string;
  }> = [];

  static log(error: Error | string, context?: string): void {
    const err = typeof error === "string" ? new Error(error) : error;

    this.errors.push({
      error: err,
      timestamp: new Date(),
      context,
    });

    console.error(`[${context || "System"}]`, err);

    // Manter apenas os últimos 100 erros
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
  }

  static getErrors(): Array<{
    error: Error;
    timestamp: Date;
    context?: string;
  }> {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
  }
}

// Exportar módulos adicionais
export { EventSystem } from "./events";
export { RealtimeSync } from "./realtime-sync";

/**
 * Parse JSON seguro com fallback.
 * Retorna null em caso de erro ou se o valor for null/undefined/"undefined"/"null".
 */
export function safeParseJSON<T = any>(value: string | null): T | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (trimmed === "" || trimmed === "undefined" || trimmed === "null")
    return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch (e) {
    ErrorHandler.log(e as Error, "safeParseJSON");
    return null;
  }
}
