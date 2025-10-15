/**
 * Sistema de Sincronização em Tempo Real com Firebase
 *
 * Sincroniza dados entre múltiplos dispositivos automaticamente:
 * - Membros
 * - Presença (Attendance)
 * - Votos
 * - Configuração de Quórum
 */

import { database, isConfigured } from "@/config/firebase";
import { ref, set, onValue, get } from "firebase/database";
import { EventSystem } from "./events";
import { EventTypes } from "@/types";
import type { Member, QuorumConfig, ConfigData } from "@/types";

export class RealtimeSync {
  private static instance: RealtimeSync;
  private eventSystem = EventSystem.getInstance();
  private sessionId: string;
  private isEnabled: boolean = false;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  constructor() {
    // ID único da sessão para evitar loops de atualização
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!isConfigured) {
      console.warn(
        "[RealtimeSync] Firebase não configurado - sincronização desabilitada"
      );
    }
  }

  /**
   * Ativar sincronização em tempo real
   */
  enable(): void {
    if (!isConfigured || !database) {
      console.warn(
        "[RealtimeSync] Não é possível ativar - Firebase não configurado"
      );
      return;
    }

    if (this.isEnabled) {
      console.log("[RealtimeSync] Já está ativado");
      return;
    }

    this.isEnabled = true;
    this.setupListeners();
    console.log(`[RealtimeSync] ✅ Ativado (Session: ${this.sessionId})`);
  }

  /**
   * Desativar sincronização (modo offline)
   */
  disable(): void {
    this.isEnabled = false;
    this.removeAllListeners();
    console.log("[RealtimeSync] ⏸️ Desativado");
  }

  /**
   * Verificar se está ativo
   */
  isActive(): boolean {
    return this.isEnabled && isConfigured;
  }

  /**
   * Sincronizar membros (ÚNICA fonte da verdade)
   * Contém: dados pessoais, candidatura, presença, votação
   */
  async syncMembers(members: Member[]): Promise<void> {
    console.log("[RealtimeSync] 🔄 syncMembers chamado...");

    if (!this.isActive()) {
      console.warn(
        "[RealtimeSync] ⚠️ Firebase está INATIVO! Sincronização ignorada."
      );
      return;
    }

    if (!database) {
      console.warn(
        "[RealtimeSync] ⚠️ Firebase database NÃO INICIALIZADO! Sincronização ignorada."
      );
      return;
    }

    try {
      console.log(
        `[RealtimeSync] 📤 Sincronizando ${members.length} membros para Firebase...`
      );
      const membersRef = ref(database, "members");
      await set(membersRef, {
        data: members,
        updatedBy: this.sessionId,
        timestamp: Date.now(),
      });
      console.log(
        `[RealtimeSync] ✅ ${members.length} membros sincronizados com sucesso!`
      );
    } catch (error) {
      console.error("[RealtimeSync] ❌ ERRO ao sincronizar membros:", error);
    }
  }

  /**
   * FASE 5.2: Sincronizar configuração completa (quórum + system)
   * Aceita QuorumConfig (retrocompatível) ou ConfigData completo
   * PADRÃO: Igual ao members - { data, updatedBy, timestamp }
   */
  async syncConfig(
    config: QuorumConfig | { quorum: QuorumConfig; system?: any }
  ): Promise<void> {
    if (!this.isActive() || !database) return;

    try {
      const configRef = ref(database, "config");

      // Detectar se é QuorumConfig ou ConfigData
      const configData = "quorum" in config ? config : { quorum: config };

      // ✅ PADRÃO MEMBERS: Wrapper 'data' para consistência
      await set(configRef, {
        data: configData,
        updatedBy: this.sessionId,
        timestamp: Date.now(),
      });
      console.log("[RealtimeSync] ✓ Configuração sincronizada");
    } catch (error) {
      console.error(
        "[RealtimeSync] ✗ Erro ao sincronizar configuração:",
        error
      );
    }
  }

  /**
   * Carregar estado inicial do Firebase
   * PADRÃO: Ambos usam { data, updatedBy, timestamp }
   *
   * ✅ ESTRUTURA FIREBASE:
   * - members/data -> Member[]
   * - config/data -> ConfigData {quorum: QuorumConfig, system: SystemConfig}
   */
  async loadInitialState(): Promise<{
    members: Member[] | null;
    config: ConfigData | null;
  }> {
    if (!this.isActive() || !database) {
      console.log("[RealtimeSync] ⚠️ Firebase inativo ou não configurado");
      return { members: null, config: null };
    }

    try {
      // ✅ CORREÇÃO: Ler diretamente de 'members/data' e 'config/data'
      const [membersSnap, configSnap] = await Promise.all([
        get(ref(database, "members/data")),
        get(ref(database, "config/data")),
      ]);

      // 🐛 DEBUG: Log do que foi lido
      console.log("[RealtimeSync] 🐛 DEBUG loadInitialState:", {
        membersExists: membersSnap.exists(),
        configExists: configSnap.exists(),
        membersVal: membersSnap.exists()
          ? `${membersSnap.val()?.length || 0} items`
          : null,
        configVal: configSnap.exists() ? "exists" : null,
      });

      return {
        members: membersSnap.exists() ? membersSnap.val() : null,
        config: configSnap.exists() ? configSnap.val() : null,
      };
    } catch (error) {
      console.error("[RealtimeSync] ✗ Erro ao carregar estado inicial:", error);
      return { members: null, config: null };
    }
  }

  /**
   * Configurar listeners para mudanças em tempo real
   * Apenas 2 nós: members (todos os dados) e config (configurações)
   */
  private setupListeners(): void {
    if (!database) return;

    // Listener de membros (única fonte da verdade)
    const membersRef = ref(database, "members");
    const membersUnsubscribe = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Ignorar atualizações da própria sessão
        if (data.updatedBy !== this.sessionId) {
          console.log("[RealtimeSync] 🔄 Membros atualizados remotamente");
          this.eventSystem.emit(EventTypes.SYNC_MEMBERS_UPDATED, data.data);
        }
      }
    });
    this.listeners.set("members", membersUnsubscribe);

    // Listener de configuração
    const configRef = ref(database, "config");
    const configUnsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && data.updatedBy !== this.sessionId) {
          console.log("[RealtimeSync] 🔄 Configuração atualizada remotamente");
          // ✅ PADRÃO MEMBERS: Config usa wrapper 'data'
          // Emitir apenas o conteúdo de 'data', sem metadados
          this.eventSystem.emit(EventTypes.SYNC_CONFIG_UPDATED, data.data);
        }
      }
    });
    this.listeners.set("config", configUnsubscribe);

    console.log("[RealtimeSync] 👂 Listeners configurados (2)");
  }

  /**
   * Remover todos os listeners
   */
  private removeAllListeners(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    console.log("[RealtimeSync] 🔇 Listeners removidos");
  }

  /**
   * Obter informações de status
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    sessionId: string;
    listeners: number;
  } {
    return {
      enabled: this.isEnabled,
      configured: isConfigured,
      sessionId: this.sessionId,
      listeners: this.listeners.size,
    };
  }
}
