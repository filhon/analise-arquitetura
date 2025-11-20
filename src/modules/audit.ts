/**
 * Sistema de Auditoria de Votos
 *
 * Registra todos os votos de forma anônima com:
 * - ID sequencial (0, 1, 2...)
 * - Timestamp de votação
 * - Candidatos selecionados (Presbíteros + Diáconos)
 * - Hash SHA-256 para integridade
 * - Ordem aleatória para preservar anonimato nos relatórios
 *
 * Permite verificação manual e auditoria sem expor identidade dos votantes.
 */

import type { AuditVote } from "@/types";
import { EventTypes, StorageKeys } from "@/types";
import { EventSystem } from "@/utils/events";
import { RealtimeSync } from "@/utils/realtime-sync";
import { MemberManager } from "./members";
import { NotificationService } from "@/ui/notifications";
import { database } from "@/config/firebase";
import { ref, get } from "firebase/database";

export class AuditManager {
  private static instance: AuditManager;
  private eventSystem = EventSystem.getInstance();
  private memberManager = MemberManager.getInstance();
  private votes: AuditVote[] = [];

  static getInstance(): AuditManager {
    if (!AuditManager.instance) {
      AuditManager.instance = new AuditManager();
      // Inicializar dados de forma assíncrona
      AuditManager.instance.initialize();
    }
    return AuditManager.instance;
  }

  private constructor() {
    // Inicialização síncrona básica
    this.setupFirebaseListener();
  }

  /**
   * ✅ NOVO: Inicialização assíncrona
   * Carrega dados do localStorage e Firebase
   */
  private async initialize(): Promise<void> {
    await this.loadFromStorage();
    console.log("[AuditManager] ✅ Inicialização completa");
  }

  /**
   * Configurar listener para atualizações do Firebase
   */
  /**
   * ✅ ATUALIZADO V2: Listener incremental para novos votos do Firebase
   * Escuta evento SYNC_VOTE_ADDED disparado por onChildAdded()
   * Previne race conditions ao processar votos individualmente
   */
  private setupFirebaseListener(): void {
    this.eventSystem.on(EventTypes.SYNC_VOTE_ADDED, (vote: AuditVote) => {
      try {
        console.log(
          `[AuditManager] 🔄 Novo voto recebido do Firebase: ID ${vote.id}`
        );

        // Verificar se voto já existe (prevenir duplicatas)
        const existingVoteIndex = this.votes.findIndex((v) => v.id === vote.id);

        if (existingVoteIndex === -1) {
          // Voto novo: adicionar ao array
          this.votes.push(vote);

          // Ordenar por ID para manter consistência
          this.votes.sort((a, b) => a.id - b.id);

          // Salvar no localStorage (sem re-sincronizar com Firebase para evitar loop)
          localStorage.setItem(
            StorageKeys.AUDIT_LOG,
            JSON.stringify(this.votes)
          );

          console.log(
            `[AuditManager] ✅ Voto ${vote.id} adicionado (total: ${this.votes.length})`
          );

          // Emitir evento para atualizar UI (contador, estatísticas)
          this.eventSystem.emit(EventTypes.VOTE_RECORDED, {
            voteId: vote.id,
          });
        } else {
          console.log(
            `[AuditManager] ⚠️ Voto ${vote.id} já existe localmente, ignorando`
          );
        }
      } catch (error) {
        console.error(
          "[AuditManager] ❌ Erro ao processar novo voto do Firebase:",
          error
        );
      }
    });
  }

  /**
   * ✅ ATUALIZADO: Registrar um voto na auditoria (estrutura incremental)
   * Cada voto é salvo individualmente no Firebase, eliminando race conditions
   *
   * @param presbyteros IDs dos candidatos a Presbítero selecionados
   * @param diaconos IDs dos candidatos a Diácono selecionados
   * @returns ID do voto registrado
   */
  /**
   * ✅ ATUALIZADO: Registrar voto usando transação atômica do Firebase
   * Elimina race conditions ao obter ID de forma atômica
   */
  async recordVote(presbyteros: string[], diaconos: string[]): Promise<number> {
    const realtimeSync = RealtimeSync.getInstance();
    let voteId: number;

    // Obter próximo ID de forma atômica (Firebase Transaction)
    if (realtimeSync.isActive()) {
      try {
        voteId = await realtimeSync.getNextVoteIdAtomic();
        console.log(`[AuditManager] ✅ ID atômico obtido: ${voteId}`);
      } catch (error) {
        console.error(
          "[AuditManager] ❌ Erro ao obter ID atômico, usando fallback local:",
          error
        );
        voteId = this.votes.length;
      }
    } else {
      // Fallback: usar tamanho do array local
      voteId = this.votes.length;
    }

    const timestamp = new Date().toISOString();

    // Gerar hash SHA-256 para integridade
    const hash = await this.generateHash(
      voteId,
      timestamp,
      presbyteros,
      diaconos
    );

    const vote: AuditVote = {
      id: voteId,
      timestamp,
      presbyteros,
      diaconos,
      hash,
    };

    // Adicionar ao array local
    this.votes.push(vote);

    // Salvar no localStorage
    localStorage.setItem(StorageKeys.AUDIT_LOG, JSON.stringify(this.votes));

    // Sincronizar voto individual com Firebase (estrutura incremental)
    if (realtimeSync.isActive()) {
      await realtimeSync.syncVoteToFirebase(vote);
    }

    // Emitir evento para atualizar UI
    this.eventSystem.emit(EventTypes.VOTE_RECORDED, { voteId });

    return voteId;
  }

  /**
   * ✅ NOVO: Calcular próximo ID de voto disponível
   * Usa o maior ID existente + 1 (local ou Firebase)
   *
   * @returns Próximo ID disponível
   */
  private async getNextVoteId(): Promise<number> {
    // Usar o tamanho do array local como fallback
    let nextId = this.votes.length;

    // Tentar obter do Firebase se estiver ativo
    const realtimeSync = RealtimeSync.getInstance();
    if (realtimeSync.isActive()) {
      try {
        const firebaseVotes = await realtimeSync.loadVotesFromFirebase();
        if (firebaseVotes.length > 0) {
          // Usar o maior ID do Firebase + 1
          const maxId = Math.max(...firebaseVotes.map((v) => v.id));
          nextId = Math.max(nextId, maxId + 1);
        }
      } catch (error) {
        console.warn(
          "[AuditManager] ⚠️ Erro ao calcular nextId do Firebase, usando local:",
          error
        );
      }
    }

    return nextId;
  }

  /**
   * Obter contagem total de votos registrados
   */
  /**
   * ✅ V3: Obter contagem de votos (OTIMIZADO - sem validação em background)
   * Retorna imediatamente o valor local para máxima performance
   * Validação apenas sob demanda via validateSync()
   */
  getVotesCount(): number {
    return this.votes.length;
  }

  /**
   * ✅ NOVO: Forçar recarregamento dos votos do Firebase
   * Útil para resolver discrepâncias entre cache local e Firebase
   */
  async reloadFromFirebase(): Promise<void> {
    const realtimeSync = RealtimeSync.getInstance();
    if (!realtimeSync.isActive()) {
      NotificationService.getInstance().show(
        "Firebase não está ativo. Não há dados para recarregar.",
        "warning"
      );
      return;
    }

    try {
      const firebaseVotes = await realtimeSync.loadVotesFromFirebase();
      this.votes = firebaseVotes;
      localStorage.setItem(StorageKeys.AUDIT_LOG, JSON.stringify(this.votes));

      // Notificar UI para atualizar contadores
      EventSystem.getInstance().emit(EventTypes.VOTE_RECORDED, {
        voteId: firebaseVotes.length > 0 ? firebaseVotes.length - 1 : 0,
      });

      NotificationService.getInstance().show(
        `Sincronizado com Firebase: ${firebaseVotes.length} votos carregados`,
        "success"
      );

      console.log(
        `[AuditManager] ✅ Recarregado do Firebase: ${firebaseVotes.length} votos`
      );
    } catch (error) {
      console.error("[AuditManager] ❌ Erro ao recarregar do Firebase:", error);
      NotificationService.getInstance().show(
        "Erro ao sincronizar com Firebase",
        "error"
      );
    }
  }

  /**
   * ✅ NOVO: Validar sincronização sob demanda
   * Chamar apenas quando necessário (ex: antes de gerar relatório)
   */
  async validateSync(): Promise<boolean> {
    const realtimeSync = RealtimeSync.getInstance();
    if (!realtimeSync.isActive()) {
      return true; // Sem Firebase, assume local como correto
    }

    try {
      const firebaseVotes = await realtimeSync.loadVotesFromFirebase();
      const localCount = this.votes.length;
      const firebaseCount = firebaseVotes.length;

      if (firebaseCount !== localCount) {
        // Sincronizar com Firebase (source of truth)
        this.votes = firebaseVotes;
        localStorage.setItem(StorageKeys.AUDIT_LOG, JSON.stringify(this.votes));

        // Emitir evento para atualizar UI
        this.eventSystem.emit(EventTypes.VOTE_RECORDED, {
          voteId: firebaseCount - 1,
        });

        return false; // Houve divergência
      }

      return true; // Sincronizado
    } catch (error) {
      console.error("[AuditManager] ❌ Erro ao validar sincronização:", error);
      return false;
    }
  }

  /**
   * Validar contador local com Firebase (background) - DEPRECATED
   * @deprecated Use validateSync() sob demanda
   */
  private async validateVotesCountWithFirebase(
    localCount: number
  ): Promise<void> {
    if (!database) {
      return; // Firebase não configurado
    }

    const realtimeSync = RealtimeSync.getInstance();

    try {
      // Tentar buscar metadata primeiro (mais leve)
      const metadataRef = ref(database, "audit/metadata");
      const metadataSnapshot = await get(metadataRef);

      if (metadataSnapshot.exists()) {
        const metadata = metadataSnapshot.val();
        const firebaseCount = metadata.totalVotes || 0;

        // Divergência detectada
        if (firebaseCount !== localCount) {
          console.warn(
            `[AuditManager] ⚠️ Contador divergente! Local: ${localCount}, Firebase: ${firebaseCount}`
          );

          // Recarregar votos do Firebase
          const firebaseVotes = await realtimeSync.loadVotesFromFirebase();

          if (firebaseVotes.length > localCount) {
            console.log(
              `[AuditManager] 🔄 Sincronizando ${firebaseVotes.length - localCount} votos faltantes...`
            );

            this.votes = firebaseVotes;
            localStorage.setItem(
              StorageKeys.AUDIT_LOG,
              JSON.stringify(this.votes)
            );

            // Emitir evento para atualizar UI
            this.eventSystem.emit(EventTypes.VOTE_RECORDED, {
              voteId: firebaseVotes.length - 1,
            });

            console.log(
              `[AuditManager] ✅ Contador corrigido: ${this.votes.length} votos`
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "[AuditManager] ❌ Erro ao validar contador com Firebase:",
        error
      );
    }
  }

  /**
   * Obter todos os votos (sem ordem específica)
   */
  getAllVotes(): AuditVote[] {
    return [...this.votes];
  }

  /**
   * Obter votos aleatorizados (para exibição anônima)
   * Preserva anonimato ao embaralhar a ordem
   */
  getRandomizedVotes(): AuditVote[] {
    const votesWithRandom = this.votes.map((vote) => ({
      ...vote,
      randomOrder: Math.random(),
    }));

    return votesWithRandom.sort(
      (a, b) => (a.randomOrder || 0) - (b.randomOrder || 0)
    );
  }

  /**
   * Obter estatísticas de votação por candidato
   * Retorna: { candidateId: { name: string, role: string, votes: number } }
   */
  async getVoteStatistics(): Promise<
    Record<string, { name: string; role: string; votes: number }>
  > {
    const stats: Record<string, { name: string; role: string; votes: number }> =
      {};
    const members = await this.memberManager.getMembers();
    const membersMap = new Map(members.map((m) => [m.id, m]));

    for (const vote of this.votes) {
      // Contar votos para Presbíteros
      for (const candidateId of vote.presbyteros) {
        if (!stats[candidateId]) {
          const member = membersMap.get(candidateId);
          stats[candidateId] = {
            name: member?.nome || "Desconhecido",
            role: "Presbítero",
            votes: 0,
          };
        }
        stats[candidateId].votes++;
      }

      // Contar votos para Diáconos
      for (const candidateId of vote.diaconos) {
        if (!stats[candidateId]) {
          const member = membersMap.get(candidateId);
          stats[candidateId] = {
            name: member?.nome || "Desconhecido",
            role: "Diácono",
            votes: 0,
          };
        }
        stats[candidateId].votes++;
      }
    }

    return stats;
  }

  /**
   * Validar integridade de todos os votos
   * Retorna true se todos os hashes são válidos
   */
  async validateIntegrity(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const vote of this.votes) {
      const expectedHash = await this.generateHash(
        vote.id,
        vote.timestamp,
        vote.presbyteros,
        vote.diaconos
      );

      if (vote.hash !== expectedHash) {
        errors.push(`Voto ${vote.id}: hash inválido (possível adulteração)`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Exportar dados de auditoria completos
   */
  exportAuditLog(): string {
    return JSON.stringify(
      {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        totalVotes: this.votes.length,
        votes: this.votes,
      },
      null,
      2
    );
  }

  /**
   * Importar dados de auditoria
   */
  importAuditLog(jsonData: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonData);

      if (!data.votes || !Array.isArray(data.votes)) {
        return {
          success: false,
          error: "Formato inválido: votes não encontrado",
        };
      }

      this.votes = data.votes;
      this.saveToStorage();

      console.log(`[AuditManager] ✅ ${this.votes.length} votos importados`);
      return { success: true };
    } catch (error) {
      console.error("[AuditManager] Erro ao importar:", error);
      return { success: false, error: "Erro ao processar arquivo JSON" };
    }
  }

  /**
   * Limpar todos os registros de auditoria
   * ⚠️ ATENÇÃO: Esta ação é irreversível!
   */
  clearAllVotes(): void {
    if (
      confirm(
        "⚠️ ATENÇÃO: Tem certeza que deseja apagar TODOS os registros de auditoria? Esta ação é irreversível!"
      )
    ) {
      this.votes = [];
      this.saveToStorage();

      // Limpar Firebase também
      const realtimeSync = RealtimeSync.getInstance();
      if (realtimeSync.isActive()) {
        realtimeSync.clearAuditData().catch((err) => {
          console.warn(
            "[AuditManager] ⚠️ Erro ao limpar audit no Firebase:",
            err
          );
        });
      }

      console.log(
        "[AuditManager] 🗑️ Todos os registros de auditoria foram apagados"
      );
      this.eventSystem.emit(EventTypes.VOTE_RECORDED, { voteId: 0 });
    }
  }

  /**
   * Obter dados estruturados para relatório PDF
   */
  async getReportData(): Promise<{
    totalVotes: number;
    randomizedVotes: AuditVote[];
    statistics: Array<{
      name: string;
      role: string;
      votes: number;
      percentage: string;
    }>;
    integrity: { isValid: boolean; errors: string[] };
  }> {
    const stats = await this.getVoteStatistics();
    const integrity = await this.validateIntegrity();
    const randomizedVotes = this.getRandomizedVotes();

    // Converter stats para array ordenado por votos
    const statisticsArray = Object.entries(stats)
      .map(([_id, data]) => ({
        name: data.name,
        role: data.role,
        votes: data.votes,
        percentage:
          this.votes.length > 0
            ? ((data.votes / this.votes.length) * 100).toFixed(1)
            : "0.0",
      }))
      .sort((a, b) => b.votes - a.votes);

    return {
      totalVotes: this.votes.length,
      randomizedVotes,
      statistics: statisticsArray,
      integrity,
    };
  }

  // ============================================
  // Métodos Privados
  // ============================================

  /**
   * Gerar hash SHA-256 para um voto
   */
  private async generateHash(
    id: number,
    timestamp: string,
    presbyteros: string[],
    diaconos: string[]
  ): Promise<string> {
    const data = JSON.stringify({
      id,
      timestamp,
      presbyteros: presbyteros.sort(),
      diaconos: diaconos.sort(),
    });

    // Usar Web Crypto API para gerar hash SHA-256
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  }

  /**
   * ✅ ATUALIZADO: Carregar votos do localStorage e Firebase
   * Prioriza Firebase, faz merge se necessário
   */
  private async loadFromStorage(): Promise<void> {
    try {
      // Carregar do localStorage
      const stored = localStorage.getItem(StorageKeys.AUDIT_LOG);
      let localVotes: AuditVote[] = [];

      if (stored) {
        localVotes = JSON.parse(stored);
        console.log(
          `[AuditManager] 📥 ${localVotes.length} votos carregados do localStorage`
        );
      }

      // Tentar carregar do Firebase
      const realtimeSync = RealtimeSync.getInstance();
      if (realtimeSync.isActive()) {
        try {
          const firebaseVotes = await realtimeSync.loadVotesFromFirebase();
          console.log(
            `[AuditManager] 🔥 ${firebaseVotes.length} votos carregados do Firebase`
          );

          // ✅ CORREÇÃO: Firebase é SEMPRE a fonte da verdade
          // Independente de quantidade, usar dados do Firebase
          this.votes = firebaseVotes;

          if (localVotes.length !== firebaseVotes.length) {
            console.warn(
              `[AuditManager] ⚠️ Sincronização: localStorage tinha ${localVotes.length} votos, Firebase tem ${firebaseVotes.length}`
            );
          }

          // Atualizar localStorage com dados do Firebase
          localStorage.setItem(
            StorageKeys.AUDIT_LOG,
            JSON.stringify(this.votes)
          );

          console.log(
            `[AuditManager] ✅ Usando ${firebaseVotes.length} votos do Firebase (fonte da verdade)`
          );
        } catch (error) {
          console.warn(
            "[AuditManager] ⚠️ Erro ao carregar do Firebase, usando localStorage como fallback:",
            error
          );
          this.votes = localVotes;
        }
      } else {
        // Firebase inativo, usar local
        console.log("[AuditManager] ⚠️ Firebase inativo, usando localStorage");
        this.votes = localVotes;
      }

      console.log(
        `[AuditManager] ✅ Total: ${this.votes.length} votos carregados`
      );
    } catch (error) {
      console.error("[AuditManager] Erro ao carregar votos:", error);
      this.votes = [];
    }
  }

  /**
   * ✅ ATUALIZADO: Salvar votos no localStorage
   * Firebase é atualizado individualmente em recordVote()
   * @deprecated Este método agora apenas salva localmente
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(StorageKeys.AUDIT_LOG, JSON.stringify(this.votes));
      console.log(
        `[AuditManager] 💾 ${this.votes.length} votos salvos no localStorage`
      );

      // ⚠️ NOTA: Firebase é atualizado individualmente em recordVote()
      // Não usar syncAuditLog() aqui para evitar sobrescrita da estrutura incremental
    } catch (error) {
      console.error("[AuditManager] Erro ao salvar votos:", error);
    }
  }
}
